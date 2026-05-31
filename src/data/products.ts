import productCatalog from '../../catalog/products.json'

export type ProductVariant = {
  id: string
  dose: string
  price: number
  image: string
  inStock: boolean
}

export type Product = {
  id: string
  name: string
  slug: string
  price: number
  image?: string
  description?: string
  category?: string | { name: string }
  categorySlug?: string
  inStock: boolean
  isFeatured: boolean
  isPreSale?: boolean
  variants?: ProductVariant[]
}

export function normalizeProduct(p: Record<string, unknown>): Product {
  const cat = p.category as { name?: string; slug?: string } | undefined
  return {
    id: String(p.id),
    name: String(p.name),
    slug: String(p.slug),
    price: Number(p.price),
    image: typeof p.image === 'string' ? p.image : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    category: typeof cat?.name === 'string' ? cat.name : String(p.category || ''),
    categorySlug: cat?.slug || String(p.categorySlug || ''),
    inStock: Boolean(p.inStock),
    isFeatured: Boolean(p.isFeatured),
    isPreSale: Boolean(p.isPreSale),
    variants: Array.isArray(p.variants) ? (p.variants as ProductVariant[]) : undefined,
  }
}

export const categories = [
  { name: 'Research Peptides', slug: 'research-peptides', desc: '99% purity lab-tested compounds' },
  { name: 'Research Formulations', slug: 'research-formulations', desc: 'Advanced formulations' },
  { name: 'Accessories', slug: 'accessories', desc: '' },
  { name: 'Pre-Sale', slug: 'pre-sale', desc: '' },
]

export const staticProducts = productCatalog as Product[]

export function getStartingPrice(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((variant) => variant.price))
  }
  return product.price
}

export { generatedProductImages } from './generatedProductImages'
