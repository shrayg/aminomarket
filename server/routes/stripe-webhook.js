import Stripe from 'stripe'
import { markAnalyticsConversion } from '../services/analytics-store.js'
import { recordPaidOrder } from '../services/order-store.js'
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
          expand: ['customer', 'line_items', 'payment_intent'],
        })
        await markAnalyticsConversion(session.metadata?.analyticsSessionId)
        if (session.payment_status === 'paid') {
          await recordPaidOrder(session)
          await notifyPaidCheckout(session, event.type)
          await notifyReadyForFulfillment(session)
        }
        console.log(`[stripe] ${event.type} -> session=${session.id}`)
        break
      }
      case 'checkout.session.async_payment_failed': {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: ['customer', 'line_items', 'payment_intent'],
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
