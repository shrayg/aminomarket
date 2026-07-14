import jwt from 'jsonwebtoken'
import { getAdminSessionExpiry, verifyAdminPassword } from '../services/admin-code.js'

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

// Permanent ADMIN_PASSWORD gate. Issued JWT lasts 12 hours.
export function createAdminToken(submittedPassword, ip = 'unknown') {
  const record = getAttemptRecord(ip)
  if (record.count >= MAX_ATTEMPTS) {
    const error = new Error('Too many login attempts. Try again later.')
    error.statusCode = 429
    throw error
  }

  let matches = false
  try {
    matches = verifyAdminPassword(String(submittedPassword || '').trim())
  } catch (configError) {
    const error = new Error(configError.message || 'Admin password is not configured.')
    error.statusCode = 503
    throw error
  }

  if (!matches) {
    record.count += 1
    const error = new Error('Invalid admin password.')
    error.statusCode = 401
    throw error
  }

  attempts.delete(ip)

  const expiresAt = getAdminSessionExpiry()
  const expSeconds = Math.floor(expiresAt.getTime() / 1000)
  const nowSeconds = Math.floor(Date.now() / 1000)
  const token = jwt.sign(
    { role: 'admin', exp: expSeconds, iat: nowSeconds },
    ADMIN_JWT_SECRET
  )
  return { token, expiresAt: expiresAt.toISOString() }
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
