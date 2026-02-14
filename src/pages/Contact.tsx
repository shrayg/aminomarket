import { useState } from 'react'

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    orderNumber: '',
  })
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { api } = await import('@/lib/api')
      await api.contact({
        name: form.name,
        email: form.email,
        message: form.message,
        orderNumber: form.orderNumber,
      })
      setSent(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '', orderNumber: '' })
    } catch {
      alert('Failed to send. Is the server running?')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Contact Us
      </h1>

      <div className="mt-10 rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
        <h2 className="font-sans font-semibold text-ink-900">Aminomarket</h2>
        <p className="mt-2 text-ink-600">11323 Arcade Dr. STE 105, Little Rock, AR 72212</p>
        <p className="mt-2">
          <a href="mailto:info@aminomarket.shop" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            info@aminomarket.shop
          </a>
        </p>
        <p className="text-ink-600">+1 877 312 1560</p>
        <p className="mt-1 text-sm text-ink-500">Mon–Fri, 9am–5pm (GMT-6)</p>
      </div>

      <p className="mt-10 text-ink-600">
        We aim to respond within 24–48 hours. Include your order number for order-related questions.
        We cannot provide usage or dosing guidance.
      </p>

      {sent ? (
        <p className="mt-10 rounded-xl border border-ink-200 bg-ink-50 p-4 text-ink-800">
          Message sent! We&apos;ll get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {[
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'subject', label: 'Subject', type: 'text' },
            { key: 'orderNumber', label: 'Order Number', type: 'text' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-ink-700">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-ink-700">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-ink-900 px-8 py-3 font-semibold text-white transition hover:bg-ink-800"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  )
}
