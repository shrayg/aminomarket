// =============================================================================
// shipping-calc.js — Rate-table estimator for the Amino Market checkout
// =============================================================================
//
// This module returns a list of shipping rate options for a given cart +
// destination + subtotal. The numbers are realistic ballpark figures based on
// public USPS / UPS retail rates (mid-2025), NOT live carrier quotes. They
// give the customer a believable price at checkout while the operator pulls
// their actual shipping label cost from the carrier dashboard.
//
// SWAP-IN PATH FOR REAL CARRIER RATES (future work):
//   1. Add an env-var-gated branch at the top of `quoteShipping()`:
//        if (process.env.EASYPOST_API_KEY) return easypostQuote(...)
//        if (process.env.SHIPPO_API_TOKEN) return shippoQuote(...)
//   2. Implement `easypostQuote(parcel, addressTo, addressFrom)` using the
//      EasyPost SDK (`npm i @easypost/api`) or the Shippo SDK (`npm i shippo`).
//      Both aggregators return USPS, UPS, FedEx, and DHL in one call and
//      normalize the rate shape — keep this module's `RateOption` interface
//      stable so the route handler doesn't change.
//   3. Cache live quotes for ~10 minutes keyed on
//      (zipFrom, zipTo, parcelWeightGrams) to avoid hammering the API on every
//      keystroke.
//   4. Keep the fallback table below as a safety net when the API call fails
//      or credentials are absent — never block a checkout because a third-
//      party API timed out.
//
// ASSUMPTIONS (document and revisit before launch):
//   - Per-vial weight is 50g (glass vial + stopper + label). Products in the
//     catalog do not yet expose a `weightGrams` field. When the operator
//     backfills catalog weights, the route will pick them up automatically via
//     the `weightGrams` field on each cart item.
//   - Packaging overhead is 100g (box + ice pack + dunnage). Adjust
//     PACKAGING_OVERHEAD_G when the actual carton is finalized.
//   - We ship FROM Virginia (zone-bucketing assumes VA origin). If we add a
//     second fulfillment node, swap zone resolution for an origin-aware table.
// =============================================================================

const DEFAULT_VIAL_WEIGHT_G = 50
const PACKAGING_OVERHEAD_G = 100
const MAX_CART_QUANTITY = 99
const FREE_SHIP_THRESHOLD_CENTS = 20_000

// ---------------------------------------------------------------------------
// Zone resolution
// ---------------------------------------------------------------------------

const APO_STATES = new Set(['AA', 'AE', 'AP'])

const COUNTRY_TIERS = {
  CA: 'intl_t1', MX: 'intl_t1',
  GB: 'intl_t2', IE: 'intl_t2', DE: 'intl_t2', FR: 'intl_t2', IT: 'intl_t2',
  ES: 'intl_t2', NL: 'intl_t2', BE: 'intl_t2', AT: 'intl_t2', DK: 'intl_t2',
  SE: 'intl_t2', FI: 'intl_t2', NO: 'intl_t2', PT: 'intl_t2', GR: 'intl_t2',
  PL: 'intl_t2', CZ: 'intl_t2', HU: 'intl_t2', SK: 'intl_t2', RO: 'intl_t2',
  BG: 'intl_t2', LT: 'intl_t2', LV: 'intl_t2', EE: 'intl_t2', SI: 'intl_t2',
  HR: 'intl_t2', LU: 'intl_t2', MT: 'intl_t2', CY: 'intl_t2',
  AU: 'intl_t3', NZ: 'intl_t3',
  JP: 'intl_t4', KR: 'intl_t4', SG: 'intl_t4', HK: 'intl_t4', TW: 'intl_t4',
  IL: 'intl_t4', CH: 'intl_t4', AE: 'intl_t4', SA: 'intl_t4', QA: 'intl_t4',
}

function looksLikePoBox(address) {
  if (address.isPoBox === true) return true
  const line1 = String(address.line1 || '').toLowerCase()
  return /\bp\.?\s*o\.?\s*box\b/.test(line1) || /\bpost\s*office\s*box\b/.test(line1)
}

function isApoAddress(address) {
  const state = String(address.state || '').trim().toUpperCase()
  if (APO_STATES.has(state)) return true
  const city = String(address.city || '').trim().toUpperCase()
  return city === 'APO' || city === 'FPO' || city === 'DPO'
}

function usZoneFromZip(zip) {
  const cleaned = String(zip || '').replace(/[^0-9]/g, '').slice(0, 5)
  if (cleaned.length < 3) return 'mid'

  const prefix3 = cleaned.slice(0, 3)
  const first = cleaned[0]

  // Alaska 995-999, Hawaii 967-968, US territories using high prefixes.
  if (prefix3 >= '995' && prefix3 <= '999') return 'pacific'
  if (prefix3 === '967' || prefix3 === '968') return 'pacific'
  // Puerto Rico 006-009, USVI 008, Guam/Samoa 96799/969xx — treat as pacific.
  if (prefix3 >= '006' && prefix3 <= '009') return 'pacific'
  if (prefix3 >= '969' && prefix3 <= '969') return 'pacific'

  // Ship-from: Virginia (zone 2 in USPS terms). Buckets keyed by first digit.
  if (first === '1' || first === '2' || first === '3') return 'near'
  if (first === '0' || first === '4' || first === '5' || first === '6') return 'mid'
  return 'far'
}

function resolveZone(address) {
  const country = String(address.country || 'US').trim().toUpperCase() || 'US'
  if (country !== 'US') {
    return { id: COUNTRY_TIERS[country] || 'intl_t5', isUs: false, isPoBox: false, isApo: false }
  }

  if (isApoAddress(address)) {
    return { id: 'apo', isUs: true, isPoBox: false, isApo: true }
  }

  return {
    id: usZoneFromZip(address.zip || address.postalCode),
    isUs: true,
    isPoBox: looksLikePoBox(address),
    isApo: false,
  }
}

// ---------------------------------------------------------------------------
// Rate tables (cents). Numbers are deliberately conservative round-ups so the
// real label cost is almost always covered by the customer-facing rate.
// ---------------------------------------------------------------------------

const US_RATE_TABLE = {
  // amountCents = base + max(0, weightG - 500) / 100 * perHundredG
  near:    { groundAdv: { base: 595,  perHundredG: 35 }, priority: { base: 832,  perHundredG: 50 }, upsGround: { base: 745,  perHundredG: 45 } },
  mid:     { groundAdv: { base: 715,  perHundredG: 40 }, priority: { base: 932,  perHundredG: 60 }, upsGround: { base: 895,  perHundredG: 50 } },
  far:     { groundAdv: { base: 895,  perHundredG: 50 }, priority: { base: 1140, perHundredG: 70 }, upsGround: { base: 1095, perHundredG: 60 } },
  pacific: { groundAdv: { base: 1245, perHundredG: 65 }, priority: { base: 1495, perHundredG: 90 }, upsGround: { base: 1395, perHundredG: 80 } },
  apo:     { priority:  { base: 1080, perHundredG: 65 } },
}

const INTL_RATE_TABLE = {
  intl_t1: { firstClass: { base: 1495, perHundredG: 75 },  priority: { base: 3895, perHundredG: 150 } },
  intl_t2: { firstClass: { base: 1995, perHundredG: 85 },  priority: { base: 4295, perHundredG: 185 } },
  intl_t3: { firstClass: { base: 2495, perHundredG: 95 },  priority: { base: 4995, perHundredG: 210 } },
  intl_t4: { firstClass: { base: 2295, perHundredG: 90 },  priority: { base: 4595, perHundredG: 200 } },
  intl_t5: { firstClass: { base: 2895, perHundredG: 110 }, priority: { base: 5495, perHundredG: 250 } },
}

const SERVICE_META = {
  groundAdv: {
    carrier: 'USPS',
    service: 'Ground Advantage',
    displayName: 'USPS Ground Advantage',
    estimatedDays: '2–5 business days',
  },
  priority: {
    carrier: 'USPS',
    service: 'Priority Mail',
    displayName: 'USPS Priority Mail',
    estimatedDays: '1–3 business days',
  },
  upsGround: {
    carrier: 'UPS',
    service: 'Ground',
    displayName: 'UPS Ground',
    estimatedDays: '1–5 business days',
  },
  firstClass: {
    carrier: 'USPS',
    service: 'First-Class Package International',
    displayName: 'USPS First-Class Package International',
    estimatedDays: '7–21 business days',
  },
  priorityIntl: {
    carrier: 'USPS',
    service: 'Priority Mail International',
    displayName: 'USPS Priority Mail International',
    estimatedDays: '6–10 business days',
  },
  apoPriority: {
    carrier: 'USPS',
    service: 'Priority Mail (APO/FPO/DPO)',
    displayName: 'USPS Priority Mail — APO/FPO/DPO',
    estimatedDays: '7–10 business days',
  },
}

function rate(base, perHundredG, weightG) {
  const billableExcess = Math.max(0, weightG - 500)
  const surcharge = Math.ceil(billableExcess / 100) * perHundredG
  return base + surcharge
}

// ---------------------------------------------------------------------------
// Weight + input normalization
// ---------------------------------------------------------------------------

function totalParcelWeightGrams(items) {
  let total = PACKAGING_OVERHEAD_G
  for (const item of items) {
    const qty = Number(item.quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_CART_QUANTITY) continue
    const weight = Number(item.weightGrams)
    const perUnit = Number.isFinite(weight) && weight > 0 ? weight : DEFAULT_VIAL_WEIGHT_G
    total += perUnit * qty
  }
  return Math.max(total, PACKAGING_OVERHEAD_G + DEFAULT_VIAL_WEIGHT_G)
}

function normalizeAddress(input) {
  if (!input || typeof input !== 'object') {
    return null
  }
  const country = String(input.country || 'US').trim().toUpperCase() || 'US'
  const zip = String(input.zip ?? input.postalCode ?? '').trim()
  const state = String(input.state || '').trim()
  const city = String(input.city || '').trim()
  const line1 = String(input.line1 || '').trim()
  if (country === 'US' && (!zip || !state || !city)) return null
  if (country !== 'US' && !city) return null
  return {
    line1,
    city,
    state,
    zip,
    country,
    isPoBox: Boolean(input.isPoBox),
  }
}

// ---------------------------------------------------------------------------
// Main entry — returns { rates, parcelWeightGrams, zoneId }
// ---------------------------------------------------------------------------

export function quoteShipping({ items, address, subtotalCents }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw shippingError('At least one cart item is required to quote shipping.')
  }
  const normalizedAddress = normalizeAddress(address)
  if (!normalizedAddress) {
    throw shippingError('A complete shipping address (city, state, ZIP for US) is required.')
  }
  const subtotal = Number(subtotalCents)
  const subtotalSafe = Number.isFinite(subtotal) && subtotal >= 0 ? Math.round(subtotal) : 0

  const parcelWeightGrams = totalParcelWeightGrams(items)
  const zone = resolveZone(normalizedAddress)
  const rates = []

  if (zone.isUs) {
    if (zone.isApo) {
      const apo = US_RATE_TABLE.apo.priority
      rates.push(buildRate('apoPriority', rate(apo.base, apo.perHundredG, parcelWeightGrams)))
    } else {
      const table = US_RATE_TABLE[zone.id] || US_RATE_TABLE.mid
      rates.push(buildRate('groundAdv', rate(table.groundAdv.base, table.groundAdv.perHundredG, parcelWeightGrams)))
      rates.push(buildRate('priority',  rate(table.priority.base,  table.priority.perHundredG,  parcelWeightGrams)))
      if (!zone.isPoBox) {
        rates.push(buildRate('upsGround', rate(table.upsGround.base, table.upsGround.perHundredG, parcelWeightGrams)))
      }
    }
  } else {
    const table = INTL_RATE_TABLE[zone.id] || INTL_RATE_TABLE.intl_t5
    rates.push(buildRate('firstClass', rate(table.firstClass.base, table.firstClass.perHundredG, parcelWeightGrams), 'firstClass'))
    rates.push(buildRate('priorityIntl', rate(table.priority.base, table.priority.perHundredG, parcelWeightGrams), 'priorityIntl'))
  }

  rates.sort((a, b) => a.amountCents - b.amountCents)

  if (zone.isUs && subtotalSafe >= FREE_SHIP_THRESHOLD_CENTS) {
    const cheapestPaid = rates[0]
    if (cheapestPaid) {
      const meta = SERVICE_META[cheapestPaid.serviceKey] || SERVICE_META.groundAdv
      rates.unshift({
        serviceKey: cheapestPaid.serviceKey,
        carrier: meta.carrier,
        service: meta.service,
        displayName: `${meta.displayName} — FREE (orders $200+)`,
        amountCents: 0,
        estimatedDays: meta.estimatedDays,
      })
    }
  }

  return {
    rates,
    parcelWeightGrams,
    zoneId: zone.id,
  }
}

function buildRate(serviceKey, amountCents, overrideKey) {
  const meta = SERVICE_META[overrideKey || serviceKey]
  return {
    serviceKey: overrideKey || serviceKey,
    carrier: meta.carrier,
    service: meta.service,
    displayName: meta.displayName,
    amountCents: Math.round(amountCents),
    estimatedDays: meta.estimatedDays,
  }
}

function shippingError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const SHIPPING_CONSTANTS = {
  DEFAULT_VIAL_WEIGHT_G,
  PACKAGING_OVERHEAD_G,
  FREE_SHIP_THRESHOLD_CENTS,
}
