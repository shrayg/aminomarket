// Forwards a manufacture-batch confirmation (with screenshot attachment) to a
// dedicated Discord webhook. Uses Node 18+'s native fetch + FormData; no extra
// dependency needed.

const DEFAULT_FILENAME = 'manufacture-confirmation.png'

function safeFilename(filename) {
  if (!filename) return DEFAULT_FILENAME
  const cleaned = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  return cleaned || DEFAULT_FILENAME
}

function decodeScreenshot(input) {
  if (!input) throw new Error('Screenshot is required.')
  if (typeof input !== 'string') throw new Error('Screenshot must be a base64 string.')
  const match = /^data:([^;]+);base64,(.+)$/.exec(input)
  let contentType = 'image/png'
  let payload = input
  if (match) {
    contentType = match[1] || 'image/png'
    payload = match[2]
  }
  const buffer = Buffer.from(payload, 'base64')
  if (buffer.length === 0) throw new Error('Screenshot buffer is empty.')
  if (buffer.length > 9 * 1024 * 1024) {
    throw new Error('Screenshot is larger than 9 MB. Please re-export at a lower size.')
  }
  return { buffer, contentType }
}

export async function postManufactureBatch({
  batchId,
  batchedAt,
  orderCount,
  totalUnits,
  productLines = [],
  screenshot,
  filename,
  note = '',
}) {
  const url = process.env.DISCORD_MANUFACTURE_WEBHOOK_URL
  if (!url) {
    return { sent: false, reason: 'DISCORD_MANUFACTURE_WEBHOOK_URL is not configured' }
  }

  let decoded
  try {
    decoded = decodeScreenshot(screenshot)
  } catch (err) {
    return { sent: false, reason: err.message }
  }

  const sortedLines = productLines
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .map((line) => `\u2022 ${line.quantity}\u00d7 ${line.name}`)
    .join('\n')
    .slice(0, 1800) // Discord embed field cap is 1024 chars per field; description is 4096

  const confirmedUnix = Math.floor(new Date(batchedAt).getTime() / 1000)

  const payload = {
    username: 'aminomarket fulfillment',
    embeds: [
      {
        title: 'Manufacture batch confirmed',
        description: sortedLines || 'No line items',
        color: 0x9a7b3d,
        fields: [
          { name: 'Batch ID', value: `\`${batchId}\``, inline: true },
          { name: 'Orders', value: String(orderCount), inline: true },
          { name: 'Total units', value: String(totalUnits), inline: true },
          {
            name: 'Sent to manufacturer at',
            value: `<t:${confirmedUnix}:F> (<t:${confirmedUnix}:R>)`,
            inline: false,
          },
          ...(note ? [{ name: 'Operator note', value: String(note).slice(0, 1000), inline: false }] : []),
        ],
        timestamp: batchedAt,
      },
    ],
  }

  const form = new FormData()
  form.append('payload_json', JSON.stringify(payload))
  form.append(
    'files[0]',
    new Blob([decoded.buffer], { type: decoded.contentType }),
    safeFilename(filename)
  )

  try {
    const res = await fetch(url, { method: 'POST', body: form })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { sent: false, status: res.status, reason: text || 'Discord rejected the upload' }
    }
    return { sent: true, status: res.status }
  } catch (err) {
    return { sent: false, reason: err.message || 'Discord upload failed' }
  }
}
