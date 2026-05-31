import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { getCheckoutItem } from '../catalog.js'

const router = Router()

let prisma = null
try {
  prisma = new PrismaClient()
} catch (err) {
  console.warn('Prisma client unavailable, orders will not be persisted:', err.message)
}

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

async function persistPendingOrder(items, email) {
  if (!prisma) return null
  try {
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
    return await prisma.order.create({
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
  } catch (err) {
    console.warn('Order persistence failed, continuing without DB record:', err.message)
    return null
  }
}

router.post('/', async (req, res) => {
  try {
    const { items, email } = req.body
    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }

    const normalizedItems = normalizeItems(items)
    const order = await persistPendingOrder(normalizedItems, email)
    const baseUrl =
      process.env.FRONTEND_URL ||
      (req.headers.origin && /^https?:\/\//.test(req.headers.origin)
        ? req.headers.origin
        : 'http://localhost:5173')

    if (!stripe) {
      return res.json({
        orderId: order?.id ?? null,
        url: order
          ? `${baseUrl}/order/success?id=${order.id}`
          : `${baseUrl}/order/success`,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: normalizedItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
      })),
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: email,
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: order?.id ? { order_id: order.id } : undefined,
      payment_intent_data: order?.id
        ? { metadata: { order_id: order.id } }
        : undefined,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(err.statusCode || 500).json({ error: err.message || 'Checkout failed' })
  }
})

export default router
