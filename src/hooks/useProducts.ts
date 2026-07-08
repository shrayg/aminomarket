import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'
import { isPublicCatalogVisible } from '@/lib/catalog-visibility'
import { normalizeProduct, staticProducts, type Product } from '@/data/products'

function filterByCategory(list: Product[], category?: string) {
  if (!category) return list
  return list.filter((p) => p.categorySlug === category)
}

function mergeCatalogProduct(product: Product, apiProduct?: Product): Product {
  if (!apiProduct) return product
  return {
    ...product,
    inStock: apiProduct.inStock,
    isFeatured: apiProduct.isFeatured,
    isPreSale: apiProduct.isPreSale,
  }
}

function mergeCatalog(list: Product[], apiList: Product[]) {
  const apiBySlug = new Map(apiList.map((product) => [product.slug, product]))
  return list.map((product) => mergeCatalogProduct(product, apiBySlug.get(product.slug)))
}

export function useProducts(category?: string) {
  const catalogVisible = isPublicCatalogVisible()
  const initial = useMemo(
    () => (catalogVisible ? filterByCategory(staticProducts, category) : []),
    [catalogVisible, category]
  )
  const [products, setProducts] = useState<Product[]>(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!catalogVisible) {
      setProducts([])
      setLoading(false)
      return
    }
    setProducts(filterByCategory(staticProducts, category))
    setLoading(true)
    let cancelled = false
    api.products
      .list(category)
      .then((data: unknown[]) => {
        if (cancelled) return
        const apiList = (data as Record<string, unknown>[]).map(normalizeProduct)
        if (apiList.length > 0) {
          setProducts(mergeCatalog(filterByCategory(staticProducts, category), apiList))
        }
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
  }, [catalogVisible, category])

  return { products, loading }
}

export function useProduct(slug: string | undefined) {
  const catalogVisible = isPublicCatalogVisible()
  const initial = useMemo(
    () =>
      catalogVisible && slug
        ? staticProducts.find((p) => p.slug === slug) ?? null
        : null,
    [catalogVisible, slug]
  )
  const [product, setProduct] = useState<Product | null>(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!catalogVisible || !slug) {
      setProduct(null)
      setLoading(false)
      return
    }
    setProduct(staticProducts.find((p) => p.slug === slug) ?? null)
    setLoading(true)
    let cancelled = false
    api.products
      .get(slug)
      .then((data: Record<string, unknown>) => {
        if (cancelled) return
        const apiProduct = normalizeProduct(data)
        const catalogProduct = staticProducts.find((product) => product.slug === slug)
        setProduct(catalogProduct ? mergeCatalogProduct(catalogProduct, apiProduct) : apiProduct)
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
  }, [catalogVisible, slug])

  return { product, loading }
}
