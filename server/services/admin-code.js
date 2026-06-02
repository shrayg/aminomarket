import crypto from 'node:crypto'

// 62-char URL-safe alphanumeric. Slight modulo bias is acceptable for a
// 12-char display code that rotates each hour.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 12
const HOUR_MS = 60 * 60 * 1000

function getSecret() {
  return (
    process.env.ADMIN_CODE_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    'change-admin-code-secret-before-deploy'
  )
}

export function hourBucket(date = new Date()) {
  return Math.floor(date.getTime() / HOUR_MS)
}

// Back-compat aliases so older imports (dayBucket) still resolve.
export const dayBucket = hourBucket

export function getCurrentAccessCode(date = new Date()) {
  const bucket = hourBucket(date)
  const hmac = crypto
    .createHmac('sha256', getSecret())
    .update(`amp-admin-code:${bucket}`)
    .digest()

  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[hmac[i] % ALPHABET.length]
  }

  const validFrom = new Date(bucket * HOUR_MS)
  const validTo = new Date((bucket + 1) * HOUR_MS)
  return {
    code,
    bucket,
    hourBucket: bucket,
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    expiresInSeconds: Math.max(0, Math.round((validTo.getTime() - date.getTime()) / 1000)),
  }
}

// Back-compat: older callers import getCurrentHourCode.
export const getCurrentHourCode = getCurrentAccessCode

export async function postCodeToDiscord(codeInfo) {
  const url = process.env.DISCORD_ADMIN_WEBHOOK_URL
  if (!url) {
    return { sent: false, reason: 'DISCORD_ADMIN_WEBHOOK_URL is not configured' }
  }

  const expireUnix = Math.floor(new Date(codeInfo.validTo).getTime() / 1000)
  const body = {
    username: 'aminomarket admin',
    embeds: [
      {
        title: 'Hourly admin access code',
        description: `\`\`\`\n${codeInfo.code}\n\`\`\``,
        color: 0xc9a227,
        fields: [
          {
            name: 'Valid until',
            value: `<t:${expireUnix}:t> (<t:${expireUnix}:R>)`,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { sent: false, status: res.status, reason: text || 'Discord rejected the payload' }
    }
    return { sent: true, status: res.status }
  } catch (err) {
    return { sent: false, reason: err.message || 'Discord fetch failed' }
  }
}
