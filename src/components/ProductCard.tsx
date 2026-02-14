import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { type Product } from '@/data/products'
import { AddToCartButton } from './AddToCartButton'

export function ProductCard({
  product,
  showCategory = true,
  badge,
}: {
  product: Product
  showCategory?: boolean
  badge?: string
}) {
  return (
    <article className="group flex flex-col border border-ink-200 bg-white transition hover:border-ink-300">
      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square bg-ink-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <FlaskConical className="h-16 w-16 text-ink-300 transition group-hover:text-ink-400" />
          </div>
          {badge && (
            <span className="absolute left-0 top-0 bg-ink-900 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-white">
              {badge}
            </span>
          )}
          {!product.inStock && (
            <span className="absolute left-0 top-0 bg-ink-700 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {showCategory && product.category && (
            <p className="font-sans text-[11px] font-medium uppercase tracking-widest text-ink-400">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </p>
          )}
          <h3 className="mt-2 font-sans font-semibold text-ink-900 line-clamp-2 transition group-hover:text-accent-dark">
            {product.name}
          </h3>
          <p className="mt-auto pt-4 font-sans text-xl font-bold text-ink-900">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </Link>
      <div className="border-t border-ink-100 p-5">
        {product.inStock ? (
          <AddToCartButton product={product} className="w-full" />
        ) : (
          <p className="text-center font-sans text-sm text-ink-500">
            Join the waitlist for updates.
          </p>
        )}
      </div>
    </article>
  )
}
