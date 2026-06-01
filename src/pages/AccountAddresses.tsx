import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AccountShell } from '@/components/AccountShell'
import { api, type CustomerAddress } from '@/lib/api'

const blankAddress: Omit<CustomerAddress, 'id'> = {
  label: 'Shipping address',
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
  isDefault: false,
}

export function AccountAddresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [form, setForm] = useState<Omit<CustomerAddress, 'id'>>(blankAddress)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setAddresses(await api.account.addresses.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load addresses.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function edit(address: CustomerAddress) {
    const { id, ...values } = address
    setEditingId(id)
    setForm(values)
    setShowForm(true)
  }

  function reset() {
    setEditingId('')
    setForm(blankAddress)
    setShowForm(false)
    setError('')
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    try {
      if (editingId) await api.account.addresses.update(editingId, form)
      else await api.account.addresses.create(form)
      reset()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save address.')
    }
  }

  async function remove(id: string) {
    await api.account.addresses.remove(id)
    await load()
  }

  return (
    <AccountShell title="Addresses" subtitle="Manage shipping addresses for faster checkout" back>
      <div className="mt-10 space-y-4">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-2xl border border-ink-200 p-6">
            <div className="flex justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink-900">{address.label}</h2>
                  {address.isDefault && <span className="rounded-full bg-ink-100 px-2 py-1 text-xs font-semibold text-ink-600">Default</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {address.recipientName}<br />
                  {address.line1}{address.line2 ? <><br />{address.line2}</> : null}<br />
                  {address.city}, {address.state} {address.postalCode}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => edit(address)} className="text-sm font-medium text-ink-700 underline underline-offset-4">Edit</button>
                <button type="button" onClick={() => void remove(address.id)} aria-label="Delete address" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 p-5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
            <Plus className="h-4 w-4" />
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="mt-8 space-y-4 rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
          <h2 className="font-semibold text-ink-900">{editingId ? 'Edit address' : 'Add address'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="rounded-xl border border-ink-200 px-4 py-3" />
            <input required placeholder="Recipient name" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className="rounded-xl border border-ink-200 px-4 py-3" />
          </div>
          <input required placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full rounded-xl border border-ink-200 px-4 py-3" />
          <input placeholder="Apartment, suite, etc. (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full rounded-xl border border-ink-200 px-4 py-3" />
          <div className="grid gap-4 sm:grid-cols-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl border border-ink-200 px-4 py-3" />
            <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl border border-ink-200 px-4 py-3" />
            <input required placeholder="ZIP" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="rounded-xl border border-ink-200 px-4 py-3" />
          </div>
          <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-ink-200 px-4 py-3" />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Make this my default shipping address
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white">Save address</button>
            <button type="button" onClick={reset} className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700">Cancel</button>
          </div>
        </form>
      )}
    </AccountShell>
  )
}
