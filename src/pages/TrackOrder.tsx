import { useState } from 'react'
import { api, type CustomerOrder } from '@/lib/api'

export function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setOrder(null)
    try {
      setOrder(await api.trackOrder(orderId, email))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not find that order.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Track Order
      </h1>
      <form onSubmit={submit} className="mt-10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700">
            Order Number
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order number"
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">
            Order Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter the email used at checkout"
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800"
        >
          Track
        </button>
      </form>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {order && (
        <div className="mt-6 rounded-2xl border border-ink-200 p-5">
          <p className="text-xs uppercase tracking-wider text-ink-500">Fulfillment status</p>
          <p className="mt-1 font-semibold capitalize text-ink-900">{order.fulfillmentStatus}</p>
          <p className="mt-4 text-sm text-ink-600">Order total: ${order.total.toFixed(2)}</p>
          {order.trackingNumber && <p className="mt-2 text-sm text-ink-600">Tracking: {order.trackingNumber}</p>}
        </div>
      )}
    </div>
  )
}
