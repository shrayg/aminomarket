import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, MessageCircle, LifeBuoy } from 'lucide-react'
import { Logo } from '@/components/Logo'

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderNumber: '',
  })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { api } = await import('@/lib/api')
      await api.contact({
        name: form.name,
        email: form.email,
        message: form.message,
        orderNumber: form.orderNumber,
      })
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '', orderNumber: '' })
    } catch {
      alert('Failed to send. Please email aminomarketsupport@gmail.com instead.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">Contact Support</h1>
      <p className="mt-3 text-ink-600">
        Need help with an order, a damage claim, an account question, or a
        wholesale / affiliate inquiry? Reach us through any of the channels
        below &mdash; a real human responds within{' '}
        <strong>24&ndash;48 hours</strong> every day except major US holidays.
      </p>

      <p className="mt-4 text-sm text-ink-500">
        Heads-up: we cannot provide dosing, reconstitution, administration,
        or any therapeutic guidance. All products are supplied for in-vitro
        laboratory research only. See the{' '}
        <Link to="/faq" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          FAQ
        </Link>{' '}
        for self-serve answers to most order questions.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
          <div className="flex items-center gap-3">
            <Logo variant="light" height="md" link={false} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-500">
            Reach the team
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="group flex items-center gap-3 text-ink-700 transition hover:text-ink-900"
            >
              <Mail className="h-4 w-4 text-ink-500 group-hover:text-ink-900" />
              <span className="underline underline-offset-2">aminomarketsupport@gmail.com</span>
            </a>
            <a
              href="https://t.me/aminomarketshop"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 text-ink-700 transition hover:text-ink-900"
            >
              <Send className="h-4 w-4 text-ink-500 group-hover:text-ink-900" />
              <span className="underline underline-offset-2">Telegram &mdash; @aminomarketshop</span>
            </a>
            <a
              href="https://discord.gg/gS7prpfSmy"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 text-ink-700 transition hover:text-ink-900"
            >
              <MessageCircle className="h-4 w-4 text-ink-500 group-hover:text-ink-900" />
              <span className="underline underline-offset-2">Discord community &mdash; #support</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <div className="flex items-center gap-3 text-ink-900">
            <LifeBuoy className="h-5 w-5" />
            <p className="font-sans text-sm font-semibold uppercase tracking-wider">
              What to include
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li>
              <strong className="text-ink-800">Order number</strong> (e.g.
              AM-12345) if your question is order-related.
            </li>
            <li>
              <strong className="text-ink-800">Email used at checkout</strong>{' '}
              or on your account.
            </li>
            <li>
              For shipping-damage claims: clear{' '}
              <strong className="text-ink-800">photos within 48 hours of
              delivery</strong> &mdash; outer box, inner packaging, and the
              damaged product.
            </li>
            <li>
              For payment / refund questions: the last 4 digits of the card
              and a transaction screenshot if you have one.
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-500">
        Legal notices should be sent to{' '}
        <a
          href="mailto:aminomarketsupport@gmail.com"
          className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
        >
          aminomarketsupport@gmail.com
        </a>
        .
      </p>

      <div className="mt-12 border-t border-ink-200 pt-10">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Send us a message
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          We&apos;ll reply to the email you provide. No phone calls &mdash;
          everything is documented in writing so nothing gets lost.
        </p>

        {sent ? (
          <p className="mt-8 rounded-xl border border-ink-200 bg-ink-50 p-4 text-ink-800">
            Message sent. We&apos;ll get back to you within 24&ndash;48 hours.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">Order Number</label>
                <input
                  type="text"
                  value={form.orderNumber}
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                  placeholder="AM-12345 (if applicable)"
                  className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Damage claim / Refund / Account / Other"
                  className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Message *</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What happened, what you expected, and anything you've already tried."
                className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink-900 px-8 py-3 font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
