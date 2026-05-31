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
    categorySlug: cat?.slug || '',
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

const IMG = '/products'

function v(id: string, dose: string, price: number, image: string, inStock = true): ProductVariant {
  return { id, dose, price, image: `${IMG}/${image}`, inStock }
}

export const staticProducts: Product[] = [
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    price: 28,
    image: `${IMG}/pomelli-bdna-image-0530.webp`,
    description:
      'GHK-Cu (Copper Peptide) — tripeptide-copper complex researched for skin remodeling, wound repair, and antioxidant pathways. 99% purity, third-party tested.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('ghk-cu-50', '50mg', 28, 'pomelli-bdna-image-0530.webp'),
      v('ghk-cu-100', '100mg', 48, 'pomelli-bdna-image-05301.webp'),
    ],
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    price: 22,
    image: `${IMG}/pomelli-bdna-image-05304.webp`,
    description:
      'Tesamorelin — GHRH analog studied for visceral adipose reduction and IGF-1 pathway research. 99% purity, third-party tested.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('tesa-2', '2mg', 22, 'pomelli-bdna-image-05302.webp'),
      v('tesa-5', '5mg', 35, 'pomelli-bdna-image-05303.webp'),
      v('tesa-10', '10mg', 48, 'pomelli-bdna-image-05304.webp'),
      v('tesa-20', '20mg', 80, 'pomelli-bdna-image-05305.webp'),
    ],
  },
  {
    id: 'wolverine-blend',
    name: 'Wolverine Blend (BPC-157 + TB-500)',
    slug: 'wolverine-blend',
    price: 45,
    image: `${IMG}/pomelli-bdna-image-05306.webp`,
    description:
      'Wolverine Blend — synergistic BPC-157 + TB-500 stack researched for connective tissue repair, vascular support, and recovery models.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('wolv-10', '10mg total', 45, 'pomelli-bdna-image-05306.webp'),
      v('wolv-20', '20mg total', 75, 'pomelli-bdna-image-05307.webp'),
    ],
  },
  {
    id: 'mt-2',
    name: 'MT-2 (Melanotan II)',
    slug: 'mt-2',
    price: 30,
    image: `${IMG}/pomelli-bdna-image-05308.webp`,
    description:
      'MT-2 (Melanotan II) — synthetic analog of α-MSH studied for melanogenesis pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: false,
    variants: [
      v('mt2-5', '5mg', 30, 'pomelli-bdna-image-05308.webp'),
      v('mt2-10', '10mg', 45, 'pomelli-bdna-image-05309.webp'),
    ],
  },
  {
    id: 'mt-1',
    name: 'MT-1 (Melanotan I)',
    slug: 'mt-1',
    price: 45,
    image: `${IMG}/pomelli-bdna-image-053030.webp`,
    description:
      'MT-1 (Melanotan I / Afamelanotide analog) — α-MSH analog studied for pigmentation pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: false,
    variants: [v('mt1-10', '10mg', 45, 'pomelli-bdna-image-053030.webp')],
  },
  {
    id: 'glp-trz',
    name: 'GLP-TRZ (Tirzepatide Research)',
    slug: 'glp-trz',
    price: 40,
    image: `${IMG}/pomelli-bdna-image-053024.webp`,
    description:
      'GLP-TRZ — dual GIP/GLP-1 receptor agonist research compound studied for metabolic and glucoregulatory pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('trz-5', '5mg', 40, 'pomelli-bdna-image-053010.webp'),
      v('trz-10', '10mg', 65, 'pomelli-bdna-image-053021.webp'),
      v('trz-15', '15mg', 85, 'pomelli-bdna-image-053020.webp'),
      v('trz-20', '20mg', 105, 'pomelli-bdna-image-053023.webp'),
      v('trz-30', '30mg', 140, 'pomelli-bdna-image-053017.webp'),
      v('trz-40', '40mg', 175, 'pomelli-bdna-image-053024.webp'),
      v('trz-50', '50mg', 210, 'pomelli-bdna-image-053016.webp'),
      v('trz-60', '60mg', 240, 'pomelli-bdna-image-053018.webp'),
      v('trz-70', '70mg', 270, 'pomelli-bdna-image-053015.webp'),
      v('trz-80', '80mg', 295, 'pomelli-bdna-image-053019.webp'),
      v('trz-90', '90mg', 320, 'pomelli-bdna-image-053013.webp'),
      v('trz-100', '100mg', 345, 'pomelli-bdna-image-053012.webp'),
      v('trz-120', '120mg', 395, 'pomelli-bdna-image-053014.webp'),
    ],
  },
  {
    id: 'glp-sem',
    name: 'GLP-SEM (Semaglutide Research)',
    slug: 'glp-sem',
    price: 30,
    image: `${IMG}/pomelli-bdna-image-053036.webp`,
    description:
      'GLP-SEM — GLP-1 receptor agonist research compound studied for incretin pathway and glucose research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('sem-2', '2mg', 30, 'pomelli-bdna-image-053039.webp'),
      v('sem-5', '5mg', 55, 'pomelli-bdna-image-053038.webp'),
      v('sem-10', '10mg', 95, 'pomelli-bdna-image-053036.webp'),
      v('sem-15', '15mg', 130, 'pomelli-bdna-image-053044.webp'),
      v('sem-20', '20mg', 160, 'pomelli-bdna-image-053037.webp'),
      v('sem-30', '30mg', 220, 'pomelli-bdna-image-053043.webp'),
    ],
  },
  {
    id: 'glp-rt',
    name: 'GLP-RT (Retatrutide Research)',
    slug: 'glp-rt',
    price: 45,
    image: `${IMG}/pomelli-photoshoot-image-1-1-0530.webp`,
    description:
      'GLP-RT — triple receptor agonist research compound (GLP-1 / GIP / glucagon) studied for advanced metabolic pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [
      v('rt-5', '5mg', 45, 'pomelli-photoshoot-image-1-1-05301.webp'),
      v('rt-10', '10mg', 75, 'pomelli-photoshoot-image-1-1-0530.webp'),
      v('rt-15', '15mg', 105, 'pomelli-photoshoot-image-1-1-05303.webp'),
      v('rt-20', '20mg', 135, 'pomelli-photoshoot-image-1-1-05302.webp'),
      v('rt-30', '30mg', 185, 'pomelli-photoshoot-image-1-1-05305.webp'),
      v('rt-40', '40mg', 235, 'pomelli-photoshoot-image-1-1-05304.webp'),
      v('rt-60', '60mg', 325, 'pomelli-photoshoot-image-1-1-05306.webp'),
    ],
  },
  {
    id: 'glow-blend',
    name: 'GLOW Blend (BPC-157 + TB-500 + GHK-Cu)',
    slug: 'glow-blend',
    price: 95,
    image: `${IMG}/pomelli-bdna-image-053025.webp`,
    description:
      'GLOW Blend — premium triple stack of BPC-157 10mg + TB-500 10mg + GHK-Cu 50mg researched for repair, recovery, and skin/collagen pathway models.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: true,
    variants: [v('glow-70', '70mg total', 95, 'pomelli-bdna-image-053025.webp')],
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    slug: 'mots-c',
    price: 45,
    image: `${IMG}/pomelli-bdna-image-053026.webp`,
    description:
      'MOTS-c — mitochondrial-derived peptide researched for metabolic homeostasis and cellular energy pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: false,
    variants: [
      v('mots-10', '10mg', 45, 'pomelli-bdna-image-053026.webp'),
      v('mots-15', '15mg', 60, 'pomelli-bdna-image-053027.webp'),
      v('mots-20', '20mg', 75, 'pomelli-bdna-image-053028.webp'),
      v('mots-40', '40mg', 130, 'pomelli-bdna-image-053029.webp'),
    ],
  },
  {
    id: 'semax',
    name: 'Semax',
    slug: 'semax',
    price: 30,
    image: `${IMG}/pomelli-bdna-image-053031.webp`,
    description:
      'Semax — synthetic ACTH(4-10) analog studied for neurotrophic and cognitive pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: false,
    variants: [
      v('sx-5', '5mg', 30, 'pomelli-bdna-image-053032.webp'),
      v('sx-10', '10mg', 50, 'pomelli-bdna-image-053031.webp'),
    ],
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    price: 25,
    image: `${IMG}/pomelli-bdna-image-053033.webp`,
    description:
      'Ipamorelin — selective GH secretagogue researched for somatotropic axis and recovery pathway research.',
    category: 'Research Peptides',
    categorySlug: 'research-peptides',
    inStock: true,
    isFeatured: false,
    variants: [
      v('ipa-2', '2mg', 25, 'pomelli-bdna-image-053035.webp'),
      v('ipa-5', '5mg', 40, 'pomelli-bdna-image-053034.webp'),
      v('ipa-10', '10mg', 65, 'pomelli-bdna-image-053033.webp'),
    ],
  },
  {
    id: 'vial-case',
    name: 'AMP Vial Case — 10 Slot Secure Storage Box',
    slug: 'amp-vial-case',
    price: 15,
    description: '3D-printed vial case for secure storage of up to 10 research vials.',
    category: 'Accessories',
    categorySlug: 'accessories',
    inStock: true,
    isFeatured: false,
  },
]

export function getStartingPrice(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((vr) => vr.price))
  }
  return product.price
}
