import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()
const memoryEvents = []
const memorySessions = new Map()
const memoryFulfillments = new Map()
let databaseAvailable = true
let databaseWarningLogged = false

const MAX_MEMORY_EVENTS = 10000

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
  if (databaseAvailable) {
    try {
      return await databaseOperation()
    } catch (error) {
      databaseAvailable = false
      if (!databaseWarningLogged) {
        databaseWarningLogged = true
        console.warn(`[analytics] database unavailable; using non-persistent memory fallback: ${error.message}`)
      }
    }
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
      const sessionUpdate = {
        lastSeenAt: new Date(),
        durationSeconds: { set: event.durationSeconds },
        engaged: event.durationSeconds >= 5,
      }
      if (event.type === 'page_view') sessionUpdate.pageViews = { increment: 1 }
      if (event.type === 'checkout_started') sessionUpdate.checkoutStarted = true
      if (event.type === 'purchase_return') sessionUpdate.converted = true

      await prisma.analyticsSession.upsert({
        where: { id: event.sessionId },
        create: {
          id: event.sessionId,
          visitorId: event.visitorId,
          entryPath: event.path || '/',
          source: event.source || 'direct',
          referrer: event.referrer,
          lastSeenAt: new Date(),
          durationSeconds: event.durationSeconds,
          engaged: event.durationSeconds >= 5,
          pageViews: event.type === 'page_view' ? 1 : 0,
          checkoutStarted: event.type === 'checkout_started',
          converted: event.type === 'purchase_return',
        },
        update: sessionUpdate,
      })
      await prisma.analyticsEvent.create({ data: event })
    },
    () => recordMemoryEvent(event)
  )
}

export async function markAnalyticsConversion(sessionId) {
  if (!sessionId) return
  return withFallback(
    () =>
      prisma.analyticsSession.updateMany({
        where: { id: String(sessionId) },
        data: { converted: true, lastSeenAt: new Date() },
      }),
    () => {
      const session = memorySessions.get(String(sessionId))
      if (session) session.converted = true
    }
  )
}

export async function listAnalytics(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return withFallback(
    async () => ({
      sessions: await prisma.analyticsSession.findMany({
        where: { startedAt: { gte: since } },
        orderBy: { startedAt: 'desc' },
        take: 10000,
      }),
      events: await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 20000,
      }),
      storageMode: 'database',
    }),
    () => ({
      sessions: [...memorySessions.values()].filter((session) => session.startedAt >= since),
      events: memoryEvents.filter((event) => event.createdAt >= since),
      storageMode: 'memory',
    })
  )
}

export async function listFulfillments() {
  return withFallback(
    () => prisma.fulfillmentRecord.findMany(),
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
    () =>
      prisma.fulfillmentRecord.upsert({
        where: { stripeSessionId: record.stripeSessionId },
        create: record,
        update: record,
      }),
    () => {
      memoryFulfillments.set(record.stripeSessionId, record)
      return record
    }
  )
}

export async function listRegisteredUsers() {
  return withFallback(
    () =>
      prisma.user.findMany({
        select: { id: true, email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    () => []
  )
}
