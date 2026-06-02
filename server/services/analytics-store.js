import { randomUUID } from 'node:crypto'
import { getSupabase, isSupabaseConfigured, throwIfSupabaseError } from '../lib/supabase.js'

const memoryEvents = []
const memorySessions = new Map()
const memoryFulfillments = new Map()
let databaseAvailable = isSupabaseConfigured
let databaseDemotedAt = 0
let databaseWarningLogged = false

const MAX_MEMORY_EVENTS = 10000
// After a Supabase error, fall back to memory but retry the database again
// after this window. Without this, a single transient blip pinned the entire
// warm Vercel function instance into the non-persistent memory path until it
// cold-started — meaning the dashboard could quietly read empty data even
// though Supabase had already recovered.
const DB_RETRY_AFTER_MS = 60_000

function clampDuration(value) {
  const duration = Number(value)
  if (!Number.isFinite(duration)) return 0
  return Math.min(24 * 60 * 60, Math.max(0, Math.round(duration)))
}

function cleanMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {}
  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 12)
      .map(([key, value]) => [String(key).slice(0, 64), String(value).slice(0, 250)])
  )
}

async function withFallback(databaseOperation, fallbackOperation) {
  if (
    !databaseAvailable &&
    isSupabaseConfigured &&
    Date.now() - databaseDemotedAt > DB_RETRY_AFTER_MS
  ) {
    databaseAvailable = true
    databaseWarningLogged = false
  }

  if (databaseAvailable) {
    try {
      return await databaseOperation()
    } catch (error) {
      databaseAvailable = false
      databaseDemotedAt = Date.now()
      if (!databaseWarningLogged) {
        databaseWarningLogged = true
        console.warn(
          `[analytics] Supabase unavailable; using memory fallback for ${
            DB_RETRY_AFTER_MS / 1000
          }s: ${error.message}`
        )
      }
    }
  } else if (!databaseWarningLogged) {
    databaseWarningLogged = true
    console.warn('[analytics] Supabase is not configured; using non-persistent memory fallback.')
  }
  return fallbackOperation()
}

function memorySessionFor(event) {
  const existing = memorySessions.get(event.sessionId)
  if (existing) return existing
  const created = {
    id: event.sessionId,
    visitorId: event.visitorId || null,
    entryPath: event.path || '/',
    source: event.source || 'direct',
    referrer: event.referrer || null,
    startedAt: new Date(),
    lastSeenAt: new Date(),
    durationSeconds: 0,
    engaged: false,
    pageViews: 0,
    checkoutStarted: false,
    converted: false,
  }
  memorySessions.set(event.sessionId, created)
  return created
}

function recordMemoryEvent(event) {
  const session = memorySessionFor(event)
  session.lastSeenAt = new Date()
  session.durationSeconds = Math.max(session.durationSeconds, event.durationSeconds)
  session.engaged = session.durationSeconds >= 5
  if (event.type === 'page_view') session.pageViews += 1
  if (event.type === 'checkout_started') session.checkoutStarted = true
  if (event.type === 'purchase_return') session.converted = true

  memoryEvents.push({ ...event, id: randomUUID(), createdAt: new Date() })
  if (memoryEvents.length > MAX_MEMORY_EVENTS) {
    memoryEvents.splice(0, memoryEvents.length - MAX_MEMORY_EVENTS)
  }
}

function mapSession(row) {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    entryPath: row.entry_path,
    source: row.source,
    referrer: row.referrer,
    startedAt: new Date(row.started_at),
    lastSeenAt: new Date(row.last_seen_at),
    durationSeconds: row.duration_seconds,
    engaged: row.engaged,
    pageViews: row.page_views,
    checkoutStarted: row.checkout_started,
    converted: row.converted,
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    visitorId: row.visitor_id,
    type: row.type,
    path: row.path,
    productSlug: row.product_slug,
    query: row.query,
    source: row.source,
    referrer: row.referrer,
    value: row.value,
    durationSeconds: row.duration_seconds,
    metadata: row.metadata,
    createdAt: new Date(row.created_at),
  }
}

function mapFulfillment(row) {
  return {
    stripeSessionId: row.stripe_session_id,
    status: row.status,
    trackingNumber: row.tracking_number,
    note: row.note,
    updatedAt: new Date(row.updated_at),
  }
}

// Batch metadata is encoded into the note column so the storefront keeps working
// against the existing fulfillment_records schema without a Supabase migration.
// Format: `__batch__:<batchId>:<isoTimestamp>__\n<optional user note>`
const BATCH_NOTE_RE = /^__batch__:([^:]+):([^_]+)__(?:\n([\s\S]*))?$/

export function parseBatchFromNote(note) {
  if (!note) return { batchId: null, batchedAt: null, userNote: '' }
  const match = BATCH_NOTE_RE.exec(note)
  if (!match) return { batchId: null, batchedAt: null, userNote: note }
  return { batchId: match[1], batchedAt: match[2], userNote: match[3] || '' }
}

export function encodeBatchNote(batchId, batchedAt, userNote = '') {
  if (!batchId || !batchedAt) return userNote || null
  const prefix = `__batch__:${batchId}:${batchedAt}__`
  return userNote ? `${prefix}\n${userNote}` : prefix
}

export async function getFulfillment(stripeSessionId) {
  const records = await listFulfillments()
  return records.find((record) => record.stripeSessionId === String(stripeSessionId)) || null
}

export async function recordAnalyticsEvent(input) {
  const event = {
    sessionId: String(input.sessionId),
    visitorId: input.visitorId ? String(input.visitorId) : null,
    type: String(input.type),
    path: input.path ? String(input.path).slice(0, 300) : null,
    productSlug: input.productSlug ? String(input.productSlug).slice(0, 120) : null,
    query: input.query ? String(input.query).slice(0, 160) : null,
    source: input.source ? String(input.source).slice(0, 120) : null,
    referrer: input.referrer ? String(input.referrer).slice(0, 500) : null,
    value: Number.isFinite(Number(input.value)) ? Number(input.value) : null,
    durationSeconds: clampDuration(input.durationSeconds),
    metadata: cleanMetadata(input.metadata),
  }

  return withFallback(
    async () => {
      const { error } = await getSupabase().rpc('record_analytics_event', {
        p_duration_seconds: event.durationSeconds,
        p_metadata: event.metadata,
        p_path: event.path,
        p_product_slug: event.productSlug,
        p_query: event.query,
        p_referrer: event.referrer,
        p_session_id: event.sessionId,
        p_source: event.source,
        p_type: event.type,
        p_value: event.value,
        p_visitor_id: event.visitorId,
      })
      throwIfSupabaseError(error)
    },
    () => recordMemoryEvent(event)
  )
}

export async function markAnalyticsConversion(sessionId) {
  if (!sessionId) return
  return withFallback(
    async () => {
      const { error } = await getSupabase()
        .from('analytics_sessions')
        .update({ converted: true, last_seen_at: new Date().toISOString() })
        .eq('id', String(sessionId))
      throwIfSupabaseError(error)
    },
    () => {
      const session = memorySessions.get(String(sessionId))
      if (session) session.converted = true
    }
  )
}

export async function listAnalytics(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return withFallback(
    async () => {
      const db = getSupabase()
      const [sessionsResult, eventsResult] = await Promise.all([
        db.from('analytics_sessions').select('*').gte('started_at', since.toISOString()).order('started_at', { ascending: false }).limit(10000),
        db.from('analytics_events').select('*').gte('created_at', since.toISOString()).order('created_at', { ascending: false }).limit(20000),
      ])
      throwIfSupabaseError(sessionsResult.error)
      throwIfSupabaseError(eventsResult.error)
      return {
        sessions: sessionsResult.data.map(mapSession),
        events: eventsResult.data.map(mapEvent),
        storageMode: 'database',
      }
    },
    () => ({
      sessions: [...memorySessions.values()].filter((session) => session.startedAt >= since),
      events: memoryEvents.filter((event) => event.createdAt >= since),
      storageMode: 'memory',
    })
  )
}

export async function listFulfillments() {
  return withFallback(
    async () => {
      const { data, error } = await getSupabase().from('fulfillment_records').select('*')
      throwIfSupabaseError(error)
      return data.map(mapFulfillment)
    },
    () => [...memoryFulfillments.values()]
  )
}

export async function saveFulfillment(stripeSessionId, data) {
  const record = {
    stripeSessionId: String(stripeSessionId),
    status: String(data.status),
    trackingNumber: data.trackingNumber ? String(data.trackingNumber).slice(0, 120) : null,
    note: data.note ? String(data.note).slice(0, 500) : null,
    updatedAt: new Date(),
  }
  return withFallback(
    async () => {
      const { data: saved, error } = await getSupabase()
        .from('fulfillment_records')
        .upsert({
          stripe_session_id: record.stripeSessionId,
          status: record.status,
          tracking_number: record.trackingNumber,
          note: record.note,
          updated_at: record.updatedAt.toISOString(),
        }, { onConflict: 'stripe_session_id' })
        .select('*')
        .single()
      throwIfSupabaseError(error)
      return mapFulfillment(saved)
    },
    () => {
      memoryFulfillments.set(record.stripeSessionId, record)
      return record
    }
  )
}

export async function listRegisteredUsers() {
  return withFallback(
    async () => {
      const { data, error } = await getSupabase()
        .from('app_users')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
      throwIfSupabaseError(error)
      return data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.created_at),
      }))
    },
    () => []
  )
}
