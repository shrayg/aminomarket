import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { getCurrentHourCode } from '../services/admin-code.js'

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
  const left = Buffer.from(String(value || ''))
  const right = Buffer.from(String(expected || ''))
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

// The admin "password" is the current hourly rotating access code (broadcast to
// Discord via /api/admin/code/notify). The issued JWT expires exactly when the
// code rotates so a session can never outlive the code that opened it.
export function createAdminToken(submittedCode, ip = 'unknown') {
  const record = getAttemptRecord(ip)
  if (record.count >= MAX_ATTEMPTS) {
    const error = new Error('Too many login attempts. Try again later.')
    error.statusCode = 429
    throw error
  }

  const codeInfo = getCurrentHourCode()
  const submitted = String(submittedCode || '').trim()
  if (!submitted || !safeEqual(submitted, codeInfo.code)) {
    record.count += 1
    const error = new Error('Invalid access code.')
    error.statusCode = 401
    throw error
  }

  attempts.delete(ip)

  const expSeconds = Math.floor(new Date(codeInfo.validTo).getTime() / 1000)
  const nowSeconds = Math.floor(Date.now() / 1000)
  // Refuse to issue a token with <2s of life (would log the operator out before
  // the dashboard finished loading); they should wait for the next rotation.
  if (expSeconds - nowSeconds < 2) {
    const error = new Error('Access code is about to rotate. Wait for the next code in Discord.')
    error.statusCode = 401
    throw error
  }

  const token = jwt.sign(
    { role: 'admin', exp: expSeconds, iat: nowSeconds },
    ADMIN_JWT_SECRET
  )
  return { token, expiresAt: codeInfo.validTo }
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
