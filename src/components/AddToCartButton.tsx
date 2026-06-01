import { useState } from 'react'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product, ProductVariant } from '@/data/products'
import { trackEvent } from '@/lib/analytics'

const MIN_QTY = 1
const MAX_QTY = 99

const clampQty = (n: number) =>
  Math.min(MAX_QTY, Math.max(MIN_QTY, Number.isFinite(n) ? Math.floor(n) : MIN_QTY))

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
    trackEvent('add_to_cart', {
      productSlug: product.slug,
      value: price * quantity,
      metadata: { quantity, itemId: id, variant: variantLabel || '' },
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const decrement = () => setQuantity((q) => clampQty(q - 1))
  const increment = () => setQuantity((q) => clampQty(q + 1))

  return (
    <div className={`flex items-stretch gap-2 ${className}`}>
      <div
        role="group"
        aria-label={`Quantity for ${name}`}
        className="flex shrink-0 items-stretch border-2 border-ink-200 bg-white"
      >
        <button
          type="button"
          onClick={decrement}
          disabled={quantity <= MIN_QTY}
          aria-label="Decrease quantity"
          className="flex w-9 items-center justify-center text-ink-600 transition hover:bg-ink-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={MIN_QTY}
          max={MAX_QTY}
          inputMode="numeric"
          value={quantity}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10)
            setQuantity(clampQty(next))
          }}
          className="w-10 border-x border-ink-200 bg-transparent text-center text-sm font-bold text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`Quantity of ${name}`}
        />
        <button
          type="button"
          onClick={increment}
          disabled={quantity >= MAX_QTY}
          aria-label="Increase quantity"
          className="flex w-9 items-center justify-center text-ink-600 transition hover:bg-ink-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
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
