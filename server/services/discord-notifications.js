import { getSupabase, isSupabaseConfigured, throwIfSupabaseError } from '../lib/supabase.js'

const COLORS = {
  signup: 0x2563eb,
  payment: 0x16a34a,
  failed: 0xdc2626,
  fulfillment: 0xd97706,
}

function cleanText(value, maxLength = 1024) {
  const text = String(value ?? '')
    .replace(/@/g, '@\u200b')
    .replace(/([\\`*_~|>])/g, '\\$1')
    .trim()
  return (text || 'Not provided').slice(0, maxLength)
}

function field(name, value, inline = false, maxLength = 1024) {
  return { name: cleanText(name, 256), value: cleanText(value, maxLength), inline }
}

function money(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: String(currency || 'usd').toUpperCase(),
  }).format(Number(cents || 0) / 100)
}

function address(value) {
  if (!value) return 'Not provided'
  return [
    value.line1,
    value.line2,
    [value.city, value.state, value.postal_code].filter(Boolean).join(', '),
    value.country,
  ].filter(Boolean).join('\n')
}

function lineItems(session) {
  const items = session.line_items?.data || []
  if (!items.length) return 'No line items returned by Stripe.'
  return items
    .map((item) => `- ${item.quantity || 1} x ${item.description || 'Item'} (${money(item.amount_total, session.currency)})`)
    .join('\n')
}

function shippingDetails(session) {
  return session.shipping_details || session.collected_information?.shipping_details || null
}

function objectId(value) {
  return typeof value === 'string' ? value : value?.id || 'Not provided'
}

function timestamp(value = Date.now()) {
  const milliseconds = typeof value === 'number' && value < 1000000000000 ? value * 1000 : value
  return new Date(milliseconds).toISOString()
}

function embed(title, description, color, fields) {
  return {
    username: 'Aminomarket Operations',
    allowed_mentions: { parse: [] },
    embeds: [{
      title,
      description,
      color,
      fields,
      footer: { text: 'Aminomarket automated notification' },
      timestamp: new Date().toISOString(),
    }],
  }
}

async function accountForEmail(email) {
  if (!email || !isSupabaseConfigured) return null
  const { data, error } = await getSupabase()
    .from('app_users')
    .select('id, email, name')
    .eq('email', String(email).toLowerCase())
    .maybeSingle()
  throwIfSupabaseError(error)
  return data
}

async function claimDelivery(deliveryKey) {
  if (!isSupabaseConfigured) return true
  const { error } = await getSupabase()
    .from('discord_notification_deliveries')
    .insert({ delivery_key: deliveryKey })
  if (!error) return true
  if (error.code === '23505') return false
  throw error
}

async function releaseDelivery(deliveryKey) {
  if (!isSupabaseConfigured) return
  const { error } = await getSupabase()
    .from('discord_notification_deliveries')
    .delete()
    .eq('delivery_key', deliveryKey)
  if (error) console.error(`[discord] could not release delivery claim ${deliveryKey}: ${error.message}`)
}

function confirmedWebhookUrl(webhookUrl) {
  const url = new URL(webhookUrl)
  if (url.protocol !== 'https:' || url.hostname !== 'discord.com' || !url.pathname.startsWith('/api/webhooks/')) {
    throw new Error('Discord webhook URL must use https://discord.com/api/webhooks/.')
  }
  url.searchParams.set('wait', 'true')
  return url.toString()
}

export async function sendDiscordNotification(webhookUrl, deliveryKey, payload) {
  if (!webhookUrl) {
    console.warn(`[discord] skipped ${deliveryKey}; webhook URL is not configured.`)
    return { skipped: 'not_configured' }
  }

  const claimed = await claimDelivery(deliveryKey)
  if (!claimed) return { skipped: 'duplicate' }

  try {
    const response = await fetch(confirmedWebhookUrl(webhookUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}.`)
    }
    return { delivered: true }
  } catch (error) {
    await releaseDelivery(deliveryKey)
    throw error
  }
}

export function buildSignupPayload(user) {
  return embed(
    'New Customer Signup',
    'A new Aminomarket account was created.',
    COLORS.signup,
    [
      field('Account ID', user.id, true),
      field('Name', user.name || 'Not provided', true),
      field('Email', user.email),
      field('Created', timestamp(user.createdAt)),
    ]
  )
}

export async function buildPaidPaymentPayload(session, eventType) {
  const customer = session.customer_details || {}
  const shipping = shippingDetails(session)
  const account = await accountForEmail(customer.email || session.customer_email)
  return embed(
    'Payment Received',
    'Stripe confirmed a successful customer payment.',
    COLORS.payment,
    [
      field('Order Number', session.id),
      field('Amount', money(session.amount_total, session.currency), true),
      field('Payment Status', session.payment_status, true),
      field('Checkout Status', session.status, true),
      field('Products', lineItems(session), false, 900),
      field('Account', account ? `${account.name || 'No name'}\n${account.email}\n${account.id}` : 'Guest checkout', false, 300),
      field('Contact', `${customer.name || shipping?.name || 'Not provided'}\n${customer.email || session.customer_email || 'Not provided'}\n${customer.phone || 'No phone'}`, false, 300),
      field('Billing Address', address(customer.address), false, 500),
      field('Shipping Address', address(shipping?.address), false, 500),
      field('Stripe Customer', objectId(session.customer), true),
      field('Payment Intent', objectId(session.payment_intent), true),
      field('Stripe Event', eventType, true),
      field('Created', timestamp(session.created)),
    ]
  )
}

export async function buildFulfillmentPayload(session) {
  const customer = session.customer_details || {}
  const shipping = shippingDetails(session)
  const account = await accountForEmail(customer.email || session.customer_email)
  return embed(
    'Order Ready For Fulfillment',
    'Stripe marked this order as paid. Prepare and ship the listed products.',
    COLORS.fulfillment,
    [
      field('Order Number', session.id),
      field('Amount Paid', money(session.amount_total, session.currency), true),
      field('Products', lineItems(session), false, 900),
      field('Recipient', shipping?.name || customer.name || 'Not provided'),
      field('Ship To', address(shipping?.address), false, 500),
      field('Contact', `${customer.email || session.customer_email || 'Not provided'}\n${customer.phone || 'No phone'}`, false, 300),
      field('Account', account ? `${account.email}\n${account.id}` : 'Guest checkout', false, 300),
      field('Stripe Customer', objectId(session.customer), true),
      field('Payment Intent', objectId(session.payment_intent), true),
      field('Paid At', timestamp()),
    ]
  )
}

export function buildFailedPaymentPayload(object, eventType) {
  const customer = object.customer_details || {}
  const error = object.last_payment_error
  return embed(
    'Payment Failed',
    'Stripe reported an unsuccessful payment attempt.',
    COLORS.failed,
    [
      field('Stripe Event', eventType),
      field('Checkout Session', object.object === 'checkout.session' ? object.id : 'Not provided'),
      field('Payment Intent', object.object === 'payment_intent' ? object.id : objectId(object.payment_intent)),
      field('Amount', money(object.amount_total ?? object.amount, object.currency), true),
      field('Payment Status', object.payment_status || object.status || 'failed', true),
      field('Customer', objectId(object.customer), true),
      field('Email', customer.email || object.customer_email || object.receipt_email || 'Not provided'),
      field('Reason', error?.message || error?.code || 'Stripe did not provide a failure reason.', false, 500),
      field('Created', timestamp(object.created)),
    ]
  )
}

export async function notifyNewSignup(user) {
  return sendDiscordNotification(
    process.env.DISCORD_SIGNUPS_WEBHOOK_URL,
    `signup:${user.id}`,
    buildSignupPayload(user)
  )
}

export async function notifyPaidCheckout(session, eventType) {
  const paymentKey = objectId(session.payment_intent) === 'Not provided'
    ? session.id
    : objectId(session.payment_intent)
  return sendDiscordNotification(
    process.env.DISCORD_PAYMENTS_WEBHOOK_URL,
    `payment:paid:${paymentKey}`,
    await buildPaidPaymentPayload(session, eventType)
  )
}

export async function notifyFailedPayment(object, eventType) {
  const paymentKey = object.object === 'payment_intent'
    ? object.id
    : objectId(object.payment_intent) === 'Not provided'
      ? object.id
      : objectId(object.payment_intent)
  return sendDiscordNotification(
    process.env.DISCORD_PAYMENTS_WEBHOOK_URL,
    `payment:failed:${paymentKey}`,
    buildFailedPaymentPayload(object, eventType)
  )
}

export async function notifyReadyForFulfillment(session) {
  return sendDiscordNotification(
    process.env.DISCORD_FULFILLMENT_WEBHOOK_URL,
    `fulfillment:ready:${session.id}`,
    await buildFulfillmentPayload(session)
  )
}
