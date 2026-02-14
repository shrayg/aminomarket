import { Link } from 'react-router-dom'

export function ForgotPassword() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Forgot Password
      </h1>
      <p className="mt-2 text-ink-600">
        PLACEHOLDER: Add password reset flow.
      </p>
      <form className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-ink-900 py-4 font-semibold text-white"
        >
          Send reset link
        </button>
      </form>
      <Link to="/login" className="mt-8 block text-center text-ink-900 underline underline-offset-2 hover:text-accent-dark">
        Back to login
      </Link>
    </div>
  )
}
