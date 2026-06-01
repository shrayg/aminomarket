import { Router } from 'express'
import Stripe from 'stripe'
import { createAdminToken, requireAdmin } from '../middleware/admin-auth.js'
import {
  listAnalytics,
  listFulfillments,
  listRegisteredUsers,
  saveFulfillment,
} from '../services/analytics-store.js'

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
    note: fulfillment?.note || '',
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

function buildAnalyticsSummary({ sessions, events, storageMode }, days) {
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
    if (bucket) {
      bucket.visits += 1
      if (session.engaged) bucket.engagedVisits += 1
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

  const engagedSessions = sessions.filter((session) => session.engaged)
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

router.post('/login', (req, res) => {
  try {
    res.json({ token: createAdminToken(req.body?.password, req.ip) })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
})

router.get('/dashboard', requireAdmin, async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30))
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
    analytics: buildAnalyticsSummary(analytics, days),
    stripe: stripeData,
    registeredUsers,
  })
})

router.patch('/orders/:stripeSessionId', requireAdmin, async (req, res) => {
  const status = String(req.body?.status || '')
  if (!FULFILLMENT_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Invalid fulfillment status.' })
  }
  const record = await saveFulfillment(req.params.stripeSessionId, {
    status,
    trackingNumber: req.body?.trackingNumber,
    note: req.body?.note,
  })
  res.json(record)
})

export default router
