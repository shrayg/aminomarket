import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const result = await api.auth.requestPasswordReset(email)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Forgot Password
      </h1>
      <p className="mt-2 text-ink-600">
        Submit your account email and support will follow up with the next step.
      </p>
      <form onSubmit={submit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3"
          />
        </div>
        {message && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-ink-900 py-4 font-semibold text-white"
        >
          Submit request
        </button>
      </form>
      <Link to="/login" className="mt-8 block text-center text-ink-900 underline underline-offset-2 hover:text-accent-dark">
        Back to login
      </Link>
    </div>
  )
}
