import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import Stripe from 'stripe'

const apply = process.argv.includes('--apply')
const confirmedStripeApproval = process.argv.includes('--confirm-stripe-approval')
const key = process.env.STRIPECODEXKEY
const endpointUrl = 'https://aminomarket.shop/api/stripe/webhook'
const enabledEvents = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'payment_intent.payment_failed',
]

if (!apply) {
  console.log(`Dry run: Stripe webhook endpoint is ready for ${endpointUrl}`)
  console.log('Run with --apply --confirm-stripe-approval to register it.')
  process.exit(0)
}

if (!key) throw new Error('Missing STRIPECODEXKEY in the local .env file')
if (!confirmedStripeApproval) {
  throw new Error('Webhook registration requires --confirm-stripe-approval')
}

function saveLocalWebhookSecret(secret) {
  const envPath = new URL('../.env', import.meta.url)
  const source = readFileSync(envPath, 'utf8')
  const line = `STRIPE_WEBHOOK_SECRET=${secret}`
  const next = /^\s*STRIPE_WEBHOOK_SECRET\s*=.*$/m.test(source)
    ? source.replace(/^\s*STRIPE_WEBHOOK_SECRET\s*=.*$/m, line)
    : `${source.replace(/\s*$/, '')}\n${line}\n`
  writeFileSync(envPath, next)
}

const stripe = new Stripe(key)
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
const existing = endpoints.data.find((endpoint) => endpoint.url === endpointUrl)

if (existing) {
  await stripe.webhookEndpoints.update(existing.id, {
    enabled_events: enabledEvents,
    description: 'Aminomarket checkout payment completion and failure tracking',
  })
  console.log({
    created: false,
    updated: true,
    endpointId: existing.id,
    endpointUrl: existing.url,
    status: existing.status,
    note: 'Endpoint events updated. Stripe only returns its signing secret at creation time.',
  })
  process.exit(0)
}

const endpoint = await stripe.webhookEndpoints.create({
  url: endpointUrl,
  enabled_events: enabledEvents,
  description: 'Aminomarket checkout payment completion and failure tracking',
})

saveLocalWebhookSecret(endpoint.secret)
console.log({
  created: true,
  endpointId: endpoint.id,
  endpointUrl: endpoint.url,
  status: endpoint.status,
  localWebhookSecretSaved: true,
})
