import { Router } from 'express'
import { catalogProducts } from '../catalog.js'
import { isPublicCatalogVisible } from '../lib/catalog-visibility.js'

const router = Router()

router.get('/', (req, res) => {
  if (!isPublicCatalogVisible()) {
    return res.json([])
  }
  const { category } = req.query
  const products = category
    ? catalogProducts.filter((product) => product.categorySlug === category)
    : catalogProducts
  res.json(products)
})

router.get('/:slug', (req, res) => {
  if (!isPublicCatalogVisible()) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const product = catalogProducts.find(({ slug }) => slug === req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

export default router
