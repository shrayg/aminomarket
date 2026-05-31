import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { getStartingPrice, type Product } from '@/data/products'
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
  const startingPrice = getStartingPrice(product)
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1

  return (
    <article className="group flex flex-col border border-ink-200 bg-white transition hover:border-ink-300">
      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-ink-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FlaskConical className="h-16 w-16 text-ink-300 transition group-hover:text-ink-400" />
            </div>
          )}
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
          <h3 className="mt-2 font-sans font-semibold text-ink-900 transition group-hover:text-accent-dark">
            {product.name}
          </h3>
          {hasMultipleVariants && (
            <p className="mt-1 font-sans text-xs text-ink-500">
              {product.variants!.length} dosage options
            </p>
          )}
          <p className="mt-auto pt-4 font-sans text-xl font-bold text-ink-900">
            {hasMultipleVariants && (
              <span className="mr-1 text-sm font-medium text-ink-500">from</span>
            )}
            ${startingPrice.toFixed(2)}
          </p>
        </div>
      </Link>
      <div className="border-t border-ink-100 p-5">
        {product.inStock ? (
          hasMultipleVariants ? (
            <Link
              to={`/product/${product.slug}`}
              className="flex w-full items-center justify-center gap-2 border-2 border-ink-900 bg-ink-900 px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-ink-800"
            >
              Select dosage
            </Link>
          ) : (
            <AddToCartButton product={product} className="w-full" />
          )
        ) : (
          <p className="text-center font-sans text-sm text-ink-500">
            Join the waitlist for updates.
          </p>
        )}
      </div>
    </article>
  )
}
