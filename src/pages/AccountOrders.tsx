import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AccountShell } from '@/components/AccountShell'
import { api, type CustomerOrder } from '@/lib/api'

function money(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export function AccountOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.account.orders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AccountShell title="Order History" subtitle="View your paid orders and fulfillment progress" back>
      <div className="mt-10 space-y-4">
        {loading && <p className="text-sm text-ink-500">Loading orders...</p>}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-ink-200 p-8 text-center">
            <PackageSearch className="mx-auto h-8 w-8 text-ink-400" />
            <p className="mt-4 font-medium text-ink-900">No paid orders yet</p>
            <p className="mt-2 text-sm text-ink-600">Your completed purchases will appear here.</p>
            <Link to="/shop" className="mt-5 inline-block text-sm font-semibold text-ink-900 underline underline-offset-4">
              Browse the shop
            </Link>
          </div>
        )}
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-ink-200 p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">Order number</p>
                <p className="mt-1 break-all text-sm font-semibold text-ink-900">{order.id}</p>
                <p className="mt-2 text-sm text-ink-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink-900">{money(order.total, order.currency)}</p>
                <p className="mt-2 inline-block rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold capitalize text-ink-700">
                  {order.fulfillmentStatus}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-ink-100 pt-4">
              {order.items.map((item, index) => (
                <p key={`${item.name}-${index}`} className="text-sm text-ink-600">
                  {item.quantity} x {item.name}
                </p>
              ))}
              {order.trackingNumber && (
                <p className="mt-4 text-sm font-medium text-ink-800">Tracking: {order.trackingNumber}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </AccountShell>
  )
}
