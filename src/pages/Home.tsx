import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { isPublicCatalogVisible } from '@/lib/catalog-visibility'
import { categories } from '@/data/products'
import { heroSlides } from '@/data/heroCarousel'
import { ProductCard } from '@/components/ProductCard'
import { HeroShowcase } from '@/components/HeroShowcase'
import { NewsletterForm } from '@/components/NewsletterForm'

const testimonials = [
  {
    text: 'The shampoo feels clean without stripping. Hair looks healthier after a couple weeks of use.',
    author: 'Alex',
    title: 'Verified Buyer',
  },
  {
    text: 'Light scent, rinses well, and the copper peptide formula is an easy everyday swap.',
    author: 'Jordan',
    title: 'Verified Buyer',
  },
  {
    text: 'Ordered the 2-pack. Consistent quality and shipping was fast.',
    author: 'Sam',
    title: 'Verified Buyer',
  },
]

const faqs = [
  {
    q: 'What is GHK-Cu shampoo?',
    a: 'Our hair care shampoo is formulated with GHK-Cu (copper peptide) for everyday cleansing and scalp comfort. It is a cosmetic shampoo, not a drug.',
  },
  {
    q: 'How do I use it?',
    a: 'Wet hair, apply a small amount, massage into scalp and hair, then rinse thoroughly. Use as often as your routine needs.',
  },
  {
    q: 'Who is it for?',
    a: 'Anyone looking for a modern peptide shampoo for daily hair care. Not intended to diagnose, treat, cure, or prevent any disease.',
  },
]

export function Home() {
  const catalogVisible = isPublicCatalogVisible()
  const { products, loading } = useProducts()
  const featured = catalogVisible ? products.filter((p) => p.isFeatured) : []

  return (
    <div>
      <HeroShowcase slides={heroSlides} catalogVisible={catalogVisible} />

      <section className="border-b border-brand-lavender/30 bg-gradient-to-r from-brand-mist/40 via-white to-brand-lavender/20 py-4">
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-3 overflow-x-auto px-6 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500 sm:gap-6 sm:text-[12px] md:justify-center md:gap-10 md:text-[13px] md:tracking-widest">
          {['GHK-Cu Formula', 'Everyday Hair Care', 'Free Shipping $200+', 'Secure Payment', '24/7 Support'].map(
            (b) => (
              <span key={b} className="shrink-0 whitespace-nowrap">
                {b}
              </span>
            )
          )}
        </div>
      </section>

      {catalogVisible && (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-400">
              Featured
            </p>
            <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-ink-900">
              Shampoo &amp; Conditioner
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {loading ? (
              <p className="col-span-full text-center text-ink-500">Loading...</p>
            ) : (
              featured.map((p) => (
                <ProductCard key={p.id} product={p} badge="New" />
              ))
            )}
          </div>
        </div>
      </section>
      )}

      {catalogVisible && categories.length > 1 && (
      <section className="border-t border-ink-200 bg-ink-50/50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-sans text-display-sm font-bold tracking-tight text-ink-900">
            Shop Categories
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {categories.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="group block border border-ink-200 bg-white p-10 transition hover:border-ink-300 hover:shadow-lg"
              >
                <h3 className="font-sans text-xl font-semibold text-ink-900 group-hover:text-accent-dark">
                  {c.name}
                </h3>
                {c.desc && (
                  <p className="mt-2 font-serif text-ink-600">{c.desc}</p>
                )}
                <span className="mt-6 inline-block font-sans text-sm font-medium text-ink-600 group-hover:text-ink-900">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-sans text-display-sm font-bold tracking-tight text-ink-900">
            Built for everyday hair care
          </h2>
          <p className="mt-4 max-w-2xl font-serif text-ink-600">
            A straightforward copper-peptide shampoo with a clean formula and simple routine.
          </p>
          <div className="mt-16 grid gap-16 md:grid-cols-3">
            {[
              { title: 'GHK-Cu formula', desc: 'Copper peptide shampoo crafted for daily cleansing and scalp comfort.' },
              { title: 'Fast shipping', desc: 'Orders ship promptly with tracking and care.' },
              { title: 'Easy to use', desc: 'Wet, lather, rinse — no complicated regimen.' },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-sans text-lg font-semibold text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-3 font-serif text-ink-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-[#1a1530] to-ink-950 px-6 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.18),transparent_45%)]" />
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-brand-lavender/70">
            Customer notes
          </p>
          <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-white">
            What people say
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.author}
                className="border-l-2 border-brand-lavender pl-6"
              >
                <p className="font-serif text-lg leading-relaxed text-ink-200">
                  &quot;{t.text}&quot;
                </p>
                <footer className="mt-6 font-sans text-sm font-medium text-ink-400">
                  {t.author} — {t.title}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-200 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-sans text-display-sm font-bold tracking-tight text-ink-900">
            FAQs
          </h2>
          <p className="mt-4 font-serif text-ink-600">
            Still have questions?{' '}
            <Link to="/contact" className="font-semibold text-ink-900 underline underline-offset-4 hover:text-brand-violet">
              Contact us
            </Link>
            .
          </p>
          <div className="mt-14 space-y-12">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-ink-200 pb-12 last:border-0 last:pb-0">
                <h3 className="font-sans font-semibold text-ink-900">{faq.q}</h3>
                <p className="mt-3 font-serif text-ink-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-[#1a1530] to-ink-950 px-6 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(196,181,253,0.16),transparent_40%)]" />
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-brand-lavender">
            Stay Updated
          </h2>
          <p className="mt-4 font-serif text-ink-300">
            Early access to restocks, offers, and new hair care drops.
          </p>
          <div className="mt-10 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  )
}
