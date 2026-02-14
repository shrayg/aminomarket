import { useState } from 'react'

export function TrackOrder() {
  const [orderId, setOrderId] = useState('')

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Track Order
      </h1>
      <form className="mt-10 space-y-4">
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
        <button
          type="submit"
          className="w-full rounded-xl bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800"
        >
          Track
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-500">
        PLACEHOLDER: Add order tracking API
      </p>
    </div>
  )
}
