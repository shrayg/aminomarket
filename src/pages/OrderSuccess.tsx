import { Link } from 'react-router-dom'

export function OrderSuccess() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-accent-light text-2xl text-accent-dark">
        ✓
      </div>
      <h1 className="mt-8 font-sans text-2xl font-bold text-ink-900">
        Thank you for your order
      </h1>
      <p className="mt-4 text-ink-600">
        Your order has been received. You will receive a confirmation email shortly.
      </p>
      <Link
        to="/shop"
        className="mt-10 inline-block rounded-xl bg-ink-900 px-8 py-4 font-semibold text-white transition hover:bg-ink-800"
      >
        Continue shopping
      </Link>
    </div>
  )
}
