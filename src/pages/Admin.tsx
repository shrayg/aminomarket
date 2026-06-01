import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Clock3,
  CreditCard,
  Eye,
  LogOut,
  MousePointerClick,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

type Entry = { name: string; value: number }
type Address = {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}
type Order = {
  id: string
  createdAt: string
  email: string
  customerId: string
  customerName: string
  phone: string
  total: number
  currency: string
  checkoutStatus: string
  paymentStatus: string
  fulfillmentStatus: string
  trackingNumber: string
  note: string
  shipping: { name: string; address: Address | null } | null
  billing: { name: string; address: Address | null } | null
  items: { name: string; quantity: number; total: number }[]
}
type Customer = {
  id: string
  stripeCustomerId: string
  email: string
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
  shipping: { name: string; address: Address | null } | null
  billing: { name: string; address: Address | null } | null
}
type Dashboard = {
  generatedAt: string
  days: number
  analytics: {
    storageMode: 'database' | 'memory'
    metrics: {
      visits: number
      pageViews: number
      engagedVisits: number
      averageEngagedSeconds: number
      productViews: number
      addToCarts: number
      checkoutStarts: number
      trackedConversions: number
    }
    daily: {
      date: string
      visits: number
      engagedVisits: number
      productViews: number
      checkoutStarts: number
    }[]
    topPaths: Entry[]
    trafficSources: Entry[]
    products: { slug: string; views: number; addsToCart: number }[]
    searches: { query: string; count: number; zeroResults: number }[]
  }
  stripe: {
    configured: boolean
    warning: string | null
    metrics: {
      paidOrders: number
      revenue: number
      averageOrderValue: number
      openCheckouts: number
    }
    orders: Order[]
    customers: Customer[]
    dailyRevenue: Entry[]
    paymentStatuses: Entry[]
    purchasedProducts: Entry[]
  }
  registeredUsers: { id: string; email: string; name: string | null; createdAt: string }[]
}

type Tab = 'overview' | 'behavior' | 'searches' | 'orders' | 'customers' | 'payments'

const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'behavior', label: 'Behavior', icon: MousePointerClick },
  { id: 'searches', label: 'Searches', icon: Search },
  { id: 'orders', label: 'Orders', icon: Boxes },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
]

const fulfillmentStatuses = ['unfulfilled', 'processing', 'shipping', 'fulfilled', 'cancelled']

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function duration(seconds: number) {
  if (!seconds) return '0s'
  const minutes = Math.floor(seconds / 60)
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
}

function date(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value)
  )
}

function address(value: Address | null) {
  if (!value) return 'Not collected'
  return [value.line1, value.line2, `${value.city}, ${value.state} ${value.postalCode}`, value.country]
    .filter(Boolean)
    .join(', ')
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string
  note: string
  icon: typeof Activity
}) {
  return (
    <div className="border border-ink-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-ink-900">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">{note}</p>
        </div>
        <Icon className="h-5 w-5 text-accent-dark" />
      </div>
    </div>
  )
}

function BarList({
  rows,
  empty = 'No data collected yet.',
  formatValue = compactNumber,
}: {
  rows: Entry[]
  empty?: string
  formatValue?: (value: number) => string
}) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-ink-400">{empty}</p>

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate text-ink-700">{row.name}</span>
            <span className="font-semibold text-ink-900">{formatValue(row.value)}</span>
          </div>
          <div className="h-2 bg-ink-100">
            <div
              className="h-full bg-accent-dark"
              style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DailyChart({
  title,
  subtitle,
  rows,
  valueKey,
  color = 'bg-ink-900',
  formatValue = compactNumber,
}: {
  title: string
  subtitle: string
  rows: { date: string; [key: string]: string | number }[]
  valueKey: string
  color?: string
  formatValue?: (value: number) => string
}) {
  const visible = rows.slice(-14)
  const values = visible.map((row) => Number(row[valueKey] || 0))
  const max = Math.max(...values, 1)
  const total = values.reduce((sum, value) => sum + value, 0)

  return (
    <section className="border border-ink-200 bg-white p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-bold text-ink-900">{title}</h2>
          <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
        </div>
        <p className="text-lg font-bold text-ink-900">{formatValue(total)}</p>
      </div>
      <div className="mt-6 flex h-40 items-end gap-2">
        {visible.map((row) => {
          const value = Number(row[valueKey] || 0)
          return (
            <div key={row.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end">
              <div
                title={`${row.date}: ${formatValue(value)}`}
                className={`w-full min-w-1 transition group-hover:opacity-70 ${color}`}
                style={{ height: `${Math.max(3, (value / max) * 100)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-ink-400">
        <span>{visible[0]?.date || 'No data'}</span>
        <span>{visible[visible.length - 1]?.date || ''}</span>
      </div>
    </section>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-ink-200 bg-white p-5">
      <h2 className="font-bold text-ink-900">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function StatusBadge({ value }: { value: string }) {
  const tones: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800',
    fulfilled: 'bg-emerald-100 text-emerald-800',
    shipping: 'bg-sky-100 text-sky-800',
    processing: 'bg-amber-100 text-amber-800',
    unfulfilled: 'bg-ink-100 text-ink-700',
    unpaid: 'bg-rose-100 text-rose-800',
    cancelled: 'bg-rose-100 text-rose-800',
  }
  return (
    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[value] || 'bg-ink-100 text-ink-700'}`}>
      {value}
    </span>
  )
}

function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin(password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-white/10 bg-white p-7 shadow-2xl">
        <Logo variant="light" height="md" withText />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-accent-dark">
          Internal operations
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">Admin dashboard</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Sign in to view storefront analytics, Stripe summaries, and fulfillment status.
        </p>
        <label className="mt-6 block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            className="mt-2 w-full border border-ink-200 px-3 py-3 text-sm outline-none transition focus:border-ink-600"
          />
        </label>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-ink-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-ink-800 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Open dashboard'}
        </button>
      </form>
    </div>
  )
}

export function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('amp-admin-token') || '')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderFilter, setOrderFilter] = useState('all')

  const loadDashboard = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/dashboard?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load dashboard.')
      setDashboard(data)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Could not load dashboard.'
      setError(message)
      if (message.toLowerCase().includes('expired')) {
        sessionStorage.removeItem('amp-admin-token')
        setToken('')
      }
    } finally {
      setLoading(false)
    }
  }, [days, token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  async function login(password: string) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed.')
    sessionStorage.setItem('amp-admin-token', data.token)
    setToken(data.token)
  }

  function logout() {
    sessionStorage.removeItem('amp-admin-token')
    setDashboard(null)
    setToken('')
  }

  async function updateFulfillment(order: Order, status: string) {
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        trackingNumber: order.trackingNumber,
        note: order.note,
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not update fulfillment.')
    await loadDashboard()
    setSelectedOrder((current) => (current ? { ...current, fulfillmentStatus: status } : current))
  }

  const visibleOrders = useMemo(() => {
    const orders = dashboard?.stripe.orders || []
    if (orderFilter === 'all') return orders
    if (orderFilter === 'paid') return orders.filter((order) => order.paymentStatus === 'paid')
    return orders.filter((order) => order.fulfillmentStatus === orderFilter)
  }, [dashboard, orderFilter])

  if (!token) return <AdminLogin onLogin={login} />

  const analytics = dashboard?.analytics
  const stripe = dashboard?.stripe
  const checkoutConversion =
    analytics?.metrics.checkoutStarts && stripe
      ? (stripe.metrics.paidOrders / analytics.metrics.checkoutStarts) * 100
      : 0
  const engagedRate =
    analytics?.metrics.visits && analytics
      ? (analytics.metrics.engagedVisits / analytics.metrics.visits) * 100
      : 0
  const stripeRevenueRows =
    stripe?.dailyRevenue.map((row) => ({ date: row.name, revenue: row.value })) || []

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo variant="light" height="sm" withText />
            <span className="border-l border-ink-200 pl-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
              Operations
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="border border-ink-200 bg-white px-3 py-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="flex items-center gap-2 border border-ink-200 bg-white px-3 py-2 text-sm font-semibold transition hover:border-ink-400"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button type="button" onClick={logout} className="p-2 text-ink-500 hover:text-ink-900">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto border-b border-ink-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-ink-900 text-ink-900'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {dashboard?.analytics.storageMode === 'memory' && (
          <div className="mt-5 flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Analytics are using the non-persistent local fallback. Provision the PostgreSQL schema
            before deployment so visits and fulfillment updates survive server restarts.
          </div>
        )}
        {stripe?.warning && (
          <div className="mt-5 flex items-start gap-3 border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {stripe.warning}
          </div>
        )}

        {loading && !dashboard ? (
          <p className="py-24 text-center text-sm text-ink-500">Loading operations data...</p>
        ) : (
          <>
            {activeTab === 'overview' && analytics && stripe && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Visits" value={compactNumber(analytics.metrics.visits)} note={`${analytics.metrics.pageViews} total page views`} icon={Eye} />
                  <MetricCard label="Engaged visits" value={`${engagedRate.toFixed(1)}%`} note={`${analytics.metrics.engagedVisits} visits lasting more than 5 seconds`} icon={Clock3} />
                  <MetricCard label="Paid revenue" value={money(stripe.metrics.revenue)} note={`${stripe.metrics.paidOrders} paid Stripe Checkout sessions`} icon={CreditCard} />
                  <MetricCard label="Checkout conversion" value={`${checkoutConversion.toFixed(1)}%`} note={`${analytics.metrics.checkoutStarts} tracked checkout starts`} icon={ShoppingCart} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <DailyChart title="Visits" subtitle="Last 14 days of first-party storefront sessions" rows={analytics.daily} valueKey="visits" />
                  <DailyChart title="Paid revenue" subtitle="Recent Stripe Checkout revenue" rows={stripeRevenueRows} valueKey="revenue" color="bg-accent-dark" formatValue={money} />
                </div>
                <div className="grid gap-6 xl:grid-cols-3">
                  <Section title="Conversion funnel" subtitle="Tracked storefront progression">
                    <BarList rows={[
                      { name: 'Visits', value: analytics.metrics.visits },
                      { name: 'Product views', value: analytics.metrics.productViews },
                      { name: 'Add to carts', value: analytics.metrics.addToCarts },
                      { name: 'Checkout starts', value: analytics.metrics.checkoutStarts },
                      { name: 'Paid orders', value: stripe.metrics.paidOrders },
                    ]} />
                  </Section>
                  <Section title="Traffic sources" subtitle="Where tracked sessions began">
                    <BarList rows={analytics.trafficSources} />
                  </Section>
                  <Section title="Purchased products" subtitle="Stripe line-item quantity">
                    <BarList rows={stripe.purchasedProducts.slice(0, 8)} />
                  </Section>
                </div>
              </div>
            )}

            {activeTab === 'behavior' && analytics && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Average engaged time" value={duration(analytics.metrics.averageEngagedSeconds)} note="Average duration for sessions over 5 seconds" icon={Clock3} />
                  <MetricCard label="Product views" value={compactNumber(analytics.metrics.productViews)} note="Dedicated product-page visits" icon={Eye} />
                  <MetricCard label="Add to carts" value={compactNumber(analytics.metrics.addToCarts)} note="Add-to-cart interactions" icon={ShoppingCart} />
                  <MetricCard label="Checkout starts" value={compactNumber(analytics.metrics.checkoutStarts)} note="Visits reaching checkout" icon={PackageCheck} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <DailyChart title="Product interest" subtitle="Product-detail views over the last 14 days" rows={analytics.daily} valueKey="productViews" />
                  <DailyChart title="Checkout starts" subtitle="Checkout intent over the last 14 days" rows={analytics.daily} valueKey="checkoutStarts" color="bg-accent-dark" />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <Section title="Product interactions" subtitle="Detail-page views and add-to-cart actions">
                    {analytics.products.length === 0 ? (
                      <p className="py-8 text-center text-sm text-ink-400">No product interactions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[460px] text-left text-sm">
                          <thead className="text-xs uppercase tracking-wider text-ink-400">
                            <tr><th className="pb-3">Product</th><th className="pb-3">Views</th><th className="pb-3">Adds</th><th className="pb-3">Add rate</th></tr>
                          </thead>
                          <tbody>
                            {analytics.products.map((product) => (
                              <tr key={product.slug} className="border-t border-ink-100">
                                <td className="py-3 font-medium">{product.slug}</td>
                                <td className="py-3">{product.views}</td>
                                <td className="py-3">{product.addsToCart}</td>
                                <td className="py-3">{product.views ? `${((product.addsToCart / product.views) * 100).toFixed(1)}%` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Section>
                  <Section title="Top pages" subtitle="Most visited storefront paths">
                    <BarList rows={analytics.topPaths} />
                  </Section>
                </div>
              </div>
            )}

            {activeTab === 'searches' && analytics && (
              <div className="mt-6">
                <Section title="Shop search intelligence" subtitle="Use zero-result searches to spot catalog demand">
                  {analytics.searches.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-400">No shop searches collected yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-ink-400">
                          <tr><th className="pb-3">Search term</th><th className="pb-3">Searches</th><th className="pb-3">Zero-result searches</th><th className="pb-3">Opportunity</th></tr>
                        </thead>
                        <tbody>
                          {analytics.searches.map((search) => (
                            <tr key={search.query.toLowerCase()} className="border-t border-ink-100">
                              <td className="py-3 font-medium text-ink-900">{search.query}</td>
                              <td className="py-3">{search.count}</td>
                              <td className="py-3">{search.zeroResults}</td>
                              <td className="py-3">{search.zeroResults ? <span className="text-amber-700">Review demand</span> : <span className="text-ink-400">Covered</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {activeTab === 'orders' && stripe && (
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {['all', 'paid', 'unfulfilled', 'processing', 'shipping', 'fulfilled'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${orderFilter === filter ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <Section title="Recent orders" subtitle="Stripe Checkout sessions with local fulfillment status">
                  {visibleOrders.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-400">No orders match this filter.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[880px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-ink-400">
                          <tr><th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Date</th><th className="pb-3">Total</th><th className="pb-3">Payment</th><th className="pb-3">Fulfillment</th><th className="pb-3"></th></tr>
                        </thead>
                        <tbody>
                          {visibleOrders.map((order) => (
                            <tr key={order.id} className="border-t border-ink-100">
                              <td className="py-3 font-mono text-xs">{order.id.slice(0, 16)}...</td>
                              <td className="py-3"><p className="font-medium">{order.customerName || 'Guest'}</p><p className="text-xs text-ink-400">{order.email}</p></td>
                              <td className="py-3">{date(order.createdAt)}</td>
                              <td className="py-3 font-semibold">{money(order.total)}</td>
                              <td className="py-3"><StatusBadge value={order.paymentStatus} /></td>
                              <td className="py-3"><StatusBadge value={order.fulfillmentStatus} /></td>
                              <td className="py-3 text-right"><button type="button" onClick={() => setSelectedOrder(order)} className="text-xs font-bold uppercase tracking-wider text-accent-dark hover:text-ink-900">Details</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {activeTab === 'customers' && stripe && dashboard && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Stripe customers" value={compactNumber(stripe.customers.length)} note="Customers seen in recent Checkout sessions" icon={Users} />
                  <MetricCard label="Registered accounts" value={compactNumber(dashboard.registeredUsers.length)} note="Storefront login registrations" icon={Users} />
                  <MetricCard label="Repeat customers" value={compactNumber(stripe.customers.filter((customer) => customer.orderCount > 1).length)} note="Customers with more than one recent Checkout session" icon={Activity} />
                </div>
                <Section title="Checkout customers" subtitle="Shipping and billing details collected by Stripe Checkout">
                  {stripe.customers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-400">No Stripe customers in this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[960px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-ink-400">
                          <tr><th className="pb-3">Customer</th><th className="pb-3">Orders</th><th className="pb-3">Spent</th><th className="pb-3">Last order</th><th className="pb-3">Shipping</th><th className="pb-3">Billing</th></tr>
                        </thead>
                        <tbody>
                          {stripe.customers.map((customer) => (
                            <tr key={customer.id} className="border-t border-ink-100 align-top">
                              <td className="py-3"><p className="font-medium">{customer.name || 'Guest'}</p><p className="text-xs text-ink-400">{customer.email}</p></td>
                              <td className="py-3">{customer.orderCount}</td>
                              <td className="py-3 font-semibold">{money(customer.totalSpent)}</td>
                              <td className="py-3">{date(customer.lastOrderAt)}</td>
                              <td className="max-w-[260px] py-3 text-xs leading-relaxed text-ink-500">{address(customer.shipping?.address || null)}</td>
                              <td className="max-w-[260px] py-3 text-xs leading-relaxed text-ink-500">{address(customer.billing?.address || null)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                <Section title="Registered storefront accounts" subtitle="Accounts created through the storefront login flow">
                  {dashboard.registeredUsers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-400">No registered accounts available.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-ink-400">
                          <tr><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Created</th><th className="pb-3">Account ID</th></tr>
                        </thead>
                        <tbody>
                          {dashboard.registeredUsers.map((user) => (
                            <tr key={user.id} className="border-t border-ink-100">
                              <td className="py-3 font-medium">{user.name || 'Not provided'}</td>
                              <td className="py-3">{user.email}</td>
                              <td className="py-3">{date(user.createdAt)}</td>
                              <td className="py-3 font-mono text-xs text-ink-400">{user.id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {activeTab === 'payments' && stripe && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Revenue" value={money(stripe.metrics.revenue)} note="Paid Checkout session total" icon={CreditCard} />
                  <MetricCard label="Paid orders" value={compactNumber(stripe.metrics.paidOrders)} note="Stripe sessions marked paid" icon={PackageCheck} />
                  <MetricCard label="Average order" value={money(stripe.metrics.averageOrderValue)} note="Revenue divided by paid orders" icon={Activity} />
                  <MetricCard label="Open checkouts" value={compactNumber(stripe.metrics.openCheckouts)} note="Stripe sessions still in progress" icon={ShoppingCart} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <DailyChart title="Revenue trend" subtitle="Paid Stripe Checkout sessions" rows={stripeRevenueRows} valueKey="revenue" color="bg-accent-dark" formatValue={money} />
                  <Section title="Payment states" subtitle="Recent Stripe Checkout session status">
                    <BarList rows={stripe.paymentStatuses} />
                  </Section>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40" onClick={() => setSelectedOrder(null)}>
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-wider text-accent-dark">Order details</p><h2 className="mt-1 font-mono text-sm text-ink-700">{selectedOrder.id}</h2></div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-sm font-bold text-ink-500 hover:text-ink-900">Close</button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-ink-100 py-4 text-sm">
              <div><p className="text-xs uppercase tracking-wider text-ink-400">Payment</p><div className="mt-2"><StatusBadge value={selectedOrder.paymentStatus} /></div></div>
              <label><span className="text-xs uppercase tracking-wider text-ink-400">Fulfillment</span><select value={selectedOrder.fulfillmentStatus} onChange={(event) => setSelectedOrder({ ...selectedOrder, fulfillmentStatus: event.target.value })} className="mt-2 w-full border border-ink-200 px-2 py-2 text-sm">{fulfillmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            </div>
            <div className="mt-6 space-y-5 text-sm">
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400">Customer</p><p className="mt-2 font-semibold">{selectedOrder.customerName || 'Guest'}</p><p className="text-ink-500">{selectedOrder.email}</p><p className="text-ink-500">{selectedOrder.phone}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400">Shipping</p><p className="mt-2 leading-relaxed text-ink-600">{address(selectedOrder.shipping?.address || null)}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400">Billing</p><p className="mt-2 leading-relaxed text-ink-600">{address(selectedOrder.billing?.address || null)}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400">Items</p>{selectedOrder.items.map((item) => <div key={`${item.name}-${item.quantity}`} className="mt-2 flex justify-between border-b border-ink-100 py-2"><span>{item.name} x {item.quantity}</span><span className="font-semibold">{money(item.total)}</span></div>)}</div>
              <div className="flex justify-between border-t border-ink-200 pt-4 text-lg font-bold"><span>Total</span><span>{money(selectedOrder.total)}</span></div>
              <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-ink-400">Tracking number</span><input value={selectedOrder.trackingNumber} onChange={(event) => setSelectedOrder({ ...selectedOrder, trackingNumber: event.target.value })} className="mt-2 w-full border border-ink-200 px-3 py-2 text-sm outline-none focus:border-ink-600" /></label>
              <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-ink-400">Internal fulfillment note</span><textarea value={selectedOrder.note} onChange={(event) => setSelectedOrder({ ...selectedOrder, note: event.target.value })} rows={3} className="mt-2 w-full border border-ink-200 px-3 py-2 text-sm outline-none focus:border-ink-600" /></label>
              <button type="button" onClick={() => void updateFulfillment(selectedOrder, selectedOrder.fulfillmentStatus)} className="w-full bg-ink-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-ink-800">Save fulfillment update</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
