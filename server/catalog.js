import { readFileSync } from 'node:fs'

export const catalogProducts = JSON.parse(
  readFileSync(new URL('../catalog/products.json', import.meta.url), 'utf8')
)

export function checkoutItemId(product, variant) {
  return variant ? `${product.id}__${variant.id}` : product.id
}

export function stripeLookupKey(itemId) {
  return `amp_${itemId.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`
}

// Site prices were initialized at half of the supplier's 10-vial kit quote.
// Keep the corresponding per-vial cost basis server-side for operational
// gross-profit estimates without exposing supplier pricing to the storefront.
function estimatedUnitCostCents(price) {
  return Math.round(Number(price) * 100 / 5)
}

export const catalogCheckoutItems = catalogProducts.flatMap((product) => {
  if (!product.variants?.length) {
    return [{
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      estimatedUnitCostCents: estimatedUnitCostCents(product.price),
      lookupKey: stripeLookupKey(product.id),
    }]
  }

  return product.variants.map((variant) => ({
    id: checkoutItemId(product, variant),
    productId: product.id,
    name: `${product.name} - ${variant.dose}`,
    price: variant.price,
    estimatedUnitCostCents: estimatedUnitCostCents(variant.price),
    lookupKey: stripeLookupKey(checkoutItemId(product, variant)),
  }))
})

const checkoutItemById = new Map(catalogCheckoutItems.map((item) => [item.id, item]))
const checkoutItemByName = new Map(catalogCheckoutItems.map((item) => [item.name, item]))
const checkoutItemByLookupKey = new Map(
  catalogCheckoutItems.map((item) => [item.lookupKey, item])
)

export function getCheckoutItem(id) {
  return checkoutItemById.get(id)
}

export function getCheckoutItemByLookupKey(lookupKey) {
  return checkoutItemByLookupKey.get(lookupKey)
}

export function getCheckoutItemByName(name) {
  return checkoutItemByName.get(name)
}
