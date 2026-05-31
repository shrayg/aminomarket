import { Router } from 'express'
import { catalogProducts } from '../catalog.js'

const router = Router()

router.get('/', (req, res) => {
  const { category } = req.query
  const products = category
    ? catalogProducts.filter((product) => product.categorySlug === category)
    : catalogProducts
  res.json(products)
})

router.get('/:slug', (req, res) => {
  const product = catalogProducts.find(({ slug }) => slug === req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

export default router
