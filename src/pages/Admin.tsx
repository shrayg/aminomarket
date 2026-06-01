import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronDown,
  Check,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  Factory,
  FileUp,
  KeyRound,
  LogOut,
  MousePointerClick,
  PackageCheck,
  Pause,
  RefreshCw,
  Search,
  Send,
  ShoppingCart,
  Upload,
  Users,
  X,
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
  batchId: string | null
  batchedAt: string | null
  shipping: { name: string; address: Address | null } | null
  billing: { name: string; address: Address | null } | null
  items: { name: string; quantity: number; total: number }[]
}
type ManufactureAggregate = {
  lines: { name: string; quantity: number }[]
  totalUnits: number
}
type ManufactureQueue = {
  configured: boolean
  generatedAt?: string
  orders: Order[]
  aggregate: ManufactureAggregate
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
type RotatingCode = {
  code: string
  hourBucket: number
  validFrom: string
  validTo: string
  expiresInSeconds: number
}

type ChartRange = '15m' | '1h' | '1d' | '1w' | '1mo' | '1y' | 'all'
type SeriesPoint = { bucketStart: string; bucketEnd: string; value: number }
type RangeSeries = Record<ChartRange, SeriesPoint[]>

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
    series: {
      visits: RangeSeries
      engagedVisits: RangeSeries
      productViews: RangeSeries
      addToCarts: RangeSeries
      checkoutStarts: RangeSeries
    }
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
    revenueSeries: RangeSeries
    paidOrderSeries: RangeSeries
    paymentStatuses: Entry[]
    purchasedProducts: Entry[]
  }
  registeredUsers: { id: string; email: string; name: string | null; createdAt: string }[]
}

type Tab =
  | 'overview'
  | 'behavior'
  | 'searches'
  | 'manufacture'
  | 'processing'
  | 'orders'
  | 'customers'
  | 'users'
  | 'payments'

const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'behavior', label: 'Behavior', icon: MousePointerClick },
  { id: 'searches', label: 'Searches', icon: Search },
  { id: 'manufacture', label: 'Manufacture', icon: Factory },
  { id: 'processing', label: 'Processing', icon: Pause },
  { id: 'orders', label: 'Orders', icon: Boxes },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
]

type AdminUserRow = {
  id: string
  email: string
  name: string
  role: 'customer' | 'affiliate' | 'admin'
  affiliateStatus: 'none' | 'pending' | 'approved' | 'denied'
  affiliateCode: string | null
  lifetimeSpendCents: number
  createdAt: string
}

type AffiliateStatusFilter = 'pending' | 'all' | 'none' | 'approved' | 'denied'

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
  control,
}: {
  label: string
  value: string
  note: string
  icon: typeof Activity
  control?: React.ReactNode
}) {
  return (
    <div className="border border-ink-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-ink-900">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">{note}</p>
          {control && <div className="mt-3">{control}</div>}
        </div>
        <Icon className="h-5 w-5 text-accent-dark" />
      </div>
    </div>
  )
}

const ENGAGED_THRESHOLDS = [5, 15, 60] as const
type EngagedThreshold = (typeof ENGAGED_THRESHOLDS)[number]

function formatEngagedThreshold(seconds: number) {
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60)
    return minutes === 1 ? '1 minute' : `${minutes} minutes`
  }
  return `${seconds} seconds`
}

function shortEngagedThreshold(seconds: number) {
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60)
    return minutes === 1 ? '1m' : `${minutes}m`
  }
  return `${seconds}s`
}

function EngagedThresholdToggle({
  value,
  onChange,
}: {
  value: EngagedThreshold
  onChange: (next: EngagedThreshold) => void
}) {
  return (
    <div
      role="group"
      aria-label="Engaged-visit threshold"
      className="inline-flex border border-ink-200 bg-ink-50 p-0.5"
    >
      {ENGAGED_THRESHOLDS.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
              active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {shortEngagedThreshold(option)}
          </button>
        )
      })}
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

const CHART_RANGES: { id: ChartRange; label: string; full: string }[] = [
  { id: '15m', label: '15m', full: 'Last 15 minutes' },
  { id: '1h', label: '1h', full: 'Last hour' },
  { id: '1d', label: '1d', full: 'Last 24 hours' },
  { id: '1w', label: '1w', full: 'Last week' },
  { id: '1mo', label: '1mo', full: 'Last 30 days' },
  { id: '1y', label: '1y', full: 'Last 12 months' },
  { id: 'all', label: 'All', full: 'All time' },
]

function formatBucketLabel(range: ChartRange, iso: string) {
  const d = new Date(iso)
  if (range === '15m' || range === '1h' || range === '1d') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (range === '1w' || range === '1mo') {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
}

function ChartRangeToggle({
  value,
  onChange,
}: {
  value: ChartRange
  onChange: (next: ChartRange) => void
}) {
  return (
    <div
      role="group"
      aria-label="Chart time range"
      className="flex flex-wrap gap-0.5 border border-ink-200 bg-ink-50 p-0.5"
    >
      {CHART_RANGES.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            title={option.full}
            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
              active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function RangeChart({
  title,
  subtitle,
  series,
  range,
  onRangeChange,
  formatValue = compactNumber,
  color = 'bg-ink-900',
}: {
  title: string
  subtitle: string
  series: RangeSeries | undefined
  range: ChartRange
  onRangeChange: (next: ChartRange) => void
  formatValue?: (value: number) => string
  color?: string
}) {
  const points = series?.[range] ?? []
  const values = points.map((p) => Number(p.value || 0))
  const max = Math.max(...values, 1)
  const total = values.reduce((sum, value) => sum + value, 0)
  const rangeMeta = CHART_RANGES.find((r) => r.id === range)
  const firstLabel = points[0] ? formatBucketLabel(range, points[0].bucketStart) : ''
  const lastLabel = points[points.length - 1]
    ? formatBucketLabel(range, points[points.length - 1].bucketStart)
    : ''

  return (
    <section className="border border-ink-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-ink-900">{title}</h2>
          <p className="mt-1 text-xs text-ink-500">
            {subtitle}
            {rangeMeta ? ` \u00b7 ${rangeMeta.full.toLowerCase()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ChartRangeToggle value={range} onChange={onRangeChange} />
          <p className="text-lg font-bold text-ink-900">{formatValue(total)}</p>
        </div>
      </div>
      <div className="mt-6 flex h-40 items-end gap-1">
        {points.length === 0 ? (
          <p className="m-auto text-sm text-ink-400">No data in this window.</p>
        ) : (
          points.map((point) => {
            const value = Number(point.value || 0)
            const label = formatBucketLabel(range, point.bucketStart)
            return (
              <div
                key={point.bucketStart}
                className="group flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div
                  title={`${label}: ${formatValue(value)}`}
                  className={`w-full min-w-1 transition group-hover:opacity-70 ${color}`}
                  style={{ height: `${Math.max(value > 0 ? 6 : 1, (value / max) * 100)}%` }}
                />
              </div>
            )
          })
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-ink-400">
        <span>{firstLabel || 'No data'}</span>
        <span>{lastLabel}</span>
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

function formatCountdown(seconds: number) {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Decode the `exp` claim out of an admin JWT without verifying the signature
// (that's the server's job). Used to schedule the client-side auto-logout that
// fires the moment the hourly code rotates.
function decodeJwtExpMs(token: string): number {
  if (!token) return 0
  try {
    const payload = token.split('.')[1]
    if (!payload) return 0
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(padded))
    return Number(json?.exp || 0) * 1000
  } catch {
    return 0
  }
}

const ADMIN_LOGOUT_EVENT = 'amp-admin-force-logout'

// Centralized authenticated fetch. Attaches the bearer token, normalizes JSON
// content-type, and raises a global force-logout event on 401 so every caller
// reacts identically when the hourly code expires mid-session.
async function adminFetch(
  token: string,
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (
    init.body &&
    !headers.has('Content-Type') &&
    !(init.body instanceof FormData) &&
    typeof init.body === 'string'
  ) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    sessionStorage.removeItem('amp-admin-token')
    window.dispatchEvent(new CustomEvent(ADMIN_LOGOUT_EVENT))
  }
  return res
}

function RotatingCodeCard({ token }: { token: string }) {
  const [data, setData] = useState<RotatingCode | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(Date.now())

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch(token, '/api/admin/code')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not load access code.')
      setData(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load access code.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  // Tick every second for countdown; auto-reload when the hour rolls over.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!data) return
    const expiresAt = new Date(data.validTo).getTime()
    if (now >= expiresAt) void load()
  }, [now, data, load])

  const expiresAt = data ? new Date(data.validTo).getTime() : 0
  const remaining = data ? Math.max(0, Math.round((expiresAt - now) / 1000)) : 0

  async function copyCode() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  async function sendToDiscord() {
    setSending(true)
    setSendResult('')
    try {
      const res = await adminFetch(token, '/api/admin/code/notify', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Discord delivery failed.')
      setSendResult(
        body.delivery?.sent
          ? 'Sent to Discord.'
          : `Not sent: ${body.delivery?.reason || 'unknown reason'}`
      )
    } catch (err) {
      setSendResult(err instanceof Error ? err.message : 'Discord delivery failed.')
    } finally {
      setSending(false)
      setTimeout(() => setSendResult(''), 6000)
    }
  }

  return (
    <section className="border border-ink-900 bg-ink-950 p-5 text-white shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5">
            <KeyRound className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-light">Hourly access code</p>
            <h2 className="mt-1 text-base font-bold">Rotates every hour, broadcast to Discord</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void sendToDiscord()}
            disabled={sending || !data}
            className="flex items-center gap-2 border border-accent-light bg-accent-light px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-950 transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className={`h-3.5 w-3.5 ${sending ? 'animate-pulse' : ''}`} />
            {sending ? 'Sending...' : 'Send to Discord'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,auto] lg:items-center">
        <button
          type="button"
          onClick={() => void copyCode()}
          disabled={!data}
          title="Click to copy"
          className="group flex w-full items-center justify-between gap-3 border border-white/15 bg-black/40 px-5 py-5 text-left transition hover:border-accent-light disabled:opacity-50"
        >
          <span className="font-mono text-3xl font-bold tracking-[0.35em] text-white sm:text-4xl">
            {data ? data.code : '------------'}
          </span>
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 group-hover:text-accent-light">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
        <div className="grid gap-1 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Rotates in</p>
          <p className="font-mono text-2xl font-bold text-white">{formatCountdown(remaining)}</p>
          {data && (
            <p className="text-[10px] text-white/40">
              Next reset {new Date(data.validTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      {sendResult && <p className="mt-3 text-xs text-white/70">{sendResult}</p>}
    </section>
  )
}

function ManufactureTab({
  token,
  onBatchSent,
}: {
  token: string
  onBatchSent: () => void
}) {
  const [queue, setQueue] = useState<ManufactureQueue | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [screenshot, setScreenshot] = useState<{ dataUrl: string; filename: string; previewUrl: string } | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch(token, '/api/admin/manufacture/queue')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not load manufacture queue.')
      setQueue(body)
      setSelectedIds(new Set((body.orders || []).map((o: Order) => o.id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load manufacture queue.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (!queue) return
    setSelectedIds((prev) => {
      if (prev.size === queue.orders.length) return new Set()
      return new Set(queue.orders.map((o) => o.id))
    })
  }

  const selectedOrders = useMemo(
    () => (queue ? queue.orders.filter((o) => selectedIds.has(o.id)) : []),
    [queue, selectedIds]
  )

  const selectedAggregate = useMemo(() => {
    const map = new Map<string, number>()
    let total = 0
    for (const order of selectedOrders) {
      for (const item of order.items) {
        const q = item.quantity || 0
        map.set(item.name, (map.get(item.name) || 0) + q)
        total += q
      }
    }
    return {
      lines: [...map.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity),
      totalUnits: total,
    }
  }, [selectedOrders])

  async function copyManufactureList() {
    if (selectedAggregate.lines.length === 0) return
    const header = `Manufacture batch \u2014 ${selectedOrders.length} orders / ${selectedAggregate.totalUnits} units`
    const aggregate = selectedAggregate.lines.map((l) => `${l.quantity}x  ${l.name}`).join('\n')
    const detail = selectedOrders
      .map((o) => {
        const items = o.items.map((i) => `  - ${i.quantity}x ${i.name}`).join('\n')
        return `${o.id} \u2014 ${o.customerName || 'Guest'} (${o.email})\n${items}`
      })
      .join('\n\n')
    const text = `${header}\n\nTotals:\n${aggregate}\n\nIndividual orders:\n${detail}\n`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Clipboard copy was blocked by the browser.')
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 9 * 1024 * 1024) {
      setError('Screenshot must be under 9 MB. Please re-export at a lower size.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are accepted.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setScreenshot({ dataUrl, filename: file.name, previewUrl: dataUrl })
      setError('')
    }
    reader.onerror = () => setError('Could not read the selected file.')
    reader.readAsDataURL(file)
  }

  async function submitBatch() {
    if (selectedIds.size === 0) {
      setError('Select at least one order to send.')
      return
    }
    if (!screenshot) {
      setError('Attach a screenshot proving the orders were sent to the manufacturer.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const res = await adminFetch(token, '/api/admin/manufacture/batches', {
        method: 'POST',
        body: JSON.stringify({
          sessionIds: [...selectedIds],
          screenshot: screenshot.dataUrl,
          filename: screenshot.filename,
          note,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        const reason = body?.delivery?.reason ? ` (${body.delivery.reason})` : ''
        throw new Error((body.error || 'Batch upload failed.') + reason)
      }
      setSuccess(
        `Batch ${String(body.batchId).slice(0, 8)} sent \u2014 ${body.orderCount} orders moved to processing.`
      )
      setConfirmOpen(false)
      setScreenshot(null)
      setNote('')
      await load()
      onBatchSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const orders = queue?.orders || []
  const allSelected = orders.length > 0 && selectedIds.size === orders.length

  return (
    <div className="mt-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Manufacture queue</h2>
          <p className="mt-1 text-sm text-ink-500">
            Paid orders that have not yet been sent to the manufacturer. Pick which orders are in
            this batch, copy the totals to send, then confirm with a screenshot of the hand-off.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 border border-ink-200 bg-white px-3 py-2 text-sm font-semibold transition hover:border-ink-400 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="border border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
          {loading ? 'Loading queue...' : 'No paid orders waiting on manufacture. \u2728'}
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="border border-ink-200 bg-white p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                    Selected batch totals
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-900">
                    {selectedAggregate.totalUnits} units
                  </p>
                  <p className="text-xs text-ink-500">
                    across {selectedOrders.length} order{selectedOrders.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyManufactureList()}
                  disabled={selectedAggregate.lines.length === 0}
                  className="flex items-center gap-2 border border-ink-900 bg-ink-900 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-ink-800 disabled:opacity-40"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy list'}
                </button>
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto border-t border-ink-100">
                {selectedAggregate.lines.length === 0 ? (
                  <p className="py-6 text-center text-xs text-ink-400">
                    Select at least one order to see totals.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white text-xs uppercase tracking-wider text-ink-400">
                      <tr>
                        <th className="py-3">Product</th>
                        <th className="py-3 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAggregate.lines.map((line) => (
                        <tr key={line.name} className="border-t border-ink-100">
                          <td className="py-2 pr-3">{line.name}</td>
                          <td className="py-2 text-right font-semibold">{line.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 border border-ink-900 bg-ink-900 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-light">
                Send to manufacturer
              </p>
              <p className="text-sm leading-relaxed text-white/80">
                When you have shared the copied list with your manufacturer, confirm here with a
                screenshot of the chat. The screenshot is posted to the fulfillment Discord channel
                and every selected order moves to <strong>Processing</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(true)
                  setError('')
                  setSuccess('')
                }}
                disabled={selectedIds.size === 0}
                className="mt-auto flex items-center justify-center gap-2 border border-accent-light bg-accent-light px-4 py-3 text-sm font-bold uppercase tracking-wider text-ink-950 transition hover:opacity-90 disabled:opacity-50"
              >
                <FileUp className="h-4 w-4" />
                Confirm sent ({selectedIds.size})
              </button>
            </div>
          </div>

          <section className="border border-ink-200 bg-white">
            <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 border-ink-300"
                />
                Select all ({orders.length})
              </label>
              <p className="text-xs text-ink-500">
                {selectedIds.size} of {orders.length} selected
              </p>
            </div>
            <ul className="divide-y divide-ink-100">
              {orders.map((order) => (
                <li key={order.id} className="px-4 py-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="mt-1 h-4 w-4 shrink-0 border-ink-300"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="font-medium text-ink-900">
                          {order.customerName || 'Guest'}
                        </span>
                        <span className="font-mono text-[11px] text-ink-400">
                          {order.id.slice(0, 18)}...
                        </span>
                      </div>
                      <p className="text-xs text-ink-500">
                        {order.email} &middot; {date(order.createdAt)} &middot; {money(order.total)}
                      </p>
                      <ul className="mt-1 text-xs text-ink-600">
                        {order.items.map((item, idx) => (
                          <li key={`${item.name}-${idx}`}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4"
          onClick={() => !submitting && setConfirmOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-ink-200 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent-dark">
                  Confirm hand-off
                </p>
                <h3 className="mt-1 text-base font-bold text-ink-900">
                  Send {selectedIds.size} order{selectedIds.size === 1 ? '' : 's'} to manufacturer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setConfirmOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-ink-200 text-ink-600 transition hover:border-ink-400 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-ink-600">
                Attach a screenshot of the message where you shared the manufacture totals (Telegram,
                email, etc.). It will be posted to the fulfillment Discord and the {selectedIds.size}{' '}
                selected order{selectedIds.size === 1 ? '' : 's'} will transition to{' '}
                <strong>processing</strong>.
              </p>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Screenshot (PNG / JPG, &lt;9 MB)
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-ink-500">
                    <Upload className="h-4 w-4" />
                    {screenshot ? 'Replace file' : 'Choose file'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>
                  {screenshot && (
                    <span className="truncate text-xs text-ink-500">{screenshot.filename}</span>
                  )}
                </div>
              </label>
              {screenshot && (
                <img
                  src={screenshot.previewUrl}
                  alt="Manufacture hand-off preview"
                  className="max-h-48 w-full border border-ink-200 object-contain"
                />
              )}
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Operator note (optional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. priority on cagrilintide; standard lead time confirmed"
                  className="mt-2 w-full border border-ink-200 px-3 py-2 text-sm outline-none focus:border-ink-600"
                />
              </label>
              {error && (
                <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {error}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-ink-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ink-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitBatch()}
                disabled={submitting || !screenshot || selectedIds.size === 0}
                className="flex items-center gap-2 bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ink-800 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Confirm &amp; transition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProcessingTab({
  orders,
  onSelectOrder,
}: {
  orders: Order[]
  onSelectOrder: (order: Order) => void
}) {
  const processing = useMemo(
    () => orders.filter((order) => order.fulfillmentStatus === 'processing'),
    [orders]
  )

  const groups = useMemo(() => {
    const map = new Map<string, { batchId: string; batchedAt: string | null; orders: Order[] }>()
    for (const order of processing) {
      const key = order.batchId || 'ungrouped'
      const existing = map.get(key)
      if (existing) {
        existing.orders.push(order)
      } else {
        map.set(key, {
          batchId: order.batchId || 'ungrouped',
          batchedAt: order.batchedAt,
          orders: [order],
        })
      }
    }
    return [...map.values()].sort((a, b) => {
      const ta = a.batchedAt ? Date.parse(a.batchedAt) : 0
      const tb = b.batchedAt ? Date.parse(b.batchedAt) : 0
      return tb - ta
    })
  }, [processing])

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (groups.length > 0) {
      setOpenGroups((prev) => (prev.size === 0 ? new Set([groups[0].batchId]) : prev))
    }
  }, [groups])

  function toggleGroup(batchId: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  if (processing.length === 0) {
    return (
      <div className="mt-6 border border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
        Nothing is in processing right now.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <header>
        <h2 className="text-lg font-bold text-ink-900">Processing</h2>
        <p className="mt-1 text-sm text-ink-500">
          Orders that have been sent to the manufacturer, grouped by the batch they shipped in.
          Click a group to expand the orders inside.
        </p>
      </header>
      {groups.map((group) => {
        const totalUnits = group.orders.reduce(
          (sum, order) => sum + order.items.reduce((s, i) => s + (i.quantity || 0), 0),
          0
        )
        const total = group.orders.reduce((sum, order) => sum + order.total, 0)
        const open = openGroups.has(group.batchId)
        const isBatched = group.batchId !== 'ungrouped'
        return (
          <section key={group.batchId} className="border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => toggleGroup(group.batchId)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-ink-50"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-accent-dark">
                  {isBatched ? `Batch ${group.batchId.slice(0, 8)}` : 'Ungrouped processing orders'}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {group.batchedAt
                    ? new Date(group.batchedAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'No batch timestamp'}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {group.orders.length} order{group.orders.length === 1 ? '' : 's'} &middot;{' '}
                  {totalUnits} units &middot; {money(total)}
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <div className="overflow-x-auto border-t border-ink-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-ink-400">
                    <tr>
                      <th className="px-5 pb-3 pt-3">Order</th>
                      <th className="pb-3 pt-3">Customer</th>
                      <th className="pb-3 pt-3">Placed</th>
                      <th className="pb-3 pt-3">Total</th>
                      <th className="pb-3 pt-3">Items</th>
                      <th className="px-5 pb-3 pt-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.orders.map((order) => {
                      const itemCount = order.items.reduce((s, i) => s + (i.quantity || 0), 0)
                      return (
                        <tr key={order.id} className="border-t border-ink-100">
                          <td className="px-5 py-3 font-mono text-xs">{order.id.slice(0, 16)}...</td>
                          <td className="py-3">
                            <p className="font-medium">{order.customerName || 'Guest'}</p>
                            <p className="text-xs text-ink-400">{order.email}</p>
                          </td>
                          <td className="py-3">{date(order.createdAt)}</td>
                          <td className="py-3 font-semibold">{money(order.total)}</td>
                          <td className="py-3">{itemCount}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => onSelectOrder(order)}
                              className="text-xs font-bold uppercase tracking-wider text-accent-dark hover:text-ink-900"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [statusFilter, setStatusFilter] = useState<AffiliateStatusFilter>('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyUserId, setBusyUserId] = useState<string>('')
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const search = new URLSearchParams({ limit: '200' })
      if (statusFilter !== 'all') search.set('status', statusFilter)
      const res = await adminFetch(token, `/api/admin/users?${search.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not load users.')
      setUsers(body.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function approve(user: AdminUserRow) {
    setBusyUserId(user.id)
    setFeedback(null)
    try {
      const res = await adminFetch(token, `/api/admin/users/${encodeURIComponent(user.id)}/affiliate/approve`, {
        method: 'POST',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not approve affiliate.')
      const updated = body.user as AdminUserRow
      setFeedback({
        kind: 'success',
        text: `${user.email} promoted to affiliate \u2014 code ${updated?.affiliateCode || '(generated)'}.`,
      })
      await load()
    } catch (err) {
      setFeedback({ kind: 'error', text: err instanceof Error ? err.message : 'Could not approve affiliate.' })
    } finally {
      setBusyUserId('')
    }
  }

  async function deny(user: AdminUserRow) {
    setBusyUserId(user.id)
    setFeedback(null)
    try {
      const res = await adminFetch(token, `/api/admin/users/${encodeURIComponent(user.id)}/affiliate/deny`, {
        method: 'POST',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not deny affiliate.')
      setFeedback({ kind: 'success', text: `${user.email} application denied.` })
      await load()
    } catch (err) {
      setFeedback({ kind: 'error', text: err instanceof Error ? err.message : 'Could not deny affiliate.' })
    } finally {
      setBusyUserId('')
    }
  }

  const filters: { id: AffiliateStatusFilter; label: string }[] = [
    { id: 'pending', label: 'Pending applications' },
    { id: 'approved', label: 'Approved' },
    { id: 'denied', label: 'Denied' },
    { id: 'none', label: 'No application' },
    { id: 'all', label: 'All users' },
  ]

  return (
    <div className="mt-6 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Users</h2>
          <p className="mt-1 text-sm text-ink-500">
            Review affiliate applications, promote customers manually, and audit role assignments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 border border-ink-200 bg-white px-3 py-2 text-sm font-semibold transition hover:border-ink-400 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${
              statusFilter === filter.id ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {feedback && (
        <div
          className={`flex items-start gap-3 border p-4 text-sm ${
            feedback.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.kind === 'success' ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {feedback.text}
        </div>
      )}

      <Section
        title={
          statusFilter === 'pending'
            ? 'Pending affiliate applications'
            : statusFilter === 'all'
              ? 'All users'
              : `Users \u2014 ${statusFilter}`
        }
        subtitle="Promote, approve, or deny affiliate access"
      >
        {users.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">
            {loading ? 'Loading users...' : 'No users match this filter.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Signup</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Affiliate</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Lifetime spend</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isAffiliate = user.role === 'affiliate'
                  const isPending = user.affiliateStatus === 'pending'
                  const busy = busyUserId === user.id
                  return (
                    <tr key={user.id} className="border-t border-ink-100 align-top">
                      <td className="py-3">
                        <p className="font-medium text-ink-900">{user.name || 'Not provided'}</p>
                        <p className="text-xs text-ink-500">{user.email}</p>
                        <p className="mt-1 font-mono text-[10px] text-ink-400">{user.id}</p>
                      </td>
                      <td className="py-3 text-ink-600">{date(user.createdAt)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isAffiliate
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.role === 'admin'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-ink-100 text-ink-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            user.affiliateStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.affiliateStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : user.affiliateStatus === 'denied'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-ink-100 text-ink-700'
                          }`}
                        >
                          {user.affiliateStatus}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs">
                        {user.affiliateCode || <span className="text-ink-400">{'\u2014'}</span>}
                      </td>
                      <td className="py-3 text-ink-600">{money(user.lifetimeSpendCents / 100)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => void approve(user)}
                                disabled={busy}
                                className="border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-emerald-800 disabled:opacity-50"
                              >
                                {busy ? 'Working...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void deny(user)}
                                disabled={busy}
                                className="border border-rose-700 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                Deny
                              </button>
                            </>
                          )}
                          {!isAffiliate && !isPending && (
                            <button
                              type="button"
                              onClick={() => void approve(user)}
                              disabled={busy}
                              className="border border-ink-900 bg-ink-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-ink-800 disabled:opacity-50"
                            >
                              {busy ? 'Working...' : 'Promote to affiliate'}
                            </button>
                          )}
                          {isAffiliate && (
                            <span className="text-[10px] uppercase tracking-wider text-ink-400">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
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
      await onLogin(password.trim())
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
          Sign in with the current hourly access code. The code rotates every hour and your
          session ends the moment it expires.
        </p>
        <label className="mt-6 block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Hourly access code
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="12-character access code"
            className="mt-2 w-full border border-ink-200 px-3 py-3 font-mono text-sm tracking-[0.2em] outline-none transition focus:border-ink-600"
          />
        </label>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={loading || password.trim().length === 0}
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
  const [engagedThreshold, setEngagedThreshold] = useState<EngagedThreshold>(5)
  const [visitsRange, setVisitsRange] = useState<ChartRange>('1mo')
  const [revenueRange, setRevenueRange] = useState<ChartRange>('1mo')
  const [productViewsRange, setProductViewsRange] = useState<ChartRange>('1mo')
  const [checkoutStartsRange, setCheckoutStartsRange] = useState<ChartRange>('1mo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderFilter, setOrderFilter] = useState('all')

  const logout = useCallback(() => {
    sessionStorage.removeItem('amp-admin-token')
    setDashboard(null)
    setToken('')
  }, [])

  // Listen for forced logouts triggered anywhere in the tree by adminFetch on a
  // 401 response (typically: hourly code rotated mid-session).
  useEffect(() => {
    function onForce() {
      logout()
      setError('Your session ended because the hourly access code rotated. Sign in with the new code.')
    }
    window.addEventListener(ADMIN_LOGOUT_EVENT, onForce)
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onForce)
  }, [logout])

  // Schedule a hard auto-logout the moment the JWT exp claim passes. We can't
  // rely on background tabs firing setInterval reliably, so we re-check on
  // visibility changes too.
  useEffect(() => {
    if (!token) return
    const expMs = decodeJwtExpMs(token)
    if (!expMs) return
    const fire = () => {
      logout()
      setError('Your session expired. Sign in with the latest hourly access code.')
    }
    const msLeft = expMs - Date.now()
    if (msLeft <= 0) {
      fire()
      return
    }
    const timer = window.setTimeout(fire, msLeft + 250)
    function onVisibility() {
      if (document.visibilityState === 'visible' && Date.now() >= expMs) fire()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [token, logout])

  const loadDashboard = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await adminFetch(
        token,
        `/api/admin/dashboard?days=${days}&engagedThreshold=${engagedThreshold}`
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load dashboard.')
      setDashboard(data)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Could not load dashboard.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [days, engagedThreshold, token])

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

  async function updateFulfillment(order: Order, status: string) {
    const response = await adminFetch(token, `/api/admin/orders/${order.id}`, {
      method: 'PATCH',
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
    if (orderFilter === 'unfulfilled') {
      // Unfulfilled is a fulfillment workflow filter; unpaid orders are not yet
      // real orders, so they should never surface here.
      return orders.filter(
        (order) => order.paymentStatus === 'paid' && order.fulfillmentStatus === 'unfulfilled'
      )
    }
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
  const visitsSeries = analytics?.series?.visits
  const revenueSeries = stripe?.revenueSeries
  const productViewsSeries = analytics?.series?.productViews
  const checkoutStartsSeries = analytics?.series?.checkoutStarts

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
            {activeTab === 'overview' && (
              <div className="mt-6">
                <RotatingCodeCard token={token} />
              </div>
            )}
            {activeTab === 'overview' && analytics && stripe && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Visits" value={compactNumber(analytics.metrics.visits)} note={`${analytics.metrics.pageViews} total page views`} icon={Eye} />
                  <MetricCard
                    label="Engaged visits"
                    value={`${engagedRate.toFixed(1)}%`}
                    note={`${analytics.metrics.engagedVisits} visits lasting more than ${formatEngagedThreshold(engagedThreshold)}`}
                    icon={Clock3}
                    control={
                      <EngagedThresholdToggle
                        value={engagedThreshold}
                        onChange={setEngagedThreshold}
                      />
                    }
                  />
                  <MetricCard label="Paid revenue" value={money(stripe.metrics.revenue)} note={`${stripe.metrics.paidOrders} paid Stripe Checkout sessions`} icon={CreditCard} />
                  <MetricCard label="Checkout conversion" value={`${checkoutConversion.toFixed(1)}%`} note={`${analytics.metrics.checkoutStarts} tracked checkout starts`} icon={ShoppingCart} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <RangeChart
                    title="Visits"
                    subtitle="First-party storefront sessions"
                    series={visitsSeries}
                    range={visitsRange}
                    onRangeChange={setVisitsRange}
                  />
                  <RangeChart
                    title="Paid revenue"
                    subtitle="Stripe Checkout revenue"
                    series={revenueSeries}
                    range={revenueRange}
                    onRangeChange={setRevenueRange}
                    color="bg-accent-dark"
                    formatValue={money}
                  />
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
                  <MetricCard
                    label="Average engaged time"
                    value={duration(analytics.metrics.averageEngagedSeconds)}
                    note={`Average duration for sessions over ${formatEngagedThreshold(engagedThreshold)}`}
                    icon={Clock3}
                    control={
                      <EngagedThresholdToggle
                        value={engagedThreshold}
                        onChange={setEngagedThreshold}
                      />
                    }
                  />
                  <MetricCard label="Product views" value={compactNumber(analytics.metrics.productViews)} note="Dedicated product-page visits" icon={Eye} />
                  <MetricCard label="Add to carts" value={compactNumber(analytics.metrics.addToCarts)} note="Add-to-cart interactions" icon={ShoppingCart} />
                  <MetricCard label="Checkout starts" value={compactNumber(analytics.metrics.checkoutStarts)} note="Visits reaching checkout" icon={PackageCheck} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <RangeChart
                    title="Product interest"
                    subtitle="Product-detail views"
                    series={productViewsSeries}
                    range={productViewsRange}
                    onRangeChange={setProductViewsRange}
                  />
                  <RangeChart
                    title="Checkout starts"
                    subtitle="Checkout intent"
                    series={checkoutStartsSeries}
                    range={checkoutStartsRange}
                    onRangeChange={setCheckoutStartsRange}
                    color="bg-accent-dark"
                  />
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

            {activeTab === 'manufacture' && (
              <ManufactureTab token={token} onBatchSent={() => void loadDashboard()} />
            )}

            {activeTab === 'processing' && (
              <ProcessingTab
                orders={dashboard?.stripe.orders || []}
                onSelectOrder={(order) => setSelectedOrder(order)}
              />
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

            {activeTab === 'users' && <UsersTab token={token} />}

            {activeTab === 'payments' && stripe && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Revenue" value={money(stripe.metrics.revenue)} note="Paid Checkout session total" icon={CreditCard} />
                  <MetricCard label="Paid orders" value={compactNumber(stripe.metrics.paidOrders)} note="Stripe sessions marked paid" icon={PackageCheck} />
                  <MetricCard label="Average order" value={money(stripe.metrics.averageOrderValue)} note="Revenue divided by paid orders" icon={Activity} />
                  <MetricCard label="Open checkouts" value={compactNumber(stripe.metrics.openCheckouts)} note="Stripe sessions still in progress" icon={ShoppingCart} />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <RangeChart
                    title="Revenue trend"
                    subtitle="Paid Stripe Checkout sessions"
                    series={revenueSeries}
                    range={revenueRange}
                    onRangeChange={setRevenueRange}
                    color="bg-accent-dark"
                    formatValue={money}
                  />
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
          <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-200 bg-white px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-accent-dark">Order details</p>
                <h2 className="mt-1 break-all font-mono text-xs text-ink-700">{selectedOrder.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink-200 text-ink-600 transition hover:border-ink-400 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <div className="grid grid-cols-2 gap-4 border-b border-ink-100 pb-4 text-sm">
                <div><p className="text-xs uppercase tracking-wider text-ink-400">Payment</p><div className="mt-2"><StatusBadge value={selectedOrder.paymentStatus} /></div></div>
                <label><span className="text-xs uppercase tracking-wider text-ink-400">Fulfillment</span><select value={selectedOrder.fulfillmentStatus} onChange={(event) => setSelectedOrder({ ...selectedOrder, fulfillmentStatus: event.target.value })} className="mt-2 w-full border border-ink-200 px-2 py-2 text-sm">{fulfillmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              </div>
              {selectedOrder.batchId && (
                <div className="mt-4 border border-ink-200 bg-ink-50 p-3 text-xs text-ink-600">
                  <span className="font-bold uppercase tracking-wider text-ink-500">Manufacture batch:</span>{' '}
                  <span className="font-mono">{selectedOrder.batchId.slice(0, 8)}...</span> &middot;{' '}
                  {selectedOrder.batchedAt ? date(selectedOrder.batchedAt) : '—'}
                </div>
              )}
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
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
