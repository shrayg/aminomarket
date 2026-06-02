export type AnalyticsEventType =
  | 'page_view'
  | 'session_update'
  | 'product_view'
  | 'shop_search'
  | 'shop_filter'
  | 'add_to_cart'
  | 'checkout_started'
  | 'checkout_redirect'
  | 'purchase_return'

type AnalyticsPayload = {
  path?: string
  productSlug?: string
  query?: string
  value?: number
  metadata?: Record<string, string | number | boolean>
}

const CONSENT_KEY = 'amp-age-verified'
const VISITOR_KEY = 'amp-analytics-visitor'
const SESSION_KEY = 'amp-analytics-session'
const SESSION_STARTED_KEY = 'amp-analytics-started'

let lastPageView = ''
let lastPageViewAt = 0
const recentEvents = new Map<string, number>()

function makeId(prefix: string) {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  return `${prefix}_${uuid}`
}

function getOrCreate(storage: Storage, key: string, prefix: string) {
  const current = storage.getItem(key)
  if (current) return current
  const next = makeId(prefix)
  storage.setItem(key, next)
  return next
}

export function hasAnalyticsConsent() {
  return typeof window !== 'undefined' && localStorage.getItem(CONSENT_KEY) === 'true'
}

export function getAnalyticsSessionId() {
  if (typeof window === 'undefined') return ''
  return getOrCreate(sessionStorage, SESSION_KEY, 'session')
}

function getVisitorId() {
  return getOrCreate(localStorage, VISITOR_KEY, 'visitor')
}

function getStartedAt() {
  const current = Number(sessionStorage.getItem(SESSION_STARTED_KEY))
  if (Number.isFinite(current) && current > 0) return current
  const startedAt = Date.now()
  sessionStorage.setItem(SESSION_STARTED_KEY, String(startedAt))
  return startedAt
}

function getDurationSeconds() {
  return Math.round((Date.now() - getStartedAt()) / 1000)
}

function getSource() {
  const params = new URLSearchParams(window.location.search)
  const campaignSource = params.get('utm_source')
  if (campaignSource) return campaignSource
  if (!document.referrer) return 'direct'
  try {
    const host = new URL(document.referrer).hostname
    return host === window.location.hostname ? 'internal' : host
  } catch {
    return 'referral'
  }
}

function createBody(type: AnalyticsEventType, payload: AnalyticsPayload = {}) {
  return JSON.stringify({
    sessionId: getAnalyticsSessionId(),
    visitorId: getVisitorId(),
    type,
    path: payload.path || `${window.location.pathname}${window.location.search}`,
    productSlug: payload.productSlug,
    query: payload.query,
    source: getSource(),
    referrer: document.referrer || undefined,
    value: payload.value,
    durationSeconds: getDurationSeconds(),
    metadata: payload.metadata,
  })
}

export function trackEvent(type: AnalyticsEventType, payload: AnalyticsPayload = {}) {
  if (!hasAnalyticsConsent() || window.location.pathname.startsWith('/admin')) return
  // `path` MUST be in the dedupe key. Without it, fast multi-page navigation
  // (e.g. Home -> Shop -> Product within ~1s) collapsed all those page_view
  // events into one because they all shared signature ["page_view", null, null, null].
  const path = payload.path || `${window.location.pathname}${window.location.search}`
  const signature = JSON.stringify([type, path, payload.productSlug, payload.query, payload.metadata])
  const now = Date.now()
  if (now - (recentEvents.get(signature) || 0) < 1000) return
  recentEvents.set(signature, now)
  void fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createBody(type, payload),
    keepalive: true,
  }).catch(() => undefined)
}

export function trackPageView() {
  const path = `${window.location.pathname}${window.location.search}`
  const now = Date.now()
  if (path === lastPageView && now - lastPageViewAt < 1000) return
  lastPageView = path
  lastPageViewAt = now
  trackEvent('page_view', { path })
}

export function sendSessionUpdate() {
  if (!hasAnalyticsConsent() || window.location.pathname.startsWith('/admin')) return
  const body = createBody('session_update')
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/events', new Blob([body], { type: 'application/json' }))
    return
  }
  void fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined)
}
