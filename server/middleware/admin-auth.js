import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === 'production' ? '' : 'kaimatsu')
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'change-admin-secret-before-deploy'

const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function getAttemptRecord(ip) {
  const existing = attempts.get(ip)
  if (!existing || existing.resetAt < Date.now()) {
    const next = { count: 0, resetAt: Date.now() + WINDOW_MS }
    attempts.set(ip, next)
    return next
  }
  return existing
}

function safeEqual(value, expected) {
  const left = Buffer.from(String(value))
  const right = Buffer.from(String(expected))
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function createAdminToken(password, ip = 'unknown') {
  const record = getAttemptRecord(ip)
  if (record.count >= MAX_ATTEMPTS) {
    const error = new Error('Too many login attempts. Try again later.')
    error.statusCode = 429
    throw error
  }
  if (!ADMIN_PASSWORD) {
    const error = new Error('Admin access is not configured.')
    error.statusCode = 503
    throw error
  }
  if (!safeEqual(password, ADMIN_PASSWORD)) {
    record.count += 1
    const error = new Error('Invalid admin password.')
    error.statusCode = 401
    throw error
  }

  attempts.delete(ip)
  return jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' })
}

export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Admin authentication required.' })

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET)
    if (payload.role !== 'admin') throw new Error('Invalid role')
    next()
  } catch {
    res.status(401).json({ error: 'Admin session expired. Sign in again.' })
  }
}
