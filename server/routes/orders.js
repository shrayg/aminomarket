import { Router } from 'express'
import { requireUser } from '../middleware/user-auth.js'
import { listOrdersForUser, trackOrder } from '../services/order-store.js'

const router = Router()

router.get('/mine', requireUser, async (req, res) => {
  try {
    res.json(await listOrdersForUser(req.user))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/track', async (req, res) => {
  try {
    if (!req.query.orderId || !req.query.email) {
      return res.status(400).json({ error: 'Order number and email are required.' })
    }
    const order = await trackOrder(req.query.orderId, req.query.email)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
