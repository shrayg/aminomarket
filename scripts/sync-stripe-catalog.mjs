import 'dotenv/config'
import Stripe from 'stripe'
import { catalogCheckoutItems, catalogProducts } from '../server/catalog.js'

const apply = process.argv.includes('--apply')
const confirmedStripeApproval = process.argv.includes('--confirm-stripe-approval')
const key = process.env.STRIPECODEXKEY

if (!apply) {
  console.log(`Dry run: ${catalogProducts.length} products and ${catalogCheckoutItems.length} prices are ready.`)
  console.log('Run with --apply only after setting STRIPECODEXKEY in your local .env file.')
  process.exit(0)
}

if (!key) {
  throw new Error('Missing STRIPECODEXKEY in the local .env file')
}

if (!confirmedStripeApproval) {
  throw new Error('Live sync requires --confirm-stripe-approval after Stripe approves this catalog')
}

const stripe = new Stripe(key)

async function listAll(listPage, params = {}) {
  const rows = []
  let startingAfter
  do {
    const page = await listPage({
      ...params,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    rows.push(...page.data)
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined
  } while (startingAfter)
  return rows
}

const stripeProducts = await listAll((params) => stripe.products.list(params), { active: true })
let createdProducts = 0
let updatedProducts = 0
let createdPrices = 0
let unchangedPrices = 0

for (const product of catalogProducts) {
  let stripeProduct = stripeProducts.find(
    (candidate) => candidate.metadata?.amp_catalog_id === product.id
  )

  if (!stripeProduct) {
    stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      active: product.inStock,
      metadata: { amp_catalog_id: product.id },
    })
    stripeProducts.push(stripeProduct)
    createdProducts += 1
    console.log(`Created product: ${product.name}`)
  } else {
    await stripe.products.update(stripeProduct.id, {
      name: product.name,
      description: product.description,
      active: product.inStock,
      metadata: { amp_catalog_id: product.id },
    })
    updatedProducts += 1
    console.log(`Updated product: ${product.name}`)
  }

  const items = catalogCheckoutItems.filter((item) => item.productId === product.id)
  for (const item of items) {
    const existing = await stripe.prices.list({
      active: true,
      lookup_keys: [item.lookupKey],
      limit: 1,
    })
    const price = existing.data[0]
    const unitAmount = Math.round(item.price * 100)
    const priceProductId = typeof price?.product === 'string' ? price.product : price?.product?.id

    if (price && priceProductId === stripeProduct.id && price.unit_amount === unitAmount) {
      unchangedPrices += 1
      continue
    }

    await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'usd',
      unit_amount: unitAmount,
      lookup_key: item.lookupKey,
      transfer_lookup_key: true,
      metadata: { amp_catalog_item_id: item.id },
    })
    createdPrices += 1
    console.log(`Created price: ${item.name} - $${item.price.toFixed(2)}`)
  }
}

console.log({
  createdProducts,
  updatedProducts,
  createdPrices,
  unchangedPrices,
})
