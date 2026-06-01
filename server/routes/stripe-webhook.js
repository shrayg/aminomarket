import Stripe from 'stripe'
import { markAnalyticsConversion } from '../services/analytics-store.js'

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

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await markAnalyticsConversion(event.data.object?.metadata?.analyticsSessionId)
      console.log(`[stripe] ${event.type} -> session=${event.data.object?.id}`)
      break
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed':
      console.log(`[stripe] ${event.type} -> session=${event.data.object?.id}`)
      break
    default:
      break
  }

  res.json({ received: true })
}
