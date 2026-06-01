import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, ExternalLink, Sparkles, Trophy, Users2 } from 'lucide-react'
import { AccountShell } from '@/components/AccountShell'
import { api, type AffiliateOverview } from '@/lib/api'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function dollars(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function ApplyForm({ onSubmitted }: { onSubmitted: (status: string) => void }) {
  const [reason, setReason] = useState('')
  const [audience, setAudience] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (reason.trim().length < 20) {
      setError('Tell us a little more — at least 20 characters.')
      return
    }
    setSubmitting(true)
    try {
      const result = await api.affiliate.apply({ reason, audience })
      onSubmitted(result?.status || 'pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-5 rounded-2xl border border-ink-200 p-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-accent-dark" />
        <h2 className="font-semibold text-ink-900">Apply to be an affiliate</h2>
      </div>
      <p className="text-sm leading-relaxed text-ink-600">
        Affiliates earn 25% of estimated profit on every order placed using their personal 10%-off
        code, scaling to 40% once you cross 50 orders and $2,500 in product processed. Approval is
        manual: tell us a little about how you'd promote Aminomarket and we'll review within 24-48
        hours.
      </p>
      <label className="block text-sm text-ink-700">
        Why do you want to join? <span className="text-ink-400">(20-1000 characters)</span>
        <textarea
          required
          minLength={20}
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={5}
          className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3"
          placeholder="Where do you plan to share your code? Who are you promoting to?"
        />
        <span className="mt-1 block text-right text-xs text-ink-400">
          {reason.length} / 1000
        </span>
      </label>
      <label className="block text-sm text-ink-700">
        Estimated audience <span className="text-ink-400">(optional)</span>
        <input
          maxLength={500}
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3"
          placeholder="e.g. ~12k IG followers, biohacking newsletter (3k subs)"
        />
      </label>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}

function StatusCard({
  title,
  description,
  variant,
}: {
  title: string
  description: React.ReactNode
  variant: 'pending' | 'denied'
}) {
  const tone =
    variant === 'pending'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-rose-200 bg-rose-50 text-rose-900'
  return (
    <div className={`mt-10 rounded-2xl border p-6 ${tone}`}>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed">{description}</div>
    </div>
  )
}

function CodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be blocked in some browsers; show no-op rather than error.
    }
  }
  return (
    <div className="rounded-2xl border border-ink-900 bg-ink-950 p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-light">Your affiliate code</p>
      <button
        type="button"
        onClick={copy}
        title="Copy to clipboard"
        className="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-white/15 bg-black/40 px-5 py-5 text-left transition hover:border-accent-light"
      >
        <span className="font-mono text-3xl font-bold tracking-[0.32em] sm:text-4xl">{code}</span>
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
      <p className="mt-3 text-xs text-white/60">
        Buyers redeem this at checkout for 10% off. You earn commission on every paid order that
        uses it.
      </p>
    </div>
  )
}

function TierBanner({
  ratePercent,
  ordersToNextTier,
  dollarsToNextTier,
}: {
  ratePercent: number
  ordersToNextTier: number
  dollarsToNextTier: number
}) {
  const isTopTier = ratePercent >= 40
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isTopTier ? 'border-emerald-300 bg-emerald-50' : 'border-ink-200 bg-ink-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Trophy className={`h-5 w-5 ${isTopTier ? 'text-emerald-700' : 'text-ink-700'}`} />
        <h3 className="font-semibold text-ink-900">
          Current commission: {ratePercent}% of estimated profit
        </h3>
      </div>
      {isTopTier ? (
        <p className="mt-2 text-sm leading-relaxed text-emerald-900">
          You're at the top tier. Every paid redemption earns you 40% of the conservative profit
          estimate.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          Reach the 40% tier by crossing both 50 paid uses AND $2,500 of product processed. Still
          to go: <strong>{ordersToNextTier}</strong> more order
          {ordersToNextTier === 1 ? '' : 's'} and <strong>{dollars(dollarsToNextTier)}</strong>{' '}
          more processed.
        </p>
      )}
    </div>
  )
}

function StatsGrid({
  totalUses,
  totalProcessedCents,
  totalShippingCents,
  estimatedCommissionCents,
}: {
  totalUses: number
  totalProcessedCents: number
  totalShippingCents: number
  estimatedCommissionCents: number
}) {
  const cards = [
    { label: 'Total uses', value: totalUses.toLocaleString('en-US') },
    { label: 'Total processed', value: money(totalProcessedCents) },
    { label: 'Total shipping', value: money(totalShippingCents) },
    { label: 'Estimated commission', value: money(estimatedCommissionCents) },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-ink-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{card.label}</p>
          <p className="mt-3 text-2xl font-bold text-ink-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function PayoutPanel({
  estimatedCommissionCents,
  onSubmitted,
}: {
  estimatedCommissionCents: number
  onSubmitted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const disabled = estimatedCommissionCents <= 0

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (method.trim().length < 3) {
      setError('Provide a payout destination (PayPal email, crypto address, etc.).')
      return
    }
    setSubmitting(true)
    try {
      await api.affiliate.requestPayout({ payoutMethod: method })
      setSuccessMessage('Request received. The owner will reconcile the actual payout and reach out to confirm.')
      setMethod('')
      setOpen(false)
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not request payout.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink-900">Request payout</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">
            Estimated commission accrues with every paid redemption. Submit a request and the owner
            will reconcile the actual amount net of refunds and chargebacks before paying out.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setSuccessMessage('')
              setOpen(true)
            }}
            className="bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-50"
            title={disabled ? 'No estimated commission to request yet.' : ''}
          >
            Request payout
          </button>
        )}
      </div>
      {successMessage && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      )}
      {open && (
        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-ink-100 pt-5">
          <label className="block text-sm text-ink-700">
            Payout destination
            <input
              required
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              placeholder="PayPal email, crypto address, bank wire details, etc."
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3"
            />
          </label>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Submit request'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export function AccountAffiliate() {
  const [overview, setOverview] = useState<AffiliateOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await api.affiliate.getOverview()
      setOverview(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load affiliate overview.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <AccountShell title="Affiliate program" subtitle="Earn commission on every paid order placed with your code" back>
      {loading && <p className="mt-10 text-sm text-ink-500">Loading affiliate overview...</p>}
      {error && (
        <p className="mt-10 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>
      )}
      {!loading && overview && overview.status === 'none' && (
        <ApplyForm
          onSubmitted={(status) =>
            setOverview({ status: status === 'approved' ? 'approved' : 'pending' } as AffiliateOverview)
          }
        />
      )}
      {!loading && overview && overview.status === 'pending' && (
        <StatusCard
          variant="pending"
          title="Application received"
          description={
            <>
              Thanks for applying. The owner reviews new affiliates within 24-48 hours and you'll
              get an email when your code is live. In the meantime, no further action is needed.
            </>
          }
        />
      )}
      {!loading && overview && overview.status === 'denied' && (
        <StatusCard
          variant="denied"
          title="Application not approved at this time"
          description={
            <>
              Your application wasn't accepted. Reach out via{' '}
              <Link to="/contact" className="underline underline-offset-4">
                support
              </Link>{' '}
              if you have questions or believe this was a mistake.
            </>
          }
        />
      )}
      {!loading && overview && overview.status === 'approved' && overview.role === 'affiliate' && (
        <div className="mt-10 space-y-6">
          <CodeCard code={overview.code} />
          <TierBanner
            ratePercent={overview.commissionRatePercent}
            ordersToNextTier={overview.tierProgress.ordersToNextTier}
            dollarsToNextTier={overview.tierProgress.dollarsToNextTier}
          />
          <StatsGrid
            totalUses={overview.totalUses}
            totalProcessedCents={overview.totalProcessedCents}
            totalShippingCents={overview.totalShippingCents}
            estimatedCommissionCents={overview.estimatedCommissionCents}
          />
          <PayoutPanel
            estimatedCommissionCents={overview.estimatedCommissionCents}
            onSubmitted={() => void load()}
          />
          <p className="rounded-xl bg-ink-50 p-4 text-xs leading-relaxed text-ink-500">
            Estimated commission is approximate. Actual payout is calculated by the owner net of
            refunds, chargebacks, and any Stripe disputes. Reach out via{' '}
            <Link to="/contact" className="underline underline-offset-4">
              support
            </Link>{' '}
            for any question.
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-600">
            <Users2 className="h-4 w-4" />
            Share your code anywhere you want — landing pages, social, email, podcasts.
            <a
              href="/shop"
              className="inline-flex items-center gap-1 font-semibold text-ink-900 underline underline-offset-4"
            >
              Visit the shop <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}
    </AccountShell>
  )
}
