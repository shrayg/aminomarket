import { Link } from 'react-router-dom'
import { AccountShell } from '@/components/AccountShell'

export function Account() {
  return (
    <AccountShell title="My Account" subtitle="Manage your account and orders">
      <div className="mt-12 space-y-4">
        {[
          { to: '/account/orders', title: 'Order History', desc: 'View and track orders' },
          { to: '/account/addresses', title: 'Addresses', desc: 'Manage shipping addresses' },
          { to: '/account/edit', title: 'Account Details', desc: 'Edit your profile' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-2xl border border-ink-200 p-6 transition hover:border-ink-300 hover:shadow-md"
          >
            <h2 className="font-sans font-semibold text-ink-900">{item.title}</h2>
            <p className="mt-1 text-sm text-ink-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </AccountShell>
  )
}
