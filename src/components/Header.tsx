import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, User, Search } from 'lucide-react'
import { Logo } from './Logo'
import { useCartStore } from '@/store/cart'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/coa', label: 'COA' },
  { href: '/contact', label: 'Contact Us' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = useCartStore((s) => s.getCount())

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/95 backdrop-blur-md">
      {/* Announcement bar */}
      <div className="bg-ink-950 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm leading-normal text-white/95">
          <Logo variant="dark" height="sm" />
          <span>Launch Week: 20% Off</span>
          <span className="hidden sm:inline">·</span>
          <Link to="/track-order" className="underline decoration-white/60 underline-offset-2 hover:decoration-white">
            Track Order
          </Link>
          <Link to="/contact" className="underline decoration-white/60 underline-offset-2 hover:decoration-white">
            Support
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Logo variant="light" height="md" withText />

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
          </nav>
        </div>
      )}
    </header>
  )
}
