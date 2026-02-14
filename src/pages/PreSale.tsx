import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/ProductCard'

export function PreSale() {
  const { products } = useProducts()
  const preSale = products.filter((p) => p.isPreSale)
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Pre-Sale
      </h1>
      <p className="mt-2 text-ink-600">
        Early access to upcoming products
      </p>
      {preSale.length === 0 ? (
        <p className="mt-12 text-ink-500">No pre-sale products at this time.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {preSale.map((p) => (
            <ProductCard key={p.id} product={p} badge="Pre-Sale" />
          ))}
        </div>
      )}
    </div>
  )
}
