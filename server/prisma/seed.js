import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { name: 'Research Peptides', slug: 'research-peptides', desc: '99% purity lab-tested compounds' },
  { name: 'Research Formulations', slug: 'research-formulations', desc: 'Advanced formulations' },
  { name: 'Accessories', slug: 'accessories', desc: '' },
  { name: 'Pre-Sale', slug: 'pre-sale', desc: '' },
]

const products = [
  { name: 'Beauty Blend (GHK-Cu/KPV) – 50mg/20mg', slug: 'beauty-blend-ghk-cu-kpv-50mg-20mg', price: 85, category: 'Research Peptides', inStock: true, isFeatured: true },
  { name: 'SNAP-8 10mg', slug: 'snap-8-10mg', price: 40, category: 'Research Peptides', inStock: true, isFeatured: true },
  { name: 'TB-500 Frag 17-23 10mg', slug: 'tb-500-frag-17-23-10mg', price: 40, category: 'Research Peptides', inStock: true, isFeatured: true },
  { name: 'NAD+ 250mg (Buffered)', slug: 'nad-250mg-buffered', price: 35, category: 'Research Peptides', inStock: true, isFeatured: true },
  { name: 'AMP 3D-Printed Vial Case – 10 Slot Secure Storage Box', slug: 'amp-3d-printed-vial-case', price: 15, category: 'Accessories', inStock: true, isFeatured: true },
  { name: 'AMP-2P 30mg', slug: 'amp-2p-30mg', price: 90, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'AMP-2P 60mg', slug: 'amp-2p-60mg', price: 155, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'Tesamorelin 10mg', slug: 'tesamorelin-10mg', price: 48, category: 'Research Peptides', inStock: false, isFeatured: false },
  { name: 'AMP-3P 24mg', slug: 'amp-3p-24mg', price: 110, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'AMP-3P 12mg', slug: 'amp-3p-12mg', price: 75, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'AOD-9604 – 2mg', slug: 'aod-9604-2mg', price: 35, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'L-Carnitine 500mg/mL – 10mL', slug: 'l-carnitine-500mg-ml-10ml', price: 60, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'Thymosin Alpha 1 – 10mg', slug: 'thymosin-alpha-1-10mg', price: 55, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'Retinal X Serum - Encapsulated Retinal & Botanical Extracts (30 mL)', slug: 'retinal-x-serum', price: 45, category: 'Research Formulations', inStock: true, isFeatured: false },
  { name: 'BPC-157 10mg', slug: 'bpc-157-10mg', price: 35, category: 'Research Peptides', inStock: true, isFeatured: false },
  { name: 'GHK-Cu 50mg', slug: 'ghk-cu-50mg', price: 28, category: 'Research Peptides', inStock: true, isFeatured: false },
]

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }

  const catMap = {}
  for (const c of await prisma.category.findMany()) {
    catMap[c.name] = c.id
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        categoryId: catMap[p.category] || null,
        inStock: p.inStock,
        isFeatured: p.isFeatured,
      },
    })
  }

  const hash = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hash,
    },
  })

  console.log('Seed done. Test user: test@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
