import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

let prisma = null
try {
  prisma = new PrismaClient()
} catch (err) {
  console.warn('Prisma client unavailable in webhook:', err.message)
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

async function markOrderPaid(session) {
  if (!prisma) return
  const orderId = session.metadata?.order_id
  if (!orderId || session.payment_status !== 'paid') return

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        total: (session.amount_total || 0) / 100,
      },
    })
  } catch (err) {
    console.warn(`Could not update order ${orderId}:`, err.message)
  }
}

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
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await markOrderPaid(event.data.object)
    }
    res.json({ received: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
