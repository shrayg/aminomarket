import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

export function Cart() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="flex justify-center text-ink-300">
        <FlaskConical className="h-16 w-16" />
      </div>
      <h1 className="mt-6 font-sans text-2xl font-bold text-ink-900">
        Not currently accepting orders
      </h1>
      <p className="mt-4 leading-relaxed text-ink-600">
        Amino Market is operating as a research catalog only. The cart and
        checkout flow are disabled. You can still browse the catalog and
        review the Certificates of Analysis.
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
