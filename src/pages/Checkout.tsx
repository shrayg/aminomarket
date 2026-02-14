import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cart'

export function Checkout() {
  const { items, getTotal, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  if (items.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Return to shop
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { api } = await import('@/lib/api')
      const res = await api.checkout({
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        email: form.email,
        shipping: form,
      })
      clearCart()
      if (res.url && res.url.startsWith('http')) {
        window.location.href = res.url
      } else {
        navigate(res.url || '/order/success')
      }
    } catch {
      alert('Checkout failed. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-sans text-xl font-semibold text-ink-900">
            Shipping Information
          </h2>
          <div className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <input
              type="text"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <input
              type="text"
              required
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
              <input
                type="text"
                required
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
              <input
                type="text"
                required
                placeholder="ZIP"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-sans text-xl font-semibold text-ink-900">
            Order Summary
          </h2>
          <div className="mt-6 rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-ink-200 py-3 last:border-0"
              >
                <span className="text-ink-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="mt-6 flex justify-between font-sans text-xl font-bold">
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
            <p className="mt-4 text-center text-xs text-ink-500">
              PLACEHOLDER: Add Stripe or payment provider
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
