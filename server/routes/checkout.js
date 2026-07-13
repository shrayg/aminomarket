import { Router } from 'express'
import Stripe from 'stripe'
import { getCheckoutItem } from '../catalog.js'
import { getRequestUser } from '../middleware/user-auth.js'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'
import { quoteShipping, SHIPPING_CONSTANTS } from '../services/shipping-calc.js'
import { ensureStripeCustomerForUser } from '../services/loyalty.js'

const router = Router()

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

function checkoutError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function clean(value, maxLength = 120) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw checkoutError('At least one checkout item is required')
  }

  const mergedItems = new Map()
  for (const item of items) {
    const quantity = Number(item.quantity)
    const catalogItem = typeof item.id === 'string' ? getCheckoutItem(item.id) : null
    if (!catalogItem || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw checkoutError('Invalid checkout item')
    }
    const nextQuantity = (mergedItems.get(catalogItem.id)?.quantity || 0) + quantity
    if (nextQuantity > 99) throw checkoutError('Maximum quantity is 99 per item')
    mergedItems.set(catalogItem.id, { ...catalogItem, quantity: nextQuantity })
  }
  return [...mergedItems.values()]
}

function resolveBaseUrl(req) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '')
  const origin = req.headers.origin
  if (typeof origin === 'string' && /^https?:\/\//.test(origin)) return origin
  return 'http://localhost:5173'
}

function normalizeShippingAddress(raw) {
  if (!raw || typeof raw !== 'object') return null
  const country = clean(raw.country, 2).toUpperCase() || 'US'
  return {
    recipientName: clean(raw.recipientName ?? raw.name, 120),
    line1: clean(raw.line1, 180),
    line2: clean(raw.line2, 180),
    city: clean(raw.city, 80),
    state: clean(raw.state, 40),
    zip: clean(raw.zip ?? raw.postalCode, 20),
    country,
    isPoBox: Boolean(raw.isPoBox),
  }
}

function normalizeSelectedRate(raw) {
  if (!raw || typeof raw !== 'object') return null
  const amountCents = Number(raw.amountCents)
  if (!Number.isInteger(amountCents) || amountCents < 0 || amountCents > 50_000) return null
  return {
    carrier: clean(raw.carrier, 24),
    service: clean(raw.service, 80),
    displayName: clean(raw.displayName, 120),
    amountCents,
  }
}

router.post('/', async (req, res) => {
  try {
    const {
      items,
      email,
      analyticsSessionId,
      shipping,
      selectedRate,
      ruoAcknowledged,
      marketingOptIn,
    } = req.body || {}

    if (!items?.length || !email) {
      return res.status(400).json({ error: 'Items and email required' })
    }

    if (!stripe) {
      throw checkoutError(
        'Payments are not configured. Set STRIPE_SECRET_KEY in the environment.',
        503
      )
    }

    if (ruoAcknowledged !== true) {
      throw checkoutError('You must confirm the order acknowledgment to continue.')
    }

    const shippingAddress = normalizeShippingAddress(shipping)
    if (!shippingAddress) {
      throw checkoutError('A shipping address is required.')
    }
    if (!shippingAddress.recipientName || !shippingAddress.line1 || !shippingAddress.city) {
      throw checkoutError('Recipient, street address, and city are required.')
    }
    if (shippingAddress.country === 'US' && (!shippingAddress.state || !shippingAddress.zip)) {
      throw checkoutError('US shipping requires state and ZIP code.')
    }

    const clientRate = normalizeSelectedRate(selectedRate)
    if (!clientRate) {
      throw checkoutError('A shipping option must be selected.')
    }

    const normalizedItems = normalizeItems(items)
    const subtotalCents = normalizedItems.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    )

    // Recompute server-side and validate that the rate the client posted is one
    // we would have returned for the same cart+address. NEVER trust the
    // client-supplied amount — Stripe will charge whatever we tell it to.
    const recomputed = quoteShipping({
      items: normalizedItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        weightGrams: SHIPPING_CONSTANTS.DEFAULT_VIAL_WEIGHT_G,
      })),
      address: shippingAddress,
      subtotalCents,
    })
    const matchedRate = recomputed.rates.find((option) => (
      option.carrier === clientRate.carrier &&
      option.service === clientRate.service &&
      Math.abs(option.amountCents - clientRate.amountCents) <= 1
    ))
    if (!matchedRate) {
      throw checkoutError('Selected shipping option is no longer available. Please re-quote.')
    }

    const baseUrl = resolveBaseUrl(req)
    const account = getRequestUser(req)
    const checkoutEmail = account?.email || String(email).trim().toLowerCase()

    // For signed-in users, resolve (or lazily create) a Stripe Customer so
    // any loyalty coupon attached to that customer auto-applies on this and
    // every future Checkout Session. Best-effort: a Stripe/Supabase blip
    // here must not block checkout — fall back to guest behavior.
    let stripeCustomerId = null
    if (account?.id) {
      try {
        const { data: appUser, error: appUserError } = await getSupabase()
          .from('app_users')
          .select('id, email, name, stripe_customer_id')
          .eq('id', account.id)
          .maybeSingle()
        throwIfSupabaseError(appUserError)
        if (appUser) {
          stripeCustomerId = await ensureStripeCustomerForUser(appUser, stripe)
        }
      } catch (customerError) {
        console.warn(
          `[checkout] could not resolve Stripe customer for user=${account.id}: ${customerError.message}`
        )
        stripeCustomerId = null
      }
    }

    const metadata = {}
    if (analyticsSessionId) metadata.analyticsSessionId = String(analyticsSessionId).slice(0, 100)
    if (account?.id) {
      metadata.appUserId = account.id
      // Also expose under snake_case so external integrations / reporting
      // queries can rely on a single canonical key.
      metadata.app_user_id = account.id
    }
    metadata.ruoAcknowledged = '1'
    metadata.shippingCarrier = matchedRate.carrier
    metadata.shippingService = matchedRate.service
    metadata.shippingZone = recomputed.zoneId
    metadata.parcelWeightGrams = String(recomputed.parcelWeightGrams)
    if (marketingOptIn && typeof marketingOptIn === 'object') {
      if (marketingOptIn.email === true) metadata.marketingEmailOptIn = '1'
      if (marketingOptIn.sms === true) metadata.marketingSmsOptIn = '1'
    }

    const shippingOptions = [{
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: matchedRate.amountCents, currency: 'usd' },
        display_name: matchedRate.displayName,
        delivery_estimate: matchedRate.estimatedDays ? {
          minimum: { unit: 'business_day', value: 1 },
          maximum: { unit: 'business_day', value: 21 },
        } : undefined,
      },
    }]

    const allowedCountries = shippingAddress.country === 'US'
      ? ['US']
      : [shippingAddress.country, 'US']

    const sessionPayload = {
      payment_method_types: ['card'],
      line_items: normalizedItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            metadata: {
              catalogItemId: item.id,
              estimatedUnitCostCents: String(item.estimatedUnitCostCents),
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
      })),
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: allowedCountries },
      shipping_options: shippingOptions,
      automatic_tax: { enabled: false },
      metadata: Object.keys(metadata).length ? metadata : undefined,
    }

    // Stripe rejects `customer` together with `customer_email` /
    // `customer_creation`, so pick exactly one branch.
    if (stripeCustomerId) {
      sessionPayload.customer = stripeCustomerId
    } else {
      sessionPayload.customer_creation = 'always'
      sessionPayload.customer_email = checkoutEmail
    }

    const session = await stripe.checkout.sessions.create(sessionPayload)

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(err.statusCode || 500).json({ error: err.message || 'Checkout failed' })
  }
})

export default router
