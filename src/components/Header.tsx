import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, User, Search, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'
import { useCartStore } from '@/store/cart'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/coa', label: 'COA' },
]

const supportLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/faq', label: 'Support' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false)
  const count = useCartStore((s) => s.getCount())

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Logo variant="light" height="md" />

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}

          <div className="group relative">
            <span
              className="inline-flex cursor-default items-center gap-1 text-sm font-medium text-ink-600 transition group-hover:text-ink-900"
              aria-haspopup="true"
            >
              Support
              <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </span>
            <div className="invisible absolute left-1/2 top-full z-50 w-44 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="border border-ink-200 bg-white py-2 shadow-lg shadow-ink-900/10">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 text-sm text-ink-600 transition hover:bg-brand-lavender/15 hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="rounded-full p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            to="/account"
            className="rounded-full p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-violet px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-ink-600 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-3 text-ink-600 hover:bg-ink-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-ink-600 hover:bg-ink-50"
              onClick={() => setMobileSupportOpen((open) => !open)}
              aria-expanded={mobileSupportOpen}
            >
              Support
              <ChevronDown
                className={`h-4 w-4 transition ${mobileSupportOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileSupportOpen && (
              <div className="mb-1 ml-3 border-l border-ink-200 pl-2">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
                    onClick={() => {
                      setMobileOpen(false)
                      setMobileSupportOpen(false)
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
