import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { getCheckoutItemByLookupKey } from '../catalog.js'

const prisma = new PrismaClient()
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

async function ensureOrderProducts(items) {
  await Promise.all(
    items.map((item) =>
      prisma.product.upsert({
        where: { id: item.id },
        update: { name: item.name, price: item.price, inStock: true },
        create: {
          id: item.id,
          name: item.name,
          slug: `checkout-${item.id}`,
          price: item.price,
          inStock: true,
        },
      })
    )
  )
}

async function markOrderPaid(session) {
  const orderId = session.metadata?.order_id
  if (!orderId || session.payment_status !== 'paid') return

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price'],
  })

  const items = lineItems.data.map((lineItem) => {
    const price = lineItem.price
    const catalogItem = price?.lookup_key
      ? getCheckoutItemByLookupKey(price.lookup_key)
      : null
    if (!catalogItem || !lineItem.quantity || price.unit_amount == null) {
      throw new Error('Stripe line item does not match the storefront catalog')
    }
    return {
      ...catalogItem,
      quantity: lineItem.quantity,
      price: price.unit_amount / 100,
    }
  })

  await ensureOrderProducts(items)
  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId } }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        total: (session.amount_total || 0) / 100,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    }),
  ])
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
