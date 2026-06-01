import crypto from 'node:crypto'

// 62-char URL-safe alphanumeric. Slight modulo bias is acceptable for a
// 12-char display code that rotates each day.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 12
const DAY_MS = 24 * 60 * 60 * 1000

// The Vercel Hobby plan only allows daily cron jobs, so we rotate the access
// code once per day instead of once per hour. We align the bucket boundary to
// 12:00 UTC so the boundary lines up with the configured cron schedule
// ("0 12 * * *" in vercel.json) - the daily broadcast goes out right when the
// new bucket starts, giving operators a full 24h window.
const BUCKET_BOUNDARY_HOUR_UTC = 12
const BUCKET_OFFSET_MS = BUCKET_BOUNDARY_HOUR_UTC * 60 * 60 * 1000

function getSecret() {
  return (
    process.env.ADMIN_CODE_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    'change-admin-code-secret-before-deploy'
  )
}

export function dayBucket(date = new Date()) {
  return Math.floor((date.getTime() - BUCKET_OFFSET_MS) / DAY_MS)
}

// Back-compat: older imports still reference hourBucket.
export const hourBucket = dayBucket

export function getCurrentAccessCode(date = new Date()) {
  const bucket = dayBucket(date)
  const hmac = crypto
    .createHmac('sha256', getSecret())
    .update(`amp-admin-code:${bucket}`)
    .digest()

  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[hmac[i] % ALPHABET.length]
  }

  const validFrom = new Date(bucket * DAY_MS + BUCKET_OFFSET_MS)
  const validTo = new Date((bucket + 1) * DAY_MS + BUCKET_OFFSET_MS)
  return {
    code,
    bucket,
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
        title: 'Daily admin access code',
        description: `\`\`\`\n${codeInfo.code}\n\`\`\``,
        color: 0xc9a227,
        fields: [
          {
            name: 'Valid until',
            value: `<t:${expireUnix}:F> (<t:${expireUnix}:R>)`,
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
