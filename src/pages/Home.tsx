import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { categories } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'
import { NewsletterForm } from '@/components/NewsletterForm'

const testimonials = [
  {
    text: 'Excellent quality peptides. I ordered Ipamorelin and BPC-157, both arrived quickly and were exactly as described. The COA was included and verified.',
    author: 'Paul',
    title: 'Verified Buyer',
  },
  {
    text: 'Fast shipping and great customer service. My order arrived within 3 days. The product quality is top-notch. Highly recommend.',
    author: 'Mike Johnson',
    title: 'Research Scientist',
  },
  {
    text: 'Outstanding purity levels. Been ordering from Aminomarket over a year. Consistently delivers excellent results in our lab.',
    author: 'Sarah Chen',
    title: 'Lab Director',
  },
]

const faqs = [
  { q: 'Are your peptides pure and safe?', a: 'Each batch is produced in a U.S.-based facility and tested by third-party laboratories for purity and identity. COAs are available upon request.' },
  { q: 'How should I store my peptides?', a: 'Store in a cool, dry place. Once reconstituted, refrigerate or freeze depending on the peptide. Consult research protocols.' },
  { q: 'Are your peptides for research or human use?', a: 'All peptides are strictly for laboratory research use only and are not intended for human or veterinary use.' },
]

export function Home() {
  const { products, loading } = useProducts()
  const featured = products.filter((p) => p.isFeatured)
  const bestSellers = products.filter((p) => p.inStock).slice(0, 6)
  const popular = products.filter((p) => p.inStock).slice(0, 8)

  return (
    <div>
      {/* Hero - editorial, left-aligned */}
      <section className="relative min-h-[85vh] bg-[#1A1B1F] text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 py-24 text-left md:px-12">
          <p className="mb-8 font-sans text-xs font-medium uppercase tracking-[0.25em] text-ink-400">
            99% PURITY GUARANTEED
          </p>
          <h1 className="font-sans text-display font-extrabold leading-none tracking-tight-ultra text-white">
            Pioneering.
            <br />
            <span className="text-[#c9a227]">Peptide Science.</span>
          </h1>
          <p className="mt-10 max-w-lg font-sans text-lg leading-relaxed text-ink-300">
            Premium-grade research peptides backed by science. Trusted by
            scientists and institutions advancing biochemistry, longevity, and
            cellular discovery.
          </p>
          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center border-2 border-[#c9a227] bg-[#c9a227] px-8 py-4 font-semibold text-ink-950 transition hover:bg-[#d4af37]"
            >
              Shop Peptides
            </Link>
            <Link
              to="/pre-sale"
              className="inline-flex items-center border-2 border-white/30 px-8 py-4 font-semibold transition hover:border-white/60"
            >
              Pre-Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Trust - minimal, no emoji */}
      <section className="border-b border-ink-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-12 gap-y-2 px-6 text-center text-[13px] font-medium uppercase tracking-widest text-ink-500">
          {['99% Purity', 'Lab Tested', 'Free Shipping $200+', 'Secure Payment', '24/7 Support'].map(
            (b) => (
              <span key={b}>{b}</span>
            )
          )}
        </div>
      </section>

      {/* Featured - asymmetric grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-400">
              Our Collection
            </p>
            <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-ink-900">
              Featured Products
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

      {/* Best Sellers */}
      <section className="border-t border-ink-200 bg-ink-50/50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
                Top Rated
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

      {/* Popular */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
            Trending Now
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

      {/* Categories - cleaner cards */}
      <section className="border-t border-ink-200 bg-ink-50/50 px-6 py-24">
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

      {/* Why Aminomarket */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-sans text-display-sm font-bold tracking-tight text-ink-900">
            Industry-Leading Quality
          </h2>
          <p className="mt-4 max-w-2xl font-serif text-ink-600">
            Every product undergoes rigorous third-party testing for 99%+ purity.
          </p>
          <div className="mt-16 grid gap-16 md:grid-cols-3">
            {[
              { title: 'Third-Party Lab Tested', desc: 'Every batch independently verified for purity and quality.' },
              { title: 'Fast & Discreet Shipping', desc: 'Orders ship within 24 hours in unmarked packaging.' },
              { title: 'Money-Back Guarantee', desc: 'Full refund within 30 days if not satisfied.' },
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

      {/* Testimonials - editorial, no stars */}
      <section className="relative bg-ink-950 px-6 py-24 text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
            10K+ Happy Researchers
          </p>
          <h2 className="mt-3 font-sans text-display-sm font-bold tracking-tight text-white">
            What Researchers Say
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

      {/* FAQs */}
      <section className="border-t border-ink-200 px-6 py-24">
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

      {/* Newsletter */}
      <section className="relative bg-ink-950 px-6 py-24 text-white">
        <div className="noise absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-white">
            Stay Updated
          </h2>
          <p className="mt-4 font-serif text-ink-300">
            Exclusive deals, new products, research updates.
          </p>
          <div className="mt-10 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  )
}
