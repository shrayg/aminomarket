import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

// Owner-set business rule: lifetime spend >= $300 unlocks a permanent 10% off
// coupon that Stripe auto-applies to every future Checkout Session.
export const LOYALTY_THRESHOLD_CENTS = 30000
export const LOYALTY_DISCOUNT_PERCENT = 10
const LOYALTY_COUPON_NAME = 'Amino Market Loyalty 10% Off'

const USER_COLUMNS = 'id, email, name, stripe_customer_id, lifetime_spend_cents, loyalty_coupon_id'

function requireStripeClient(stripeClient) {
  if (!stripeClient) {
    throw new Error('Stripe client is required for loyalty operations.')
  }
}

async function loadUser(userId) {
  const { data, error } = await getSupabase()
    .from('app_users')
    .select(USER_COLUMNS)
    .eq('id', userId)
    .maybeSingle()
  throwIfSupabaseError(error)
  return data
}

// Lazily provision a Stripe Customer for the account so we have a stable
// handle to attach the loyalty coupon to. Caller passes the app_users row
// (must include id, email, name, stripe_customer_id) to avoid a second read.
export async function ensureStripeCustomerForUser(user, stripeClient) {
  requireStripeClient(stripeClient)
  if (!user?.id) throw new Error('A user with an id is required.')
  if (user.stripe_customer_id) return user.stripe_customer_id

  const customer = await stripeClient.customers.create({
    email: user.email || undefined,
    name: user.name || undefined,
    metadata: { app_user_id: user.id },
  })

  const { error } = await getSupabase()
    .from('app_users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id)
  throwIfSupabaseError(error)

  return customer.id
}

// Idempotent: only creates the Stripe coupon once per user. If a coupon is
// already persisted on the row we no-op. The Stripe Customer is created on
// demand if missing so this is safe to call from anywhere we have a userId.
export async function applyLoyaltyCouponIfEligible(userId, stripeClient) {
  requireStripeClient(stripeClient)
  const user = await loadUser(userId)
  if (!user) return { applied: false, reason: 'user-not-found' }
  if (user.loyalty_coupon_id) return { applied: false, reason: 'already-applied' }
  if (Number(user.lifetime_spend_cents || 0) < LOYALTY_THRESHOLD_CENTS) {
    return { applied: false, reason: 'below-threshold' }
  }

  const customerId = await ensureStripeCustomerForUser(user, stripeClient)
  const coupon = await stripeClient.coupons.create({
    percent_off: LOYALTY_DISCOUNT_PERCENT,
    duration: 'forever',
    name: LOYALTY_COUPON_NAME,
    metadata: { app_user_id: user.id, kind: 'loyalty' },
  })

  await stripeClient.customers.update(customerId, { coupon: coupon.id })

  const { error } = await getSupabase()
    .from('app_users')
    .update({ loyalty_coupon_id: coupon.id })
    .eq('id', user.id)
    .is('loyalty_coupon_id', null)
  throwIfSupabaseError(error)

  return { applied: true, couponId: coupon.id }
}

// Single entry point called from the Stripe webhook. The increment is done
// in a Postgres function so it is race-safe across concurrent webhook
// deliveries; we then re-check the threshold and attach the coupon if needed.
export async function incrementLifetimeSpend(userId, amountCents, stripeClient) {
  if (!userId) return null
  const amount = Number(amountCents)
  if (!Number.isFinite(amount) || amount <= 0) return null

  const { data, error } = await getSupabase().rpc('increment_lifetime_spend', {
    p_user_id: userId,
    p_amount_cents: Math.round(amount),
  })
  throwIfSupabaseError(error)

  await applyLoyaltyCouponIfEligible(userId, stripeClient)
  return typeof data === 'number' ? data : Number(data || 0)
}

export async function getLoyaltyStatus(userId) {
  const user = await loadUser(userId)
  const spend = Number(user?.lifetime_spend_cents || 0)
  const unlocked = Boolean(user?.loyalty_coupon_id) || spend >= LOYALTY_THRESHOLD_CENTS
  const ratio = LOYALTY_THRESHOLD_CENTS > 0 ? spend / LOYALTY_THRESHOLD_CENTS : 0
  const percentToThreshold = Math.min(100, Math.max(0, Math.round(ratio * 100)))
  return {
    lifetimeSpendCents: spend,
    thresholdCents: LOYALTY_THRESHOLD_CENTS,
    percentToThreshold,
    unlocked,
    discountPercent: LOYALTY_DISCOUNT_PERCENT,
  }
}
