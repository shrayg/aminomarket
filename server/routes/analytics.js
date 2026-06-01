import { Router } from 'express'
import { recordAnalyticsEvent } from '../services/analytics-store.js'

const router = Router()
const ALLOWED_EVENTS = new Set([
  'page_view',
  'session_update',
  'product_view',
  'shop_search',
  'shop_filter',
  'add_to_cart',
  'checkout_started',
  'checkout_redirect',
  'purchase_return',
])
const requestWindows = new Map()

function allowRequest(ip) {
  const now = Date.now()
  const existing = requestWindows.get(ip)
  if (!existing || existing.resetAt < now) {
    requestWindows.set(ip, { count: 1, resetAt: now + 60 * 1000 })
    return true
  }
  existing.count += 1
  return existing.count <= 240
}

router.post('/events', async (req, res) => {
  try {
    if (!allowRequest(req.ip || 'unknown')) {
      return res.status(429).json({ error: 'Analytics rate limit exceeded.' })
    }
    const { sessionId, visitorId, type } = req.body || {}
    if (
      typeof sessionId !== 'string' ||
      !/^[a-zA-Z0-9_-]{8,100}$/.test(sessionId) ||
      (visitorId && !/^[a-zA-Z0-9_-]{8,100}$/.test(String(visitorId))) ||
      !ALLOWED_EVENTS.has(type)
    ) {
      return res.status(400).json({ error: 'Invalid analytics event.' })
    }

    await recordAnalyticsEvent(req.body)
    res.status(202).json({ accepted: true })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(202).json({ accepted: true })
  }
})

export default router
