import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const { api } = await import('@/lib/api')
      await api.newsletter(email)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="flex-1 rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-xl bg-white px-6 py-3.5 font-semibold text-ink-900 transition hover:bg-ink-100 disabled:opacity-60"
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
      {status === 'success' && (
        <p className="absolute mt-16 text-sm text-accent-light">Thanks for subscribing!</p>
      )}
      {status === 'error' && (
        <p className="absolute mt-16 text-sm text-red-400">Something went wrong.</p>
      )}
    </form>
  )
}
