import { Router } from 'express'
import { requireUser } from '../middleware/user-auth.js'
import {
  applyToBeAffiliate,
  getAffiliateOverview,
  requestPayout,
} from '../services/affiliate.js'

const router = Router()

function handleError(res, err, fallback = 'Request failed.') {
  const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500
  if (status >= 500) console.error('[affiliate]', err)
  res.status(status).json({ error: err?.message || fallback })
}

router.get('/', requireUser, async (req, res) => {
  try {
    const overview = await getAffiliateOverview(req.user.id)
    res.json(overview)
  } catch (err) {
    handleError(res, err, 'Could not load affiliate overview.')
  }
})

router.post('/apply', requireUser, async (req, res) => {
  try {
    const result = await applyToBeAffiliate({
      userId: req.user.id,
      reason: req.body?.reason,
      audience: req.body?.audience,
    })
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Could not submit affiliate application.')
  }
})

router.post('/payout-request', requireUser, async (req, res) => {
  try {
    const result = await requestPayout({
      userId: req.user.id,
      payoutMethod: req.body?.payoutMethod,
    })
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Could not request payout.')
  }
})

export default router
