import { useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Truck } from 'lucide-react'
import { AccountShell } from '@/components/AccountShell'
import { api, type LoyaltyStatus } from '@/lib/api'

function dollars(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.floor(cents / 100)))
}

export function AccountLoyalty() {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.account.loyalty()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load loyalty status.'))
      .finally(() => setLoading(false))
  }, [])

  const remainingCents = status ? Math.max(0, status.thresholdCents - status.lifetimeSpendCents) : 0
  const progressPct = status ? Math.min(100, Math.max(0, status.percentToThreshold)) : 0

  return (
    <AccountShell title="Loyalty Rewards" subtitle="Earn an automatic 10% off after $300 in lifetime spend" back>
      <div className="mt-10 space-y-6">
        {loading && <p className="text-sm text-ink-500">Loading loyalty status...</p>}
        {error && <p className="bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        {!loading && !error && status && (
          <>
            {status.unlocked ? (
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <div>
                    <h2 className="font-sans text-lg font-semibold text-emerald-900">
                      Loyalty {status.discountPercent}% Off Unlocked
                    </h2>
                    <p className="mt-1 text-sm text-emerald-800">
                      Auto-applied to every future order. Nothing to enter at checkout.
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-wider text-emerald-700">
                      Lifetime spend: {dollars(status.lifetimeSpendCents)}
                    </p>
                  </div>
                </div>
              </article>
            ) : (
              <article className="rounded-2xl border border-ink-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-6 w-6 flex-shrink-0 text-ink-700" />
                    <div>
                      <h2 className="font-sans text-lg font-semibold text-ink-900">
                        {status.discountPercent}% off after {dollars(status.thresholdCents)}
                      </h2>
                      <p className="mt-1 text-sm text-ink-600">
                        Keep ordering. We unlock the discount automatically.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-ink-500">Lifetime</p>
                    <p className="mt-1 font-semibold text-ink-900">{dollars(status.lifetimeSpendCents)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    className="h-3 w-full overflow-hidden rounded-full bg-ink-100"
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Loyalty progress"
                  >
                    <div
                      className="h-full rounded-full bg-ink-900 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-600">
                    <span>{dollars(0)}</span>
                    <span className="font-medium text-ink-800">
                      {dollars(remainingCents)} to go
                    </span>
                    <span>{dollars(status.thresholdCents)}</span>
                  </div>
                </div>
              </article>
            )}

            <article className="rounded-2xl border border-ink-200 p-6">
              <h2 className="font-sans font-semibold text-ink-900">How it works</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink-700">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-900" />
                  <span>
                    Spend <strong>{dollars(30000)}</strong> in lifetime paid orders on your account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-900" />
                  <span>
                    Stripe applies your {status.discountPercent}% off automatically — no code to remember.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-900" />
                  <span>Discount applies to every future order, forever.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-700" />
                  <span>
                    Stacks with shipping. Does <strong>not</strong> stack with affiliate or partner codes.
                  </span>
                </li>
              </ul>
            </article>
          </>
        )}
      </div>
    </AccountShell>
  )
}
