import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { normalizeProduct, staticProducts, type Product } from '@/data/products'

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>(staticProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.products
      .list(category)
      .then((data: unknown[]) => setProducts((data as Record<string, unknown>[]).map(normalizeProduct)))
      .catch(() => setProducts(staticProducts))
      .finally(() => setLoading(false))
  }, [category])

  return { products, loading }
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return setLoading(false)
    api.products
      .get(slug)
      .then((data: Record<string, unknown>) => setProduct(normalizeProduct(data)))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  return { product, loading }
}
