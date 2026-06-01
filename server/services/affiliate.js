// Affiliate program service: code generation, application + approval flow,
// Stripe Promotion Code provisioning, dashboard aggregation, and Discord
// notifications. Plain JS to match the rest of the server.
import { randomInt } from 'node:crypto'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

// Excludes 0/O/1/I/L so codes are unambiguous when affiliates dictate them
// over the phone or read them off a poster.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6
const CODE_GENERATION_MAX_ATTEMPTS = 25

export const COMMISSION_BASE_RATE_PERCENT = 25
export const COMMISSION_TIER_TWO_RATE_PERCENT = 40
export const TIER_TWO_REDEMPTIONS_THRESHOLD = 50
export const TIER_TWO_SUBTOTAL_THRESHOLD_CENTS = 2_500 * 100
// Cost-of-goods placeholder (40% of subtotal) and per-order Stripe fee
// (2.9% + $0.30). Kept conservative so the affiliate dashboard never over-
// promises payout — the owner reconciles the actual number out-of-band.
const ESTIMATED_COGS_RATE = 0.4
const STRIPE_FEE_PERCENT = 0.029
const STRIPE_FEE_FIXED_CENTS = 30

const AFFILIATE_USER_COLUMNS = [
  'id',
  'email',
  'name',
  'role',
  'affiliate_code',
  'affiliate_status',
  'affiliate_promo_code_id',
  'affiliate_coupon_id',
  'created_at',
].join(', ')

function randomCode() {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]
  }
  return out
}

export async function generateAffiliateCode() {
  const db = getSupabase()
  for (let attempt = 0; attempt < CODE_GENERATION_MAX_ATTEMPTS; attempt += 1) {
    const candidate = randomCode()
    const { data, error } = await db
      .from('app_users')
      .select('id')
      .eq('affiliate_code', candidate)
      .maybeSingle()
    throwIfSupabaseError(error)
    if (!data) return candidate
  }
  // 31^6 keyspace is ~887M, so collisions only happen here if Supabase is
  // failing to return rows; surface as an error rather than loop forever.
  throw new Error('Could not generate a unique affiliate code after multiple attempts.')
}

async function fetchAffiliateUser(userId) {
  const { data, error } = await getSupabase()
    .from('app_users')
    .select(AFFILIATE_USER_COLUMNS)
    .eq('id', userId)
    .maybeSingle()
  throwIfSupabaseError(error)
  return data || null
}

function shapeUserForApi(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    role: row.role || 'customer',
    affiliateCode: row.affiliate_code || null,
    affiliateStatus: row.affiliate_status || 'none',
    affiliatePromoCodeId: row.affiliate_promo_code_id || null,
    affiliateCouponId: row.affiliate_coupon_id || null,
    createdAt: row.created_at,
  }
}

function escapeDiscordText(value, max = 1024) {
  const text = String(value ?? '')
    .replace(/@/g, '@\u200b')
    .replace(/([\\`*_~|>])/g, '\\$1')
    .trim()
  return (text || 'Not provided').slice(0, max)
}

function confirmedWebhookUrl(webhookUrl) {
  const url = new URL(webhookUrl)
  if (url.protocol !== 'https:' || url.hostname !== 'discord.com' || !url.pathname.startsWith('/api/webhooks/')) {
    throw new Error('Discord webhook URL must use https://discord.com/api/webhooks/.')
  }
  url.searchParams.set('wait', 'true')
  return url.toString()
}

async function postAffiliateDiscord(payload) {
  const url = process.env.DISCORD_AFFILIATE_WEBHOOK_URL
  if (!url) {
    return { sent: false, reason: 'DISCORD_AFFILIATE_WEBHOOK_URL is not configured' }
  }
  try {
    const response = await fetch(confirmedWebhookUrl(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return { sent: false, status: response.status, reason: text || 'Discord rejected the webhook' }
    }
    return { sent: true, status: response.status }
  } catch (err) {
    return { sent: false, reason: err?.message || 'Discord delivery failed' }
  }
}

export async function applyToBeAffiliate({ userId, reason, audience }) {
  const cleanReason = String(reason || '').trim()
  const cleanAudience = String(audience || '').trim()
  if (cleanReason.length < 20 || cleanReason.length > 1000) {
    const error = new Error('Application reason must be between 20 and 1000 characters.')
    error.statusCode = 400
    throw error
  }
  if (cleanAudience.length > 500) {
    const error = new Error('Audience description must be 500 characters or fewer.')
    error.statusCode = 400
    throw error
  }

  const db = getSupabase()
  const existing = await fetchAffiliateUser(userId)
  if (!existing) {
    const error = new Error('Account not found.')
    error.statusCode = 404
    throw error
  }
  if (existing.role === 'affiliate' || existing.affiliate_status === 'approved') {
    return { status: 'approved', alreadyApproved: true }
  }
  if (existing.affiliate_status === 'pending') {
    return { status: 'pending', alreadyPending: true }
  }

  const { error: updateError } = await db
    .from('app_users')
    .update({ affiliate_status: 'pending' })
    .eq('id', userId)
  throwIfSupabaseError(updateError)

  const submittedUnix = Math.floor(Date.now() / 1000)
  const delivery = await postAffiliateDiscord({
    username: 'Aminomarket Affiliates',
    embeds: [
      {
        title: 'New affiliate application',
        description: 'A storefront customer has applied to join the affiliate program. Review and approve from the admin panel.',
        color: 0x9a7b3d,
        fields: [
          { name: 'Name', value: escapeDiscordText(existing.name || 'Not provided', 256), inline: true },
          { name: 'Email', value: escapeDiscordText(existing.email, 256), inline: true },
          { name: 'Account ID', value: `\`${existing.id}\``, inline: false },
          { name: 'Estimated audience', value: escapeDiscordText(cleanAudience || 'Not provided', 1024), inline: false },
          { name: 'Why they want to join', value: escapeDiscordText(cleanReason, 1024), inline: false },
          { name: 'Submitted', value: `<t:${submittedUnix}:F> (<t:${submittedUnix}:R>)`, inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Approve from /admin > Users' },
      },
    ],
  })

  return { status: 'pending', delivery }
}

async function ensureStripeArtifacts({ stripeClient, code, userId }) {
  if (!stripeClient) {
    const error = new Error('Stripe is not configured; cannot create promotion code for the affiliate.')
    error.statusCode = 503
    throw error
  }
  const coupon = await stripeClient.coupons.create({
    percent_off: 10,
    duration: 'forever',
    name: `Affiliate ${code}`,
    metadata: { aminomarketAffiliateUserId: String(userId), aminomarketAffiliateCode: code },
  })
  const promotionCode = await stripeClient.promotionCodes.create({
    coupon: coupon.id,
    code,
    metadata: { aminomarketAffiliateUserId: String(userId), aminomarketAffiliateCode: code },
  })
  return { couponId: coupon.id, promoCodeId: promotionCode.id }
}

export async function approveAffiliate({ userId, stripeClient }) {
  const db = getSupabase()
  const existing = await fetchAffiliateUser(userId)
  if (!existing) {
    const error = new Error('Account not found.')
    error.statusCode = 404
    throw error
  }

  // Idempotent: re-running approval on a fully-promoted user just returns the
  // same record so the admin UI never has to special-case "already approved".
  if (
    existing.role === 'affiliate' &&
    existing.affiliate_code &&
    existing.affiliate_promo_code_id &&
    existing.affiliate_coupon_id
  ) {
    return shapeUserForApi(existing)
  }

  const code = existing.affiliate_code || (await generateAffiliateCode())
  const stripeIds =
    existing.affiliate_promo_code_id && existing.affiliate_coupon_id
      ? {
          couponId: existing.affiliate_coupon_id,
          promoCodeId: existing.affiliate_promo_code_id,
        }
      : await ensureStripeArtifacts({ stripeClient, code, userId })

  const { data: updated, error: updateError } = await db
    .from('app_users')
    .update({
      role: 'affiliate',
      affiliate_status: 'approved',
      affiliate_code: code,
      affiliate_coupon_id: stripeIds.couponId,
      affiliate_promo_code_id: stripeIds.promoCodeId,
    })
    .eq('id', userId)
    .select(AFFILIATE_USER_COLUMNS)
    .single()
  throwIfSupabaseError(updateError)
  return shapeUserForApi(updated)
}

export async function denyAffiliate({ userId }) {
  const db = getSupabase()
  const { data, error } = await db
    .from('app_users')
    .update({ affiliate_status: 'denied' })
    .eq('id', userId)
    .select(AFFILIATE_USER_COLUMNS)
    .single()
  throwIfSupabaseError(error)
  return shapeUserForApi(data)
}

function commissionRatePercent({ totalUses, totalSubtotalCents }) {
  if (
    totalUses >= TIER_TWO_REDEMPTIONS_THRESHOLD &&
    totalSubtotalCents >= TIER_TWO_SUBTOTAL_THRESHOLD_CENTS
  ) {
    return COMMISSION_TIER_TWO_RATE_PERCENT
  }
  return COMMISSION_BASE_RATE_PERCENT
}

function estimateCommissionCents({
  totalSubtotalCents,
  totalShippingCents,
  totalTotalCents,
  totalUses,
  ratePercent,
}) {
  // Conservative profit per session = subtotal - cogs - stripe fee - shipping.
  // We approximate the per-session Stripe fee as rate*total + flat*N because
  // we don't store the per-session breakdown beyond the aggregate.
  const cogsCents = Math.round(totalSubtotalCents * ESTIMATED_COGS_RATE)
  const stripeFeeCents = Math.round(totalTotalCents * STRIPE_FEE_PERCENT) + STRIPE_FEE_FIXED_CENTS * totalUses
  const profitCents = Math.max(0, totalSubtotalCents - cogsCents - stripeFeeCents - totalShippingCents)
  return Math.round((profitCents * ratePercent) / 100)
}

export async function getAffiliateOverview(userId) {
  const user = await fetchAffiliateUser(userId)
  if (!user) {
    const error = new Error('Account not found.')
    error.statusCode = 404
    throw error
  }

  const role = user.role || 'customer'
  const status = user.affiliate_status || 'none'
  if (status === 'none') {
    return { status: 'none', role }
  }
  if (status !== 'approved' || role !== 'affiliate' || !user.affiliate_code) {
    return {
      status,
      role,
      code: user.affiliate_code || null,
    }
  }

  const db = getSupabase()
  const { data: redemptions, error: redemptionsError } = await db
    .from('affiliate_redemptions')
    .select('amount_subtotal_cents, amount_shipping_cents, amount_total_cents')
    .eq('affiliate_user_id', userId)
  throwIfSupabaseError(redemptionsError)

  let totalUses = 0
  let totalSubtotalCents = 0
  let totalShippingCents = 0
  let totalTotalCents = 0
  for (const row of redemptions || []) {
    totalUses += 1
    totalSubtotalCents += Number(row.amount_subtotal_cents || 0)
    totalShippingCents += Number(row.amount_shipping_cents || 0)
    totalTotalCents += Number(row.amount_total_cents || 0)
  }

  const ratePercent = commissionRatePercent({ totalUses, totalSubtotalCents })
  const estimatedCommissionCents = estimateCommissionCents({
    totalSubtotalCents,
    totalShippingCents,
    totalTotalCents,
    totalUses,
    ratePercent,
  })

  const ordersToNextTier = ratePercent === COMMISSION_BASE_RATE_PERCENT
    ? Math.max(0, TIER_TWO_REDEMPTIONS_THRESHOLD - totalUses)
    : 0
  const dollarsToNextTier = ratePercent === COMMISSION_BASE_RATE_PERCENT
    ? Math.max(0, (TIER_TWO_SUBTOTAL_THRESHOLD_CENTS - totalSubtotalCents) / 100)
    : 0

  return {
    status: 'approved',
    role: 'affiliate',
    code: user.affiliate_code,
    totalUses,
    totalProcessedCents: totalSubtotalCents,
    totalShippingCents,
    totalTotalCents,
    commissionRatePercent: ratePercent,
    estimatedCommissionCents,
    estimatedCommissionDollars: estimatedCommissionCents / 100,
    tierProgress: {
      ordersToNextTier,
      dollarsToNextTier,
    },
  }
}

function affiliateFromPromoCodeId(promoCodeId) {
  return getSupabase()
    .from('app_users')
    .select('id, email, name, affiliate_code')
    .eq('affiliate_promo_code_id', promoCodeId)
    .maybeSingle()
}

function pickPromoCodeIdFromSession(session) {
  // Stripe puts the redeemed promotion-code IDs inside total_details.breakdown
  // .discounts[*].discount.promotion_code. Each entry can be a bare string id
  // or the expanded object; handle both shapes defensively.
  const discounts = session?.total_details?.breakdown?.discounts || []
  for (const entry of discounts) {
    const promo = entry?.discount?.promotion_code
    if (!promo) continue
    if (typeof promo === 'string') return promo
    if (typeof promo === 'object' && typeof promo.id === 'string') return promo.id
  }
  return null
}

export async function recordRedemptionFromSession(session) {
  if (!session || typeof session !== 'object') return { recorded: false, reason: 'no_session' }
  if (session.payment_status !== 'paid') return { recorded: false, reason: 'unpaid' }

  const promoCodeId = pickPromoCodeIdFromSession(session)
  if (!promoCodeId) return { recorded: false, reason: 'no_promo_code' }

  const { data: affiliate, error: lookupError } = await affiliateFromPromoCodeId(promoCodeId)
  throwIfSupabaseError(lookupError)
  if (!affiliate) return { recorded: false, reason: 'unknown_promo_code' }

  const subtotalCents = Number(session.amount_subtotal || 0)
  const totalCents = Number(session.amount_total || 0)
  const shippingCents = Number(
    session.shipping_cost?.amount_total ??
      session.total_details?.amount_shipping ??
      0
  )

  const db = getSupabase()
  const { error: insertError } = await db
    .from('affiliate_redemptions')
    .insert({
      affiliate_user_id: affiliate.id,
      stripe_session_id: session.id,
      amount_subtotal_cents: subtotalCents,
      amount_shipping_cents: shippingCents,
      amount_total_cents: totalCents,
    })
  if (insertError) {
    if (insertError.code === '23505') return { recorded: false, reason: 'duplicate' }
    throw insertError
  }
  return { recorded: true, affiliateUserId: affiliate.id }
}

export async function requestPayout({ userId, payoutMethod }) {
  const cleanMethod = String(payoutMethod || '').trim()
  if (cleanMethod.length < 3 || cleanMethod.length > 500) {
    const error = new Error('Provide a payout destination (PayPal email, crypto address, etc.) between 3 and 500 characters.')
    error.statusCode = 400
    throw error
  }

  const overview = await getAffiliateOverview(userId)
  if (overview.status !== 'approved' || overview.role !== 'affiliate') {
    const error = new Error('Only approved affiliates can request a payout.')
    error.statusCode = 403
    throw error
  }
  if (!overview.estimatedCommissionCents || overview.estimatedCommissionCents <= 0) {
    const error = new Error('No estimated commission to request a payout for yet.')
    error.statusCode = 400
    throw error
  }

  const user = await fetchAffiliateUser(userId)
  const submittedUnix = Math.floor(Date.now() / 1000)
  const dollars = (overview.estimatedCommissionCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  const delivery = await postAffiliateDiscord({
    username: 'Aminomarket Affiliates',
    embeds: [
      {
        title: 'Affiliate payout request',
        description: 'An approved affiliate has requested a payout. Reconcile actual commission and pay out via the requested method.',
        color: 0x16a34a,
        fields: [
          { name: 'Affiliate', value: escapeDiscordText(user?.name || 'Not provided', 256), inline: true },
          { name: 'Email', value: escapeDiscordText(user?.email, 256), inline: true },
          { name: 'Account ID', value: `\`${userId}\``, inline: false },
          { name: 'Code', value: `\`${overview.code}\``, inline: true },
          { name: 'Tier', value: `${overview.commissionRatePercent}%`, inline: true },
          { name: 'Total uses', value: String(overview.totalUses), inline: true },
          { name: 'Processed (subtotal)', value: `$${(overview.totalProcessedCents / 100).toFixed(2)}`, inline: true },
          { name: 'Estimated commission', value: dollars, inline: true },
          { name: 'Payout destination', value: escapeDiscordText(cleanMethod, 1024), inline: false },
          { name: 'Requested', value: `<t:${submittedUnix}:F> (<t:${submittedUnix}:R>)`, inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Reconcile in Stripe before paying' },
      },
    ],
  })

  return { delivery, requestedAt: new Date().toISOString() }
}
