import { useParams, Link } from 'react-router-dom'
import { useProduct } from '@/hooks/useProducts'
import { AddToCartButton } from '@/components/AddToCartButton'

export function Product() {
  const { slug } = useParams()
  const { product, loading } = useProduct(slug)

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink-500">
        Loading...
      </div>
    )
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <nav className="mb-10 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-ink-700">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-16 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-ink-100 to-ink-50">
          <div className="flex h-full items-center justify-center text-9xl text-ink-200">
            🔬
          </div>
        </div>

        <div>
          {product.category && (
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-ink-400">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </p>
          )}
          <h1 className="font-sans text-3xl font-bold text-ink-900 md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-6 font-sans text-3xl font-bold text-ink-900">
            ${product.price.toFixed(2)}
          </p>
          {product.inStock ? (
            <div className="mt-8">
              <AddToCartButton product={product} className="max-w-xs py-4" />
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50 p-4">
              <p className="text-ink-600">
                Out of stock. Join the waitlist for availability updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
