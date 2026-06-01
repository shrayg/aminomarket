import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { api } from '@/lib/api'
import { saveSession } from '@/lib/auth'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [marketingEmail, setMarketingEmail] = useState(true)
  const [marketingSms, setMarketingSms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { token, user } = await api.auth.register({
        email,
        password,
        name: name || undefined,
        marketingEmailOptIn: marketingEmail,
        marketingSmsOptIn: marketingSms,
      })
      saveSession(token, user)
      navigate('/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Logo variant="light" height="lg" className="mb-8 flex w-full justify-center" />
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Create Account
      </h1>
      <p className="mt-2 text-ink-600">Register to track orders</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-700">Username</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">Confirm password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <div className="space-y-3 rounded-xl bg-ink-50 p-4">
          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={marketingEmail}
              onChange={(e) => setMarketingEmail(e.target.checked)}
              className="mt-1 rounded border-ink-300"
            />
            <span>Email me about discounts, promotions, and product launches.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={marketingSms}
              onChange={(e) => setMarketingSms(e.target.checked)}
              className="mt-1 rounded border-ink-300"
            />
            <span>Text me about discounts and promotions (SMS, reply STOP to opt out).</span>
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-10 text-center text-ink-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Login
        </Link>
      </p>
    </div>
  )
}
