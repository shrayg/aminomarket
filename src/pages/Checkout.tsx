import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { CheckoutAuthPanel } from '@/components/CheckoutAuthPanel'
import { useCartStore } from '@/store/cart'
import { getAnalyticsSessionId, trackEvent } from '@/lib/analytics'
import {
  api,
  type ShippingRateOption,
  type ShippingQuoteRequestAddress,
} from '@/lib/api'
import {
  clearSession,
  getStoredUser,
  getToken,
  type Customer,
} from '@/lib/auth'

type ShippingForm = {
  recipientName: string
  line1: string
  line2: string
  city: string
  state: string
  zip: string
  country: string
}

const BLANK_SHIPPING: ShippingForm = {
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
}

// Curated ISO list — covers every tier handled by shipping-calc.js, every
// country we plausibly ship to right now, and stays inside Stripe's allowed
// `shipping_address_collection` set. If the operator wants to open up more
// countries, add the ISO code here and (if needed) extend COUNTRY_TIERS in
// shipping-calc.js.
const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'IE', label: 'Ireland' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
  { code: 'AT', label: 'Austria' },
  { code: 'DK', label: 'Denmark' },
  { code: 'SE', label: 'Sweden' },
  { code: 'FI', label: 'Finland' },
  { code: 'NO', label: 'Norway' },
  { code: 'PT', label: 'Portugal' },
  { code: 'GR', label: 'Greece' },
  { code: 'PL', label: 'Poland' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SG', label: 'Singapore' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'IL', label: 'Israel' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'BR', label: 'Brazil' },
  { code: 'IN', label: 'India' },
  { code: 'ZA', label: 'South Africa' },
]

function shippingFingerprint(address: ShippingForm) {
  return [
    address.line1.trim().toLowerCase(),
    address.line2.trim().toLowerCase(),
    address.city.trim().toLowerCase(),
    address.state.trim().toLowerCase(),
    address.zip.trim().toLowerCase(),
    address.country.trim().toUpperCase(),
  ].join('|')
}

function rateKey(rate: ShippingRateOption) {
  return `${rate.carrier}|${rate.service}|${rate.amountCents}`
}

function detectPoBox(line1: string) {
  return /\bp\.?\s*o\.?\s*box\b/i.test(line1) || /\bpost\s*office\s*box\b/i.test(line1)
}

function isAddressReadyForQuote(address: ShippingForm) {
  if (!address.country) return false
  if (!address.city.trim()) return false
  if (address.country === 'US') {
    return Boolean(address.state.trim() && address.zip.trim().length >= 5)
  }
  return true
}

export function Checkout() {
  const { items, getTotal } = useCartStore()
  const navigate = useNavigate()
  const checkoutTracked = useRef(false)

  const [user, setUser] = useState<Customer | null>(() => getStoredUser())
  const [form, setForm] = useState<ShippingForm>(BLANK_SHIPPING)
  const [prefilledFingerprint, setPrefilledFingerprint] = useState<string>('')
  const [saveAddress, setSaveAddress] = useState<boolean>(true)
  const [ruoAcknowledged, setRuoAcknowledged] = useState(false)

  const [rates, setRates] = useState<ShippingRateOption[]>([])
  const [selectedRateKey, setSelectedRateKey] = useState<string>('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ---- analytics --------------------------------------------------------
  useEffect(() => {
    if (items.length > 0 && !checkoutTracked.current) {
      checkoutTracked.current = true
      trackEvent('checkout_started', {
        value: getTotal(),
        metadata: { itemCount: items.reduce((sum, item) => sum + item.quantity, 0) },
      })
    }
  }, [getTotal, items])

  // ---- prefill from default address when signed in ----------------------
  useEffect(() => {
    if (!user || !getToken()) return
    let cancelled = false
    api.account.addresses
      .list()
      .then((addresses) => {
        if (cancelled) return
        const address = addresses.find((entry) => entry.isDefault) || addresses[0]
        if (!address) return
        const next: ShippingForm = {
          recipientName: address.recipientName || user.name || '',
          line1: address.line1 || '',
          line2: address.line2 || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.postalCode || '',
          country: (address.country || 'US').toUpperCase(),
        }
        setForm(next)
        setPrefilledFingerprint(shippingFingerprint(next))
        setSaveAddress(false)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  // ---- debounced shipping quote -----------------------------------------
  const fingerprint = useMemo(() => shippingFingerprint(form), [form])
  const itemSignature = useMemo(
    () => items.map((i) => `${i.id}:${i.quantity}`).join(','),
    [items]
  )

  useEffect(() => {
    if (!user) {
      setRates([])
      setSelectedRateKey('')
      setQuoteError('')
      return
    }
    if (items.length === 0) return
    if (!isAddressReadyForQuote(form)) {
      setRates([])
      setSelectedRateKey('')
      setQuoteError('')
      return
    }

    const handle = window.setTimeout(async () => {
      setQuoteLoading(true)
      setQuoteError('')
      const address: ShippingQuoteRequestAddress = {
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        isPoBox: detectPoBox(form.line1),
      }
      try {
        const result = await api.quoteShipping({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          address,
        })
        setRates(result.rates)
        setSelectedRateKey((current) => {
          if (current && result.rates.some((rate) => rateKey(rate) === current)) return current
          return result.rates[0] ? rateKey(result.rates[0]) : ''
        })
      } catch (err) {
        setRates([])
        setSelectedRateKey('')
        setQuoteError(err instanceof Error ? err.message : 'Could not calculate shipping.')
      } finally {
        setQuoteLoading(false)
      }
    }, 600)

    return () => window.clearTimeout(handle)
  }, [fingerprint, itemSignature, user, form, items])

  const subtotal = getTotal()
  const selectedRate = rates.find((rate) => rateKey(rate) === selectedRateKey) || null
  const shippingDollars = selectedRate ? selectedRate.amountCents / 100 : null
  const total = subtotal + (shippingDollars || 0)

  const addressEdited = prefilledFingerprint && prefilledFingerprint !== fingerprint
  const showSaveCheckbox = Boolean(user) && (!prefilledFingerprint || addressEdited)

  const canSubmit = Boolean(
    user &&
    isAddressReadyForQuote(form) &&
    form.recipientName.trim() &&
    selectedRate &&
    ruoAcknowledged &&
    !submitting
  )

  // ---- empty-cart short circuit -----------------------------------------
  if (items.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Logo variant="light" height="lg" className="mb-8 flex w-full justify-center" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Return to shop
        </Link>
      </div>
    )
  }

  function handleSignOut() {
    clearSession()
    setUser(null)
    setForm(BLANK_SHIPPING)
    setPrefilledFingerprint('')
    setRates([])
    setSelectedRateKey('')
    setRuoAcknowledged(false)
    setSaveAddress(true)
  }

  function handleAuth(nextUser: Customer) {
    setUser(nextUser)
  }

  function updateForm(patch: Partial<ShippingForm>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  async function persistAddressIfRequested() {
    if (!showSaveCheckbox || !saveAddress) return
    try {
      await api.account.addresses.create({
        label: 'Shipping address',
        recipientName: form.recipientName,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postalCode: form.zip,
        country: form.country,
        phone: '',
        isDefault: false,
      })
    } catch {
      // Saving the address is best-effort — never block checkout on it.
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || !selectedRate || !user) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await persistAddressIfRequested()
      const res = await api.checkout({
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        email: user.email,
        shipping: {
          recipientName: form.recipientName,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          isPoBox: detectPoBox(form.line1),
        },
        selectedRate: {
          carrier: selectedRate.carrier,
          service: selectedRate.service,
          displayName: selectedRate.displayName,
          amountCents: selectedRate.amountCents,
        },
        ruoAcknowledged: true,
        marketingOptIn: {
          email: user.marketingEmailOptIn !== false,
          sms: user.marketingSmsOptIn !== false,
        },
        analyticsSessionId: getAnalyticsSessionId(),
      })
      trackEvent('checkout_redirect', { value: total })
      if (res.url && /^https?:\/\//.test(res.url)) {
        window.location.href = res.url
      } else {
        navigate(res.url || '/order/success')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not start checkout.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Logo variant="light" height="md" className="mb-10 block w-fit" />
      <h1 className="font-sans text-3xl font-bold text-ink-900">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]"
      >
        <div className="space-y-8">
          {!user ? (
            <CheckoutAuthPanel onAuth={handleAuth} />
          ) : (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-ink-50/60 px-5 py-4 text-sm">
              <span className="text-ink-700">
                Signed in as <strong className="text-ink-900">{user.name || user.email}</strong>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="font-medium text-ink-700 underline underline-offset-4 hover:text-accent-dark"
              >
                Sign out
              </button>
            </section>
          )}

          <fieldset
            disabled={!user}
            className={`space-y-4 rounded-2xl border border-ink-200 bg-white p-6 transition ${user ? '' : 'opacity-60'}`}
          >
            <legend className="px-2 font-sans text-xl font-semibold text-ink-900">
              Shipping address
            </legend>
            {prefilledFingerprint && !addressEdited && (
              <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-600">
                Using your default address — change anything below to ship somewhere else.
              </p>
            )}
            <input
              type="text"
              required={Boolean(user)}
              placeholder="Recipient name"
              autoComplete="name"
              value={form.recipientName}
              onChange={(e) => updateForm({ recipientName: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <input
              type="text"
              required={Boolean(user)}
              placeholder="Address line 1"
              autoComplete="address-line1"
              value={form.line1}
              onChange={(e) => updateForm({ line1: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <input
              type="text"
              placeholder="Address line 2 (optional)"
              autoComplete="address-line2"
              value={form.line2}
              onChange={(e) => updateForm({ line2: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                required={Boolean(user)}
                placeholder="City"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => updateForm({ city: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
              <input
                type="text"
                required={Boolean(user) && form.country === 'US'}
                placeholder={form.country === 'US' ? 'State' : 'State / Region'}
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => updateForm({ state: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
              <input
                type="text"
                required={Boolean(user) && form.country === 'US'}
                placeholder={form.country === 'US' ? 'ZIP' : 'Postal code'}
                autoComplete="postal-code"
                value={form.zip}
                onChange={(e) => updateForm({ zip: e.target.value })}
                className="rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
            <label className="block text-sm text-ink-700">
              Country
              <select
                value={form.country}
                onChange={(e) => updateForm({ country: e.target.value })}
                className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              >
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>

            {showSaveCheckbox && (
              <label className="flex items-start gap-3 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="mt-1 rounded border-ink-300"
                />
                <span>Save this address to my account for future orders.</span>
              </label>
            )}

            {quoteError && (
              <p className="bg-red-50 px-4 py-3 text-sm text-red-700">{quoteError}</p>
            )}
          </fieldset>

          <fieldset
            disabled={!user}
            className={`space-y-3 rounded-2xl border border-ink-200 bg-white p-6 transition ${user ? '' : 'opacity-60'}`}
          >
            <legend className="px-2 font-sans text-base font-semibold text-ink-900">
              Order acknowledgment
            </legend>
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input
                type="checkbox"
                required={Boolean(user)}
                checked={ruoAcknowledged}
                onChange={(e) => setRuoAcknowledged(e.target.checked)}
                className="mt-1 rounded border-ink-300"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="underline underline-offset-2 hover:text-accent-dark">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-accent-dark">
                  Privacy Policy
                </Link>
                , and I understand Strand Labs products are cosmetic hair care
                for external use only.
              </span>
            </label>
          </fieldset>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-200 bg-ink-50/40 p-6">
            <h2 className="font-sans text-xl font-semibold text-ink-900">Order summary</h2>
            <ul className="mt-4 divide-y divide-ink-200/70">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span className="text-ink-700">
                    <span className="font-medium text-ink-900">{item.name}</span>
                    {item.variantLabel && (
                      <span className="block text-xs text-ink-500">{item.variantLabel}</span>
                    )}
                    <span className="block text-xs text-ink-500">
                      Qty {item.quantity} · ${item.price.toFixed(2)} each
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-medium text-ink-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">Subtotal</dt>
                <dd className="font-medium text-ink-900">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Shipping</dt>
                <dd className="font-medium text-ink-900">
                  {!user
                    ? 'Sign in to continue'
                    : !isAddressReadyForQuote(form)
                      ? 'Enter address to calculate shipping'
                      : quoteLoading
                        ? 'Calculating…'
                        : !selectedRate
                          ? quoteError ? '—' : 'Enter address to calculate shipping'
                          : selectedRate.amountCents === 0
                            ? 'FREE'
                            : `$${shippingDollars!.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-sans font-bold text-ink-900">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            {rates.length > 0 && user && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Shipping options
                </p>
                {rates.map((rate) => {
                  const key = rateKey(rate)
                  const isFree = rate.amountCents === 0
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        selectedRateKey === key
                          ? 'border-ink-900 bg-white'
                          : 'border-ink-200 bg-white/60 hover:border-ink-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping-rate"
                        className="mt-1"
                        checked={selectedRateKey === key}
                        onChange={() => setSelectedRateKey(key)}
                      />
                      <span className="flex-1">
                        <span className="block font-medium text-ink-900">{rate.displayName}</span>
                        <span className="block text-xs text-ink-500">{rate.estimatedDays}</span>
                      </span>
                      <span className="whitespace-nowrap font-semibold text-ink-900">
                        {isFree ? 'FREE' : `$${(rate.amountCents / 100).toFixed(2)}`}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            {submitError && (
              <p className="mt-4 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 w-full bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Redirecting to payment…' : 'Complete Order'}
            </button>
            <p className="mt-3 text-center text-xs text-ink-500">
              You will be redirected to Stripe to enter card details.
            </p>
          </section>
        </aside>
      </form>
    </div>
  )
}
