import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'
import { normalizeProduct, staticProducts, type Product } from '@/data/products'

function filterByCategory(list: Product[], category?: string) {
  if (!category) return list
  return list.filter((p) => p.categorySlug === category)
}

export function useProducts(category?: string) {
  const initial = useMemo(() => filterByCategory(staticProducts, category), [category])
  const [products, setProducts] = useState<Product[]>(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setProducts(filterByCategory(staticProducts, category))
    setLoading(true)
    let cancelled = false
    api.products
      .list(category)
      .then((data: unknown[]) => {
        if (cancelled) return
        const apiList = (data as Record<string, unknown>[]).map(normalizeProduct)
        if (apiList.length > 0) setProducts(apiList)
      })
      .catch(() => {
        if (!cancelled) setProducts(filterByCategory(staticProducts, category))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category])

  return { products, loading }
}

export function useProduct(slug: string | undefined) {
  const initial = useMemo(
    () => (slug ? staticProducts.find((p) => p.slug === slug) ?? null : null),
    [slug]
  )
  const [product, setProduct] = useState<Product | null>(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) return setLoading(false)
    setProduct(staticProducts.find((p) => p.slug === slug) ?? null)
    setLoading(true)
    let cancelled = false
    api.products
      .get(slug)
      .then((data: Record<string, unknown>) => {
        if (cancelled) return
        setProduct(normalizeProduct(data))
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(staticProducts.find((p) => p.slug === slug) ?? null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { product, loading }
}
