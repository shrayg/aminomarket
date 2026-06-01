import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import Stripe from 'stripe'
import { createAdminToken, requireAdmin } from '../middleware/admin-auth.js'
import {
  encodeBatchNote,
  getFulfillment,
  listAnalytics,
  listFulfillments,
  listRegisteredUsers,
  parseBatchFromNote,
  saveFulfillment,
} from '../services/analytics-store.js'
import { getCurrentHourCode, postCodeToDiscord } from '../services/admin-code.js'
import { postManufactureBatch } from '../services/manufacture-discord.js'

const router = Router()
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
const FULFILLMENT_STATUSES = new Set([
  'unfulfilled',
  'processing',
  'shipping',
  'fulfilled',
  'cancelled',
])

function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function centsToDollars(value) {
  return Math.round(Number(value || 0)) / 100
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount)
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function addressForDashboard(address) {
  if (!address) return null
  return {
    line1: address.line1 || '',
    line2: address.line2 || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postal_code || '',
    country: address.country || '',
  }
}

function normalizeOrder(session, fulfillmentById) {
  const shipping = session.shipping_details || session.collected_information?.shipping_details
  const customerDetails = session.customer_details || {}
  const fulfillment = fulfillmentById.get(session.id)
  const lineItems = session.line_items?.data || []
  const batch = parseBatchFromNote(fulfillment?.note || '')

  return {
    id: session.id,
    createdAt: new Date(session.created * 1000).toISOString(),
    email: customerDetails.email || session.customer_email || '',
    customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
    customerName: customerDetails.name || shipping?.name || '',
    phone: customerDetails.phone || '',
    total: centsToDollars(session.amount_total),
    currency: String(session.currency || 'usd').toUpperCase(),
    checkoutStatus: session.status || 'unknown',
    paymentStatus: session.payment_status || 'unknown',
    fulfillmentStatus: fulfillment?.status || 'unfulfilled',
    trackingNumber: fulfillment?.trackingNumber || '',
    note: batch.userNote,
    batchId: batch.batchId,
    batchedAt: batch.batchedAt,
    shipping: shipping
      ? { name: shipping.name || '', address: addressForDashboard(shipping.address) }
      : null,
    billing: customerDetails.address
      ? { name: customerDetails.name || '', address: addressForDashboard(customerDetails.address) }
      : null,
    items: lineItems.map((item) => ({
      name: item.description || 'Item',
      quantity: item.quantity || 1,
      total: centsToDollars(item.amount_total),
    })),
  }
}

// Allowed thresholds for what counts as an "engaged" visit (operator-tunable
// from the dashboard). Kept tight so we can never blow up the daily-bucket
// engagedVisits counter with arbitrary values.
const ENGAGED_THRESHOLD_OPTIONS = [5, 15, 60]
const DEFAULT_ENGAGED_THRESHOLD_SECONDS = 5

function normalizeEngagedThreshold(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return DEFAULT_ENGAGED_THRESHOLD_SECONDS
  return ENGAGED_THRESHOLD_OPTIONS.includes(numeric)
    ? numeric
    : DEFAULT_ENGAGED_THRESHOLD_SECONDS
}

function buildAnalyticsSummary({ sessions, events, storageMode }, days, engagedThresholdSeconds) {
  const threshold = normalizeEngagedThreshold(engagedThresholdSeconds)
  const daily = new Map()
  const paths = new Map()
  const traffic = new Map()
  const products = new Map()
  const searches = new Map()
  const eventCounts = new Map()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000)
    daily.set(dayKey(date), {
      date: dayKey(date),
      visits: 0,
      engagedVisits: 0,
      productViews: 0,
      checkoutStarts: 0,
    })
  }

  for (const session of sessions) {
    const date = dayKey(session.startedAt)
    const bucket = daily.get(date)
    const isEngaged = (session.durationSeconds || 0) >= threshold
    if (bucket) {
      bucket.visits += 1
      if (isEngaged) bucket.engagedVisits += 1
    }
    increment(traffic, session.source || 'direct')
  }

  for (const event of events) {
    increment(eventCounts, event.type)
    const date = dayKey(event.createdAt)
    const bucket = daily.get(date)
    if (event.type === 'page_view') increment(paths, event.path || '/')
    if (event.type === 'product_view') {
      if (bucket) bucket.productViews += 1
      const product = products.get(event.productSlug) || {
        slug: event.productSlug || 'unknown',
        views: 0,
        addsToCart: 0,
      }
      product.views += 1
      products.set(product.slug, product)
    }
    if (event.type === 'add_to_cart') {
      const product = products.get(event.productSlug) || {
        slug: event.productSlug || 'unknown',
        views: 0,
        addsToCart: 0,
      }
      product.addsToCart += 1
      products.set(product.slug, product)
    }
    if (event.type === 'checkout_started' && bucket) bucket.checkoutStarts += 1
    if (event.type === 'shop_search' && event.query) {
      const key = event.query.toLowerCase()
      const current = searches.get(key) || { query: event.query, count: 0, zeroResults: 0 }
      current.count += 1
      if (Number(event.metadata?.resultCount) === 0) current.zeroResults += 1
      searches.set(key, current)
    }
  }

  const engagedSessions = sessions.filter(
    (session) => (session.durationSeconds || 0) >= threshold
  )
  const checkoutSessions = sessions.filter((session) => session.checkoutStarted)
  const convertedSessions = sessions.filter((session) => session.converted)
  const averageEngagedSeconds = engagedSessions.length
    ? Math.round(
        engagedSessions.reduce((sum, session) => sum + session.durationSeconds, 0) /
          engagedSessions.length
      )
    : 0

  return {
    storageMode,
    engagedThresholdSeconds: threshold,
    metrics: {
      visits: sessions.length,
      pageViews: eventCounts.get('page_view') || 0,
      engagedVisits: engagedSessions.length,
      averageEngagedSeconds,
      productViews: eventCounts.get('product_view') || 0,
      addToCarts: eventCounts.get('add_to_cart') || 0,
      checkoutStarts: checkoutSessions.length,
      trackedConversions: convertedSessions.length,
    },
    daily: [...daily.values()],
    topPaths: topEntries(paths),
    trafficSources: topEntries(traffic),
    products: [...products.values()].sort(
      (a, b) => b.views + b.addsToCart * 3 - (a.views + a.addsToCart * 3)
    ),
    searches: [...searches.values()].sort((a, b) => b.count - a.count),
  }
}

async function stripeSummary(days, fulfillmentById) {
  if (!stripe) {
    return {
      configured: false,
      warning: 'Stripe is not configured in this environment.',
      orders: [],
      customers: [],
      metrics: { paidOrders: 0, revenue: 0, averageOrderValue: 0, openCheckouts: 0 },
      dailyRevenue: [],
      paymentStatuses: [],
      purchasedProducts: [],
    }
  }

  try {
    const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
    const response = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: since },
      expand: ['data.line_items'],
    })
    const orders = response.data.map((session) => normalizeOrder(session, fulfillmentById))
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid')
    const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const dailyRevenue = new Map()
    const paymentStatuses = new Map()
    const purchasedProducts = new Map()
    const customers = new Map()

    for (const order of orders) {
      increment(paymentStatuses, order.paymentStatus)
      if (order.paymentStatus === 'paid') increment(dailyRevenue, order.createdAt.slice(0, 10), order.total)
      if (order.paymentStatus === 'paid') {
        for (const item of order.items) {
          increment(purchasedProducts, item.name, item.quantity)
        }
      }
      const customerKey = order.customerId || order.email || order.id
      const customer = customers.get(customerKey) || {
        id: customerKey,
        stripeCustomerId: order.customerId,
        email: order.email,
        name: order.customerName,
        phone: order.phone,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: order.createdAt,
        shipping: order.shipping,
        billing: order.billing,
      }
      customer.orderCount += 1
      if (order.paymentStatus === 'paid') customer.totalSpent += order.total
      if (order.createdAt > customer.lastOrderAt) customer.lastOrderAt = order.createdAt
      if (order.shipping) customer.shipping = order.shipping
      if (order.billing) customer.billing = order.billing
      customers.set(customerKey, customer)
    }

    return {
      configured: true,
      warning: response.has_more
        ? 'Showing the most recent 100 Stripe Checkout sessions for this period.'
        : null,
      orders,
      customers: [...customers.values()].sort((a, b) => b.totalSpent - a.totalSpent),
      metrics: {
        paidOrders: paidOrders.length,
        revenue,
        averageOrderValue: paidOrders.length ? revenue / paidOrders.length : 0,
        openCheckouts: orders.filter((order) => order.checkoutStatus === 'open').length,
      },
      dailyRevenue: topEntries(dailyRevenue, days).sort((a, b) => a.name.localeCompare(b.name)),
      paymentStatuses: topEntries(paymentStatuses),
      purchasedProducts: topEntries(purchasedProducts),
    }
  } catch (error) {
    console.error('Stripe admin read error:', error)
    return {
      configured: true,
      warning: `Stripe data could not be loaded: ${error.message}`,
      orders: [],
      customers: [],
      metrics: { paidOrders: 0, revenue: 0, averageOrderValue: 0, openCheckouts: 0 },
      dailyRevenue: [],
      paymentStatuses: [],
      purchasedProducts: [],
    }
  }
}

function cronOrAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const cronSecret = process.env.CRON_SECRET
  if (token && cronSecret && token === cronSecret) return next()
  return requireAdmin(req, res, next)
}

router.get('/code', requireAdmin, (_req, res) => {
  res.json(getCurrentHourCode())
})

// Vercel Cron hits this hourly via GET; admin UI can also trigger via POST
async function notifyHandler(_req, res) {
  const codeInfo = getCurrentHourCode()
  const delivery = await postCodeToDiscord(codeInfo)
  res.json({ ...codeInfo, delivery })
}

router.get('/code/notify', cronOrAdmin, notifyHandler)
router.post('/code/notify', cronOrAdmin, notifyHandler)

router.post('/login', (req, res) => {
  try {
    const { token, expiresAt } = createAdminToken(req.body?.password, req.ip)
    res.json({ token, expiresAt })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
})

router.get('/dashboard', requireAdmin, async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30))
  const engagedThresholdSeconds = normalizeEngagedThreshold(req.query.engagedThreshold)
  const [analytics, fulfillments, registeredUsers] = await Promise.all([
    listAnalytics(days),
    listFulfillments(),
    listRegisteredUsers(),
  ])
  const fulfillmentById = new Map(
    fulfillments.map((record) => [record.stripeSessionId, record])
  )
  const stripeData = await stripeSummary(days, fulfillmentById)

  res.json({
    generatedAt: new Date().toISOString(),
    days,
    engagedThresholdSeconds,
    analytics: buildAnalyticsSummary(analytics, days, engagedThresholdSeconds),
    stripe: stripeData,
    registeredUsers,
  })
})

router.patch('/orders/:stripeSessionId', requireAdmin, async (req, res) => {
  const status = String(req.body?.status || '')
  if (!FULFILLMENT_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Invalid fulfillment status.' })
  }

  // Preserve any existing batch prefix so historical "which batch did this
  // ship in" info isn't lost when an operator edits the note.
  const existing = await getFulfillment(req.params.stripeSessionId)
  const existingBatch = parseBatchFromNote(existing?.note || '')
  const incomingUserNote = req.body?.note != null ? String(req.body.note) : existingBatch.userNote
  const note = encodeBatchNote(existingBatch.batchId, existingBatch.batchedAt, incomingUserNote)

  const record = await saveFulfillment(req.params.stripeSessionId, {
    status,
    trackingNumber: req.body?.trackingNumber,
    note,
  })
  res.json(record)
})

// ---------------------------------------------------------------------------
// Manufacture batches: aggregate paid+unfulfilled orders, ship them off to the
// production team, and group the resulting "processing" orders by batch.
// ---------------------------------------------------------------------------

async function loadOrdersWithFulfillment(days = 60) {
  if (!stripe) return []
  const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
  const response = await stripe.checkout.sessions.list({
    limit: 100,
    created: { gte: since },
    expand: ['data.line_items'],
  })
  const fulfillments = await listFulfillments()
  const fulfillmentById = new Map(fulfillments.map((record) => [record.stripeSessionId, record]))
  return response.data.map((session) => normalizeOrder(session, fulfillmentById))
}

function aggregateLineItems(orders) {
  const map = new Map()
  let totalUnits = 0
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.name
      const current = map.get(key) || { name: key, quantity: 0 }
      current.quantity += item.quantity || 0
      totalUnits += item.quantity || 0
      map.set(key, current)
    }
  }
  return {
    lines: [...map.values()].sort((a, b) => b.quantity - a.quantity),
    totalUnits,
  }
}

router.get('/manufacture/queue', requireAdmin, async (_req, res) => {
  if (!stripe) {
    return res.json({
      configured: false,
      orders: [],
      aggregate: { lines: [], totalUnits: 0 },
    })
  }
  const orders = await loadOrdersWithFulfillment(60)
  const queue = orders.filter(
    (order) => order.paymentStatus === 'paid' && order.fulfillmentStatus === 'unfulfilled'
  )
  const aggregate = aggregateLineItems(queue)
  res.json({
    configured: true,
    generatedAt: new Date().toISOString(),
    orders: queue,
    aggregate,
  })
})

router.post('/manufacture/batches', requireAdmin, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured.' })
  }
  const sessionIds = Array.isArray(req.body?.sessionIds)
    ? req.body.sessionIds.map((id) => String(id)).filter(Boolean)
    : []
  if (sessionIds.length === 0) {
    return res.status(400).json({ error: 'sessionIds is required and must be a non-empty array.' })
  }
  if (!req.body?.screenshot) {
    return res.status(400).json({ error: 'screenshot (base64 data URL) is required.' })
  }

  // Re-validate every session is actually paid + unfulfilled before
  // transitioning, so a stale UI can't push the wrong rows into processing.
  const orders = await loadOrdersWithFulfillment(60)
  const orderById = new Map(orders.map((order) => [order.id, order]))
  const eligible = []
  const skipped = []
  for (const id of sessionIds) {
    const order = orderById.get(id)
    if (!order) {
      skipped.push({ id, reason: 'not-found' })
    } else if (order.paymentStatus !== 'paid') {
      skipped.push({ id, reason: 'not-paid' })
    } else if (order.fulfillmentStatus !== 'unfulfilled') {
      skipped.push({ id, reason: `already-${order.fulfillmentStatus}` })
    } else {
      eligible.push(order)
    }
  }
  if (eligible.length === 0) {
    return res.status(409).json({
      error: 'No eligible orders in the submitted list (already moved or unpaid).',
      skipped,
    })
  }

  const batchId = randomUUID()
  const batchedAt = new Date().toISOString()
  const aggregate = aggregateLineItems(eligible)

  const delivery = await postManufactureBatch({
    batchId,
    batchedAt,
    orderCount: eligible.length,
    totalUnits: aggregate.totalUnits,
    productLines: aggregate.lines,
    screenshot: req.body.screenshot,
    filename: req.body.filename,
    note: req.body.note,
  })

  if (!delivery.sent) {
    return res.status(502).json({
      error: 'Discord upload failed; no orders were transitioned.',
      delivery,
    })
  }

  // Discord post succeeded; flip every eligible order to processing.
  const updated = []
  for (const order of eligible) {
    try {
      const note = encodeBatchNote(batchId, batchedAt, order.note || '')
      await saveFulfillment(order.id, {
        status: 'processing',
        trackingNumber: order.trackingNumber,
        note,
      })
      updated.push(order.id)
    } catch (err) {
      console.error('Failed to mark order processing', order.id, err)
    }
  }

  res.json({
    batchId,
    batchedAt,
    orderCount: updated.length,
    totalUnits: aggregate.totalUnits,
    orders: updated,
    skipped,
    aggregate,
    delivery,
  })
})

export default router
