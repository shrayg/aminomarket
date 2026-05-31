import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { getCheckoutItem } from '../catalog.js'

const router = Router()
const prisma = new PrismaClient()
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

function checkoutError(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw checkoutError('At least one checkout item is required')
  }

  const mergedItems = new Map()
  for (const item of items) {
    const quantity = Number(item.quantity)
    const catalogItem = typeof item.id === 'string' ? getCheckoutItem(item.id) : null
    if (!catalogItem || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw checkoutError('Invalid checkout item')
    }
    const nextQuantity = (mergedItems.get(catalogItem.id)?.quantity || 0) + quantity
    if (nextQuantity > 99) throw checkoutError('Maximum quantity is 99 per item')
    mergedItems.set(catalogItem.id, { ...catalogItem, quantity: nextQuantity })
  }
  return [...mergedItems.values()]
}

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

async function createPendingOrder(items, email) {
  await ensureOrderProducts(items)
  return prisma.order.create({
    data: {
      email,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: stripe ? 'checkout_pending' : 'pending',
      items: {
        create: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  })
}

async function getStripePrices(items) {
  const pricesByLookupKey = new Map()
  for (let index = 0; index < items.length; index += 10) {
    const lookupKeys = items.slice(index, index + 10).map((item) => item.lookupKey)
    const prices = await stripe.prices.list({ lookup_keys: lookupKeys, active: true, limit: 100 })
    for (const price of prices.data) pricesByLookupKey.set(price.lookup_key, price)
  }

  return items.map((item) => {
    const price = pricesByLookupKey.get(item.lookupKey)
    if (!price || price.unit_amount !== Math.round(item.price * 100)) {
      throw new Error(`Stripe catalog is not synced for ${item.name}`)
    }
    return price
  })
}

router.post('/', async (req, res) => {
  try {
    const { items, email } = req.body
    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }

    const normalizedItems = normalizeItems(items)
    const stripePrices = stripe ? await getStripePrices(normalizedItems) : null
    const order = await createPendingOrder(normalizedItems, email)

    if (!stripe) {
      return res.json({
        orderId: order.id,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?id=${order.id}`,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: normalizedItems.map((item, index) => ({
        price: stripePrices[index].id,
        quantity: item.quantity,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 99,
        },
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      customer_email: email,
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
})

export default router
