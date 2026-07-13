import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { isPublicCatalogVisible } from '@/lib/catalog-visibility'
import { categories } from '@/data/products'
import { heroSlides } from '@/data/heroCarousel'
import { ProductCard } from '@/components/ProductCard'
import { HeroCarousel } from '@/components/HeroCarousel'
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
  const bestSellers = catalogVisible ? products.filter((p) => p.inStock).slice(0, 6) : []
  const popular = catalogVisible ? products.filter((p) => p.inStock).slice(0, 8) : []

  return (
    <div>
      <section className="relative bg-[#1A1B1F] text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-12 text-left md:px-12 lg:py-16">
            <p className="mb-5 font-sans text-xs font-medium uppercase tracking-[0.25em] text-ink-400">
              COPPER PEPTIDE HAIR CARE
            </p>
            <h1 className="font-sans text-4xl font-extrabold leading-[1.2] tracking-tight text-[#c4b5fd] md:text-5xl">
              Strand Labs
            </h1>
            <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-ink-300">
              Blue copper peptide shampoo and conditioner for everyday hair care.
              Clean formula, matching pair, made for modern scalp and strand routines.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {catalogVisible ? (
                <>
                  <Link
                    to="/product/blue-copper-shampoo"
                    className="inline-flex items-center border-2 border-[#c9a227] bg-[#c9a227] px-8 py-3.5 font-semibold text-ink-950 transition hover:bg-[#d4af37]"
                  >
                    Shop Shampoo
                  </Link>
                  <Link
                    to="/product/blue-copper-conditioner"
                    className="inline-flex items-center border-2 border-white/40 px-8 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
                  >
                    Shop Conditioner
                  </Link>
                </>
              ) : (
                <Link
                  to="/contact"
                  className="inline-flex items-center border-2 border-[#c9a227] bg-[#c9a227] px-8 py-3.5 font-semibold text-ink-950 transition hover:bg-[#d4af37]"
                >
                  Contact Us
                </Link>
              )}
            </div>
          </div>
          <div className="relative min-h-[420px]">
            <HeroCarousel slides={heroSlides} />
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-12 gap-y-2 px-6 text-center text-[13px] font-medium uppercase tracking-widest text-ink-500">
          {['GHK-Cu Formula', 'Everyday Hair Care', 'Free Shipping $200+', 'Secure Payment', '24/7 Support'].map(
            (b) => (
              <span key={b}>{b}</span>
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

      {catalogVisible && bestSellers.length > 1 && (
      <section className="border-t border-ink-200 bg-ink-50/50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
                Shop
              </p>
              <h2 className="mt-2 font-sans text-display-sm font-bold tracking-tight text-ink-900">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop"
              className="font-sans text-sm font-semibold text-ink-700 underline underline-offset-4 hover:text-ink-900"
            >
              View All
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
      )}

      {catalogVisible && popular.length > 1 && (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
            Collection
          </p>
          <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-ink-900">
            Popular Products
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                badge={p.isFeatured ? 'New' : undefined}
              />
            ))}
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

      <section className="relative bg-ink-950 px-6 py-16 text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
            Customer notes
          </p>
          <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-white">
            What people say
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.author}
                className="border-l-2 border-accent pl-6"
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
            <Link to="/contact" className="font-semibold text-ink-900 underline underline-offset-4 hover:text-accent-dark">
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

      <section className="relative bg-ink-950 px-6 py-16 text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-white">
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
