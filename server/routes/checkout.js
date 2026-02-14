import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const router = Router()
const prisma = new PrismaClient()
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

router.post('/', async (req, res) => {
  try {
    const { items, email, shipping } = req.body

    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }

    if (!stripe) {
      // Demo mode: create order without payment
      const order = await prisma.order.create({
        data: {
          email,
          total: items.reduce((s, i) => s + i.price * i.quantity, 0),
          status: 'pending',
          items: {
            create: items.map((i) => ({
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
      line_items: items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      customer_email: email,
      metadata: { shipping: JSON.stringify(shipping || {}) },
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
