import { Router } from 'express'
import { getCheckoutItem } from '../catalog.js'
import { quoteShipping, SHIPPING_CONSTANTS } from '../services/shipping-calc.js'

const router = Router()

function clean(value, maxLength = 120) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function normalizeItem(raw) {
  const id = typeof raw?.id === 'string' ? raw.id : null
  const quantity = Number(raw?.quantity)
  if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null
  const catalogItem = getCheckoutItem(id)
  if (!catalogItem) return null
  const declaredWeight = Number(raw.weightGrams)
  const weightGrams = Number.isFinite(declaredWeight) && declaredWeight > 0
    ? declaredWeight
    : SHIPPING_CONSTANTS.DEFAULT_VIAL_WEIGHT_G
  return {
    id: catalogItem.id,
    quantity,
    weightGrams,
    priceCents: Math.round(Number(catalogItem.price) * 100),
  }
}

function normalizeAddressInput(raw) {
  if (!raw || typeof raw !== 'object') return null
  const country = clean(raw.country, 2).toUpperCase() || 'US'
  return {
    line1: clean(raw.line1, 180),
    line2: clean(raw.line2, 180),
    city: clean(raw.city, 80),
    state: clean(raw.state, 40),
    zip: clean(raw.zip ?? raw.postalCode, 20),
    country,
    isPoBox: Boolean(raw.isPoBox),
  }
}

router.post('/', (req, res) => {
  try {
    const body = req.body || {}
    const rawItems = Array.isArray(body.items) ? body.items : []
    const items = rawItems.map(normalizeItem).filter(Boolean)
    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or contains unknown items.' })
    }

    const address = normalizeAddressInput(body.address)
    if (!address) {
      return res.status(400).json({ error: 'Shipping address is required.' })
    }
    if (address.country === 'US' && (!address.zip || !address.state || !address.city)) {
      return res.status(400).json({ error: 'US shipping requires city, state, and ZIP.' })
    }

    const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)

    const quote = quoteShipping({ items, address, subtotalCents })
    res.json({
      rates: quote.rates,
      parcelWeightGrams: quote.parcelWeightGrams,
      zoneId: quote.zoneId,
      subtotalCents,
    })
  } catch (err) {
    const status = err.statusCode || 500
    if (status >= 500) console.error('Quote error:', err)
    res.status(status).json({ error: err.message || 'Could not quote shipping.' })
  }
})

export default router
