import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product, ProductVariant } from '@/data/products'

export function AddToCartButton({
  product,
  variant,
  className = '',
}: {
  product: Product
  variant?: ProductVariant
  className?: string
}) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const resolved = variant ?? product.variants?.[0]
  const id = resolved ? `${product.id}__${resolved.id}` : product.id
  const price = resolved ? resolved.price : product.price
  const image = resolved ? resolved.image : product.image
  const variantLabel = resolved?.dose
  const name = resolved ? `${product.name} — ${resolved.dose}` : product.name

  const handleClick = () => {
    addItem({
      id,
      productId: product.id,
      name,
      slug: product.slug,
      price,
      image,
      variantLabel,
    }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={`flex items-stretch gap-2 ${className}`}>
      <label className="flex shrink-0 items-center gap-2 border-2 border-ink-200 bg-white px-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-600">
        <span>Qty</span>
        <input
          type="number"
          min="1"
          max="99"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10)
            setQuantity(Number.isFinite(next) ? Math.min(99, Math.max(1, next)) : 1)
          }}
          className="w-8 bg-transparent text-center text-sm font-bold text-ink-900 outline-none"
          aria-label={`Quantity of ${name}`}
        />
      </label>
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-center justify-center gap-2 border-2 border-ink-900 bg-ink-900 px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-ink-800 active:scale-[0.98]"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </>
        )}
      </button>
    </div>
  )
}
