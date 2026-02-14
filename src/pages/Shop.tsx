import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/ProductCard'

export function Shop() {
  const [params] = useSearchParams()
  const category = params.get('category') || undefined
  const { products, loading } = useProducts(category)

  // API returns filtered list when category is passed

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900 md:text-4xl">
        Shop
      </h1>
      <p className="mt-2 text-ink-600">
        Showing {products.length} products
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-center text-ink-500">Loading...</p>
        ) : (
          products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            badge={!p.inStock ? undefined : p.isFeatured ? 'NEW' : undefined}
          />
          ))
        )}
      </div>
    </div>
  )
}
