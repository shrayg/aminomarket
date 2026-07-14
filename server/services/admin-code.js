import crypto from 'node:crypto'

const PASSWORD_LENGTH = 16
const SESSION_MS = 12 * 60 * 60 * 1000

function getConfiguredPassword() {
  const password = String(process.env.ADMIN_PASSWORD || '').trim()
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not configured')
  }
  if (password.length < PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${PASSWORD_LENGTH} characters`)
  }
  return password
}

export function getPermanentAdminPassword() {
  return getConfiguredPassword()
}

// Shape kept compatible with older admin UI/helpers that expected a code object.
export function getCurrentAccessCode(date = new Date()) {
  const password = getConfiguredPassword()
  const validFrom = new Date(0).toISOString()
  const validTo = new Date(date.getTime() + SESSION_MS).toISOString()
  return {
    code: password,
    permanent: true,
    validFrom,
    validTo,
    expiresInSeconds: Math.round(SESSION_MS / 1000),
  }
}

export const getCurrentHourCode = getCurrentAccessCode

export function verifyAdminPassword(submitted) {
  const expected = getConfiguredPassword()
  const left = Buffer.from(String(submitted || ''))
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function getAdminSessionExpiry(date = new Date()) {
  return new Date(date.getTime() + SESSION_MS)
}

// Discord hourly broadcasts are retired; notify endpoint returns this as a no-op.
export async function postCodeToDiscord() {
  return { sent: false, reason: 'Hourly admin-code broadcasts are disabled; using permanent ADMIN_PASSWORD' }
}
