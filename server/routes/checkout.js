import { Router } from 'express'
import Stripe from 'stripe'
import { getCheckoutItem } from '../catalog.js'

const router = Router()

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

function checkoutError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
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

function resolveBaseUrl(req) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '')
  const origin = req.headers.origin
  if (typeof origin === 'string' && /^https?:\/\//.test(origin)) return origin
  return 'http://localhost:5173'
}

router.post('/', async (req, res) => {
  try {
    const { items, email, analyticsSessionId } = req.body
    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }

    if (!stripe) {
      throw checkoutError(
        'Payments are not configured. Set STRIPE_SECRET_KEY in the environment.',
        503
      )
    }

    const normalizedItems = normalizeItems(items)
    const baseUrl = resolveBaseUrl(req)

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
      customer_creation: 'always',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: email,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US'] },
      automatic_tax: { enabled: false },
      metadata: analyticsSessionId
        ? { analyticsSessionId: String(analyticsSessionId).slice(0, 100) }
        : undefined,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(err.statusCode || 500).json({ error: err.message || 'Checkout failed' })
  }
})

export default router
