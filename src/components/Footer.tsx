import { Link } from 'react-router-dom'
import { Mail, Send, MessageCircle } from 'lucide-react'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo variant="light" height="lg" />
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
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:aminomarketsupport@gmail.com"
                  className="group flex items-center gap-2 text-ink-600 transition hover:text-ink-900"
                >
                  <Mail className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-900" />
                  <span className="underline underline-offset-2">aminomarketsupport@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/kaimatsu"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-ink-600 transition hover:text-ink-900"
                >
                  <Send className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-900" />
                  <span className="underline underline-offset-2">Telegram &mdash; @kaimatsu</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/gS7prpfSmy"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-ink-600 transition hover:text-ink-900"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-900" />
                  <span className="underline underline-offset-2">Discord community</span>
                </a>
              </li>
              <li className="pt-1 text-xs text-ink-500">
                We reply within 24&ndash;48 hours.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-ink-900">
              Support
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { to: '/contact', label: 'Contact Us' },
                { to: '/faq', label: 'FAQ / Help center' },
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
            © {new Date().getFullYear()} Percival LLC, d/b/a Amino Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
