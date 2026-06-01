import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

function normalizedEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function address(value) {
  if (!value) return null
  return {
    line1: value.line1 || '',
    line2: value.line2 || '',
    city: value.city || '',
    state: value.state || '',
    postalCode: value.postal_code || '',
    country: value.country || '',
  }
}

function shippingDetails(session) {
  return session.shipping_details || session.collected_information?.shipping_details || null
}

function itemsFor(session) {
  return (session.line_items?.data || []).map((item) => ({
    name: item.description || 'Item',
    quantity: item.quantity || 1,
    total: Number(item.amount_total || 0) / 100,
  }))
}

function mapOrder(row, fulfillment) {
  return {
    id: row.stripe_session_id || row.id,
    createdAt: row.created_at,
    total: Number(row.total || 0),
    currency: row.currency || 'USD',
    paymentStatus: row.payment_status || 'paid',
    fulfillmentStatus: fulfillment?.status || row.status || 'unfulfilled',
    trackingNumber: fulfillment?.tracking_number || '',
    items: Array.isArray(row.items) ? row.items : [],
    shipping: row.shipping || null,
  }
}

async function accountIdForSession(session) {
  const metadataId = session.metadata?.appUserId
  if (metadataId) return String(metadataId)

  const email = normalizedEmail(session.customer_details?.email || session.customer_email)
  if (!email) return null
  const { data, error } = await getSupabase()
    .from('app_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  throwIfSupabaseError(error)
  return data?.id || null
}

async function fulfillmentMap(ids) {
  if (!ids.length) return new Map()
  const { data, error } = await getSupabase()
    .from('fulfillment_records')
    .select('stripe_session_id, status, tracking_number')
    .in('stripe_session_id', ids)
  throwIfSupabaseError(error)
  return new Map((data || []).map((record) => [record.stripe_session_id, record]))
}

export async function recordPaidOrder(session) {
  const shipping = shippingDetails(session)
  const customer = session.customer_details || {}
  const email = normalizedEmail(customer.email || session.customer_email)
  if (!email) throw new Error('Paid checkout did not include a customer email.')

  const { error } = await getSupabase()
    .from('orders')
    .upsert({
      stripe_session_id: session.id,
      user_id: await accountIdForSession(session),
      email,
      total: Number(session.amount_total || 0) / 100,
      currency: String(session.currency || 'usd').toUpperCase(),
      checkout_status: session.status || 'complete',
      payment_status: session.payment_status || 'paid',
      status: 'unfulfilled',
      items: itemsFor(session),
      shipping: shipping ? { name: shipping.name || '', address: address(shipping.address) } : null,
      billing: customer.address ? { name: customer.name || '', address: address(customer.address) } : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_session_id' })
  throwIfSupabaseError(error)
}

export async function listOrdersForUser(user) {
  const columns = 'id, stripe_session_id, total, currency, payment_status, status, items, shipping, created_at'
  const db = getSupabase()
  const [accountOrders, guestOrders] = await Promise.all([
    db
      .from('orders')
      .select(columns)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    db
      .from('orders')
      .select(columns)
      .is('user_id', null)
      .eq('email', normalizedEmail(user.email))
      .order('created_at', { ascending: false }),
  ])
  throwIfSupabaseError(accountOrders.error)
  throwIfSupabaseError(guestOrders.error)

  const data = [...accountOrders.data, ...guestOrders.data]
    .filter((order, index, orders) => (
      orders.findIndex((candidate) => candidate.stripe_session_id === order.stripe_session_id) === index
    ))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const fulfillments = await fulfillmentMap(
    data.map((order) => order.stripe_session_id).filter(Boolean)
  )
  return data.map((order) => mapOrder(order, fulfillments.get(order.stripe_session_id)))
}

export async function trackOrder(orderId, email) {
  const { data: order, error } = await getSupabase()
    .from('orders')
    .select('id, stripe_session_id, total, currency, payment_status, status, items, shipping, created_at')
    .eq('stripe_session_id', String(orderId || '').trim())
    .eq('email', normalizedEmail(email))
    .maybeSingle()
  throwIfSupabaseError(error)
  if (!order) return null

  const fulfillments = await fulfillmentMap([order.stripe_session_id])
  return mapOrder(order, fulfillments.get(order.stripe_session_id))
}
