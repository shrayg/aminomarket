import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/data/products'

export function AddToCartButton({
  product,
  className = '',
}: {
  product: Product
  className?: string
}) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <button
      onClick={() =>
        addItem({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
        })
      }
      className={`flex items-center justify-center gap-2 border-2 border-ink-900 bg-ink-900 px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-ink-800 active:scale-[0.98] ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      Add to cart
    </button>
  )
}
