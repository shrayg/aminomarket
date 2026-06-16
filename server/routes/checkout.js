import { Router } from 'express'

// Sales are intentionally suspended. Any client that tries to start a
// Stripe Checkout Session against this endpoint must be rejected with a
// 503 — never just degrade silently to memory-only state. The previous
// Stripe + shipping-quote integration lives in git history; restoring
// commerce means restoring that file *and* re-enabling the matching
// client-side cart / checkout pages and the cart icon in the header.
const router = Router()

const NOT_ACCEPTING = {
  error: 'Amino Market is not currently accepting orders. Checkout is disabled.',
}

router.all('*', (_req, res) => {
  res.status(503).json(NOT_ACCEPTING)
})

export default router
