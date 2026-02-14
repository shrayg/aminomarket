import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, User, Search, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  {
    label: 'Categories',
    children: [
      { href: '/shop?category=research-peptides', label: 'Research Peptides' },
      { href: '/shop?category=research-formulations', label: 'Research Formulations' },
      { href: '/shop?category=accessories', label: 'Accessories' },
    ],
  },
  { href: '/pre-sale', label: 'Pre-Sale' },
  { href: '/coa', label: 'COA' },
  { href: '/affiliates', label: 'Affiliates' },
  { href: '/contact', label: 'Contact Us' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const count = useCartStore((s) => s.getCount())

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/95 backdrop-blur-md">
      {/* Announcement bar */}
      <div className="bg-ink-950 px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm text-white/95">
          <span>Valentine&apos;s Week: 20% Off Peptides + BOGO Cosmetics (02/09–02/15)</span>
          <span className="hidden sm:inline">·</span>
          <span>Important Update — Tap to View</span>
          <span className="hidden sm:inline">•</span>
          <span>Free shipping on orders $200+</span>
          <Link to="/track-order" className="underline decoration-white/60 underline-offset-2 hover:decoration-white">
            Track Order
          </Link>
          <span>Support</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="font-sans text-xl font-bold tracking-tight text-ink-900">
          Aminomarket
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button className="flex items-center gap-0.5 text-sm font-medium text-ink-600 transition hover:text-ink-900">
                  {link.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {catOpen && (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="min-w-[200px] rounded-xl border border-ink-200 bg-white py-2 shadow-xl">
                      {link.children.map((c) => (
                        <Link
                          key={c.href}
                          to={c.href}
                          className="block px-4 py-2.5 text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
              >
                {link.label}
              </Link>
            )
          )}
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
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-ink-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.flatMap((link) =>
              link.children
                ? link.children.map((c) => (
                    <Link
                      key={c.href}
                      to={c.href}
                      className="rounded-lg px-4 py-3 text-ink-600 hover:bg-ink-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))
                : [
                    <Link
                      key={link.href}
                      to={link.href!}
                      className="rounded-lg px-4 py-3 text-ink-600 hover:bg-ink-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>,
                  ]
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
