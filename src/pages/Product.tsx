import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { AddToCartButton } from '@/components/AddToCartButton'
import { FadeImageStack } from '@/components/FadeImageStack'
import { hasAnalyticsConsent, trackEvent } from '@/lib/analytics'

export function Product() {
  const { slug } = useParams()
  const { product, loading } = useProduct(slug)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const trackedProductSlug = useRef('')

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined
    return (
      product.variants.find((v) => v.id === selectedVariantId) ??
      product.variants[0]
    )
  }, [product, selectedVariantId])

  const gallery = useMemo(() => {
    if (!product) return []
    const fromProduct = product.images?.length ? product.images : product.image ? [product.image] : []
    return [...new Set(fromProduct.filter(Boolean))]
  }, [product])

  useEffect(() => {
    setSelectedImage(null)
    setSelectedVariantId(null)
  }, [product?.slug])

  useEffect(() => {
    function fire() {
      if (!product) return
      if (!hasAnalyticsConsent()) return
      if (trackedProductSlug.current === product.slug) return
      trackedProductSlug.current = product.slug
      trackEvent('product_view', { productSlug: product.slug })
    }
    fire()
    window.addEventListener('amp-consent', fire)
    return () => window.removeEventListener('amp-consent', fire)
  }, [product])

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
        <Link
          to="/shop"
          className="mt-4 inline-block text-ink-900 underline underline-offset-2 hover:text-accent-dark"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  const displayImage =
    selectedImage ?? selectedVariant?.image ?? product.image ?? gallery[0]
  const displayPrice = selectedVariant?.price ?? product.price
  const inStock = selectedVariant ? selectedVariant.inStock : product.inStock
  const activeGalleryIndex = Math.max(0, gallery.indexOf(displayImage || ''))

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
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-brand-mist via-ink-50 to-brand-lavender/30">
            {gallery.length > 0 ? (
              <FadeImageStack
                images={gallery}
                activeIndex={activeGalleryIndex}
                alt={product.name}
                imageClassName="object-contain"
                durationMs={800}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FlaskConical className="h-32 w-32 text-ink-300" />
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((image, i) => {
                const active = i === activeGalleryIndex
                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-xl border bg-ink-50 transition duration-300 ${
                      active ? 'border-brand-purple ring-1 ring-brand-purple' : 'border-ink-200 hover:border-brand-lavender'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain" />
                  </button>
                )
              })}
            </div>
          )}
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
            ${displayPrice.toFixed(2)}
          </p>

          {product.description && (
            <p className="mt-6 max-w-md font-serif leading-relaxed text-ink-600">
              {product.description}
            </p>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="mt-8">
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-500">
                Select Size
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.variants.map((vr) => {
                  const isSelected = selectedVariant?.id === vr.id
                  return (
                    <button
                      key={vr.id}
                      onClick={() => {
                        setSelectedVariantId(vr.id)
                        if (vr.image) setSelectedImage(vr.image)
                      }}
                      disabled={!vr.inStock}
                      className={`relative min-w-[80px] border px-4 py-3 font-sans text-sm font-semibold transition ${
                        isSelected
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : 'border-ink-200 bg-white text-ink-900 hover:border-ink-400'
                      } ${!vr.inStock ? 'cursor-not-allowed opacity-40' : ''}`}
                    >
                      <span className="block">{vr.dose}</span>
                      <span
                        className={`block text-xs font-normal ${
                          isSelected ? 'text-ink-300' : 'text-ink-500'
                        }`}
                      >
                        ${vr.price.toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm text-ink-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            In stock · Cosmetic hair care · External use only
          </div>

          {inStock ? (
            <div className="mt-8">
              <AddToCartButton
                product={product}
                variant={selectedVariant}
                className="max-w-xs py-4"
              />
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
