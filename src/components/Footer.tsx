import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <h3 className="font-sans text-lg font-semibold text-ink-900">
              Aminomarket
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              A research-focused supplier of high-purity reference materials for
              laboratory and in-vitro use only. Transparent COAs, consistent
              quality, responsive support.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-ink-900">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/account', label: 'My Account' },
                { to: '/about', label: 'About Us' },
                { to: '/affiliates', label: 'Affiliates' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink-600 transition hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-ink-900">
              Customer Support
            </h4>
            <address className="mt-4 not-italic text-sm text-ink-600">
              <p className="font-medium text-ink-900">Aminomarket</p>
              <p className="mt-2">11323 Arcade Dr. STE 105</p>
              <p>Little Rock, AR 72212</p>
              <p className="mt-2">
                <a
                  href="mailto:aminomarketshop@gmail.com"
                  className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
                >
                  aminomarketshop@gmail.com
                </a>
              </p>
              <p>+1 877 312 1560</p>
              <p className="mt-1 text-ink-500">Mon–Fri, 9am–5pm (GMT-6)</p>
            </address>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-ink-900">
              Support
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { to: '/contact', label: 'Contact Us' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/returns', label: 'Return & Refund Policy' },
                { to: '/shipping', label: 'Shipping Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink-600 transition hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-8">
          <p className="text-xs leading-relaxed text-ink-500">
            <strong className="text-ink-600">Disclaimer:</strong> All products
            are for laboratory research and development use only. Not intended
            for human or animal consumption. Not evaluated by the FDA.
          </p>
          <p className="mt-4 text-xs text-ink-500">
            © {new Date().getFullYear()} Aminomarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
