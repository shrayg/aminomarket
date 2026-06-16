import { Router } from 'express'

// Shipping-rate quoting is part of the checkout flow and is suspended
// alongside it. Returning 503 here ensures any cached client never
// resurrects a working quote-and-buy path. The original implementation
// lives in git history.
const router = Router()

router.all('*', (_req, res) => {
  res.status(503).json({
    error: 'Amino Market is not currently accepting orders. Shipping quotes are disabled.',
  })
})

export default router
