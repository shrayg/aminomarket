import Stripe from 'stripe'
import { markAnalyticsConversion } from '../services/analytics-store.js'
import { recordPaidOrder } from '../services/order-store.js'
import { incrementLifetimeSpend } from '../services/loyalty.js'
import { recordRedemptionFromSession } from '../services/affiliate.js'
import {
  notifyFailedPayment,
  notifyPaidCheckout,
  notifyReadyForFulfillment,
} from '../services/discord-notifications.js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function stripeWebhook(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Stripe webhook is not configured' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return res
      .status(400)
      .json({ error: `Webhook signature verification failed: ${error.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: [
            'customer',
            'line_items.data.price.product',
            'payment_intent',
            'total_details.breakdown.discounts',
          ],
        })
        await markAnalyticsConversion(session.metadata?.analyticsSessionId)
        if (session.payment_status === 'paid') {
          await recordPaidOrder(session)
          await notifyPaidCheckout(session, event.type)
          await notifyReadyForFulfillment(session)

          // Loyalty tracking is best-effort: a Supabase or Stripe failure
          // here must not block order fulfillment or cause Stripe to retry
          // the webhook (which would double-notify Discord, etc.).
          const appUserId = session.metadata?.appUserId
          const paidAmountCents = Number(session.amount_total || 0)
          if (appUserId && paidAmountCents > 0) {
            try {
              await incrementLifetimeSpend(appUserId, paidAmountCents, stripe)
            } catch (loyaltyError) {
              console.warn(
                `[loyalty] failed to update lifetime spend for user=${appUserId} session=${session.id}: ${loyaltyError.message}`
              )
            }
          }

          // Affiliate-redemption tracking is also best-effort. Same reasoning:
          // an affiliate-side failure here must never re-trigger Stripe's
          // webhook retries because the order is already fulfilled.
          try {
            await recordRedemptionFromSession(session)
          } catch (affiliateError) {
            console.warn(
              `[affiliate] failed to record redemption for session=${session.id}: ${affiliateError.message}`
            )
          }
        }
        console.log(`[stripe] ${event.type} -> session=${session.id}`)
        break
      }
      case 'checkout.session.async_payment_failed': {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: ['customer', 'line_items.data.price.product', 'payment_intent'],
        })
        await notifyFailedPayment(session, event.type)
        console.log(`[stripe] ${event.type} -> session=${session.id}`)
        break
      }
      case 'payment_intent.payment_failed':
        await notifyFailedPayment(event.data.object, event.type)
        console.log(`[stripe] ${event.type} -> payment_intent=${event.data.object.id}`)
        break
      default:
        break
    }
  } catch (error) {
    console.error(`[stripe] webhook handling failed for ${event.type}: ${error.message}`)
    return res.status(502).json({ error: 'Webhook delivery failed; Stripe should retry.' })
  }

  res.json({ received: true })
}
