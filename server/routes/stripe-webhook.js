import Stripe from 'stripe'

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
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  // No database — Stripe Dashboard is the system of record for orders.
  // Log the event so it shows up in Vercel function logs for troubleshooting.
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed':
      console.log(`[stripe] ${event.type} → session=${event.data.object?.id}`)
      break
    default:
      break
  }

  res.json({ received: true })
}
