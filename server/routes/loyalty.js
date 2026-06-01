import { Router } from 'express'
import { requireUser } from '../middleware/user-auth.js'
import { getLoyaltyStatus } from '../services/loyalty.js'

const router = Router()

// Only loyalty progress is exposed to the client. The Stripe customer / coupon
// IDs are deliberately omitted — they are internal handles.
router.get('/', requireUser, async (req, res) => {
  try {
    const status = await getLoyaltyStatus(req.user.id)
    res.json(status)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
