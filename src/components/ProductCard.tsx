import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { getStartingPrice, type Product } from '@/data/products'
import { AddToCartButton } from './AddToCartButton'

function productGallery(product: Product) {
  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : []
  return [...new Set(images.filter(Boolean))]
}

function randomIndex(length: number, exclude?: number) {
  if (length <= 1) return 0
  let next = Math.floor(Math.random() * length)
  if (exclude == null) return next
  while (next === exclude) next = Math.floor(Math.random() * length)
  return next
}

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
  const gallery = useMemo(() => productGallery(product), [product])
  const [imageIndex, setImageIndex] = useState(() => randomIndex(Math.max(gallery.length, 1)))

  useEffect(() => {
    setImageIndex(randomIndex(Math.max(gallery.length, 1)))
  }, [gallery])

  useEffect(() => {
    if (gallery.length <= 1) return
    const id = window.setInterval(() => {
      setImageIndex((current) => randomIndex(gallery.length, current))
    }, 4500)
    return () => window.clearInterval(id)
  }, [gallery])

  const displayImage = gallery[imageIndex] ?? product.image

  return (
    <article className="group flex flex-col border border-ink-200 bg-white transition hover:border-brand-purple/40 hover:shadow-[0_18px_40px_-28px_rgba(167,139,250,0.55)]">
      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-mist/70 via-ink-50 to-brand-lavender/20">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FlaskConical className="h-16 w-16 text-ink-300 transition group-hover:text-brand-purple" />
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
          <h3 className="mt-2 font-sans font-semibold text-ink-900 transition group-hover:text-brand-violet">
            {product.name}
          </h3>
          {hasMultipleVariants && (
            <p className="mt-1 font-sans text-xs text-ink-500">
              {product.variants!.length} size options
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
              className="flex w-full items-center justify-center gap-2 border-2 border-ink-900 bg-ink-900 px-4 py-3 font-sans text-sm font-semibold text-white transition hover:border-brand-violet hover:bg-brand-violet"
            >
              Select size
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
