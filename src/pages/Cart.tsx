import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cart'

export function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-6xl text-ink-300">🛒</div>
        <h1 className="mt-6 font-sans text-2xl font-bold text-ink-900">
          Your cart is empty
        </h1>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-xl bg-ink-900 px-8 py-3 font-semibold text-white transition hover:bg-ink-800"
        >
          Return to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Shopping Cart
      </h1>

      <div className="mt-12 space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-6 rounded-2xl border border-ink-200 bg-white p-6"
          >
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-ink-100 text-3xl">
              🔬
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/product/${item.slug}`}
                className="font-semibold text-ink-900 hover:text-accent-dark"
              >
                {item.name}
              </Link>
              <p className="text-ink-600">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50"
              >
                +
              </button>
            </div>
            <p className="w-28 text-right font-sans font-bold">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap justify-between gap-8 border-t border-ink-200 pt-12">
        <Link to="/shop" className="text-ink-600 hover:text-ink-900">
          ← Continue shopping
        </Link>
        <div className="text-right">
          <p className="font-sans text-2xl font-bold text-ink-900">
            Total: ${getTotal().toFixed(2)}
          </p>
          <Link
            to="/checkout"
            className="mt-4 inline-block rounded-xl bg-ink-900 px-8 py-4 font-semibold text-white transition hover:bg-ink-800"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
