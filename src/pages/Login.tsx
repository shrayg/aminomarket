import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token, user } = await api.auth.login(email, password)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        Welcome Back
      </h1>
      <p className="mt-2 text-ink-600">Please login to your account</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
          />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-ink-300" />
          <span className="text-sm text-ink-600">Remember me</span>
        </label>
        <Link to="/forgot-password" className="block text-sm text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Forgot Password?
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink-900 py-4 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-10 text-center text-ink-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Register
        </Link>
      </p>
    </div>
  )
}
