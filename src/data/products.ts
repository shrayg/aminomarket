export type Product = {
  id: string
  name: string
  slug: string
  price: number
  category?: string | { name: string }
  categorySlug?: string
  inStock: boolean
  isFeatured: boolean
  isPreSale?: boolean
}

export function normalizeProduct(p: Record<string, unknown>): Product {
  const cat = p.category as { name?: string; slug?: string } | undefined
  return {
    id: String(p.id),
    name: String(p.name),
    slug: String(p.slug),
    price: Number(p.price),
    category: typeof cat?.name === 'string' ? cat.name : String(p.category || ''),
    categorySlug: cat?.slug || '',
    inStock: Boolean(p.inStock),
    isFeatured: Boolean(p.isFeatured),
    isPreSale: Boolean(p.isPreSale),
  }
}

export const categories = [
  { name: 'Research Peptides', slug: 'research-peptides', desc: '99% purity lab-tested compounds' },
  { name: 'Research Formulations', slug: 'research-formulations', desc: 'Advanced formulations' },
  { name: 'Accessories', slug: 'accessories', desc: '' },
  { name: 'Pre-Sale', slug: 'pre-sale', desc: '' },
]

export const staticProducts: Product[] = [
  { id: '1', name: 'Beauty Blend (GHK-Cu/KPV) – 50mg/20mg', slug: 'beauty-blend-ghk-cu-kpv-50mg-20mg', price: 85, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: true },
  { id: '2', name: 'SNAP-8 10mg', slug: 'snap-8-10mg', price: 40, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: true },
  { id: '3', name: 'TB-500 Frag 17-23 10mg', slug: 'tb-500-frag-17-23-10mg', price: 40, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: true },
  { id: '4', name: 'NAD+ 250mg (Buffered)', slug: 'nad-250mg-buffered', price: 35, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: true },
  { id: '5', name: 'AMP 3D-Printed Vial Case – 10 Slot Secure Storage Box', slug: 'amp-3d-printed-vial-case', price: 15, category: 'Accessories', categorySlug: 'accessories', inStock: true, isFeatured: true },
  { id: '6', name: 'AMP-2P 30mg', slug: 'amp-2p-30mg', price: 90, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '7', name: 'AMP-2P 60mg', slug: 'amp-2p-60mg', price: 155, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '8', name: 'Tesamorelin 10mg', slug: 'tesamorelin-10mg', price: 48, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: false, isFeatured: false },
  { id: '9', name: 'AMP-3P 24mg', slug: 'amp-3p-24mg', price: 110, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '10', name: 'AMP-3P 12mg', slug: 'amp-3p-12mg', price: 75, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '11', name: 'AOD-9604 – 2mg', slug: 'aod-9604-2mg', price: 35, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '12', name: 'L-Carnitine 500mg/mL – 10mL', slug: 'l-carnitine-500mg-ml-10ml', price: 60, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '13', name: 'Thymosin Alpha 1 – 10mg', slug: 'thymosin-alpha-1-10mg', price: 55, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '14', name: 'Retinal X Serum - Encapsulated Retinal & Botanical Extracts (30 mL)', slug: 'retinal-x-serum', price: 45, category: 'Research Formulations', categorySlug: 'research-formulations', inStock: true, isFeatured: false },
  { id: '15', name: 'BPC-157 10mg', slug: 'bpc-157-10mg', price: 35, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
  { id: '16', name: 'GHK-Cu 50mg', slug: 'ghk-cu-50mg', price: 28, category: 'Research Peptides', categorySlug: 'research-peptides', inStock: true, isFeatured: false },
]
