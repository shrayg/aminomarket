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
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 border-2 border-ink-900 bg-ink-900 px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-ink-800 active:scale-[0.98] ${className}`}
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
  )
}
