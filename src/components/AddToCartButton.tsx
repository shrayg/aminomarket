import type { Product, ProductVariant } from '@/data/products'

// Sales are currently suspended. This component preserves every existing
// import site (Product page, Shop, etc.) but no longer adds anything to a
// cart, no longer fires `add_to_cart` analytics, and no longer ties to
// the checkout flow. Re-enabling commerce means restoring the prior
// implementation in git history; do not partially re-enable it here.
export function AddToCartButton({
  className = '',
}: {
  product: Product
  variant?: ProductVariant
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-center border border-ink-200 bg-ink-50 px-4 py-3 text-center text-sm font-medium text-ink-600 ${className}`}
      role="status"
    >
      Not currently accepting orders &mdash; catalog reference only.
    </div>
  )
}
