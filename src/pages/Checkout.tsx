import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

// Checkout is intentionally disabled. The previous Stripe/shipping-quote
// flow lives in git history; do not re-enable it without owner approval.
export function Checkout() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Logo variant="light" height="lg" className="mb-8 flex w-full justify-center" />
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Checkout is closed
      </h1>
      <p className="mt-4 leading-relaxed text-ink-600">
        Amino Market is not currently accepting orders. Payment and
        shipping are disabled site-wide. The catalog remains available
        for reference only.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/shop"
          className="inline-block bg-ink-900 px-8 py-3 font-semibold text-white transition hover:bg-ink-800"
        >
          Back to catalog
        </Link>
        <Link
          to="/contact"
          className="inline-block border border-ink-200 px-8 py-3 font-semibold text-ink-900 transition hover:bg-ink-50"
        >
          Contact support
        </Link>
      </div>
    </div>
  )
}
