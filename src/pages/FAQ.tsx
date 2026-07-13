import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type FaqItem = { q: string; a: ReactNode }

const sections: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Product',
    items: [
      {
        q: 'What is GHK-Cu Peptide Shampoo?',
        a: 'A cosmetic shampoo formulated with GHK-Cu (copper peptide) for everyday hair and scalp cleansing. It is not a drug.',
      },
      {
        q: 'How should I use it?',
        a: 'Wet hair thoroughly, work a small amount into a lather, massage into scalp and hair, then rinse. Use as often as your routine needs.',
      },
      {
        q: 'Does it cure hair loss or medical conditions?',
        a: 'No. Strand Labs products are cosmetics for external use only. They are not intended to diagnose, treat, cure, or prevent any disease.',
      },
    ],
  },
  {
    title: 'Orders & shipping',
    items: [
      {
        q: 'How long does shipping take?',
        a: 'Typical order-to-delivery turnaround is 1–2 weeks. You will receive tracking when your order ships.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes — free shipping on qualifying U.S. domestic orders of $200 or more. International orders pay the live carrier rate.',
      },
      {
        q: 'Can I cancel or change an order?',
        a: (
          <>
            You can request a cancellation before the order is marked processed.
            After processing, sales are final except for approved damage claims.
            See the{' '}
            <Link to="/returns" className="underline underline-offset-2 hover:text-accent-dark">
              Return &amp; Refund Policy
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        q: 'How do I reach you?',
        a: (
          <>
            Email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>
            , Telegram{' '}
            <a
              href="https://t.me/aminomarketshop"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-accent-dark"
            >
              @aminomarketshop
            </a>
            , or Discord. We typically reply within 24–48 hours.
          </>
        ),
      },
    ],
  },
]

export function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">FAQ</h1>
      <p className="mt-3 text-ink-600">
        Quick answers about Strand Labs GHK-Cu shampoo, shipping, and support.
      </p>

      {sections.map((section) => (
        <section key={section.title} className="mt-12">
          <h2 className="font-sans text-xl font-bold text-ink-900">{section.title}</h2>
          <div className="mt-6 space-y-8">
            {section.items.map((item) => (
              <div key={item.q}>
                <h3 className="font-sans font-semibold text-ink-900">{item.q}</h3>
                <p className="mt-2 leading-relaxed text-ink-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-12 border-t border-ink-200 pt-6 text-sm text-ink-500">
        Still stuck?{' '}
        <Link to="/contact" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
          Contact support
        </Link>
        .
      </p>
    </div>
  )
}
