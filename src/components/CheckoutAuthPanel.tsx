import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { saveSession, type Customer } from '@/lib/auth'

type Mode = 'signin' | 'signup'

type Props = {
  onAuth: (user: Customer) => void
  defaultMode?: Mode
}

export function CheckoutAuthPanel({ onAuth, defaultMode = 'signin' }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [marketingEmail, setMarketingEmail] = useState(true)
  const [marketingSms, setMarketingSms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token, user } = await api.auth.login(identifier.trim(), password)
      saveSession(token, user)
      onAuth(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
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
      onAuth(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="font-sans text-xl font-semibold text-ink-900">
        {mode === 'signin' ? 'Sign in to check out' : 'Create your account'}
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        Checkout is reserved for verified accounts so we can keep order history,
        damage-claim records, and shipping notifications tied to a single inbox.
      </p>

      <div className="mt-5 inline-flex border border-ink-200 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError('') }}
          className={`px-4 py-2 transition ${mode === 'signin' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError('') }}
          className={`px-4 py-2 transition ${mode === 'signup' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
        >
          Create account
        </button>
      </div>

      {mode === 'signin' ? (
        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Email or username</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <Link
            to="/forgot-password"
            className="block text-sm text-ink-700 underline underline-offset-2 hover:text-accent-dark"
          >
            Forgot password?
          </Link>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 py-3 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in & continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Username</label>
            <input
              type="text"
              autoComplete="username"
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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
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
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
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
          <Link
            to="/forgot-password"
            className="block text-sm text-ink-700 underline underline-offset-2 hover:text-accent-dark"
          >
            Forgot password?
          </Link>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 py-3 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account & continue'}
          </button>
        </form>
      )}
    </section>
  )
}
