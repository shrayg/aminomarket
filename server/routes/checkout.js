import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

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

  return items.map((item) => {
    const quantity = Number(item.quantity)
    const price = Number(item.price)

    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99 ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw checkoutError('Invalid checkout item')
    }

    return { ...item, quantity, price }
  })
}

router.post('/', async (req, res) => {
  try {
    const { items, email, shipping } = req.body

    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }
    const normalizedItems = normalizeItems(items)

    if (!stripe) {
      // Demo mode: create order without payment
      const order = await prisma.order.create({
        data: {
          email,
          total: normalizedItems.reduce((s, i) => s + i.price * i.quantity, 0),
          status: 'pending',
          items: {
            create: normalizedItems.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
        include: { items: true },
      })
      return res.json({
        orderId: order.id,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?id=${order.id}`,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: normalizedItems.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
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
      metadata: { shipping: JSON.stringify(shipping || {}) },
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message })
  }
})

export default router
