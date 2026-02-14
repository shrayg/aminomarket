import { Link } from 'react-router-dom'

export function Account() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-sans text-2xl font-bold text-ink-900">
        My Account
      </h1>
      <p className="mt-2 text-ink-600">Manage your account and orders</p>

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
    </div>
  )
}
