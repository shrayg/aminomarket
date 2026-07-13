import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { HeroSlide } from '@/data/heroCarousel'

function randomIndex(length: number, exclude?: number) {
  if (length <= 1) return 0
  let next = Math.floor(Math.random() * length)
  if (exclude == null) return next
  while (next === exclude) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

type HeroShowcaseProps = {
  slides: HeroSlide[]
  catalogVisible?: boolean
}

/**
 * Full-bleed product hero: image fills the frame, brand copy sits on top,
 * and a new random shot is chosen on mount and as the gallery cycles.
 */
export function HeroShowcase({ slides, catalogVisible = true }: HeroShowcaseProps) {
  const [index, setIndex] = useState(() => randomIndex(Math.max(slides.length, 1)))
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setIndex((current) => randomIndex(slides.length, current))
  }, [slides.length])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = window.setInterval(advance, 5500)
    return () => window.clearInterval(id)
  }, [advance, paused, slides.length])

  if (slides.length === 0) return null

  const slide = slides[index] ?? slides[0]

  return (
    <section
      className="relative isolate min-h-[78vh] overflow-hidden bg-ink-950 text-white md:min-h-[88vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((candidate, i) => (
        <img
          key={candidate.image}
          src={candidate.image}
          alt=""
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/65 to-ink-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/35" />
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-6 py-16 md:min-h-[88vh] md:px-12 lg:py-24">
        <p className="mb-5 font-sans text-xs font-medium uppercase tracking-[0.25em] text-white/60">
          Copper Peptide Hair Care
        </p>
        <h1 className="brand-glow max-w-xl font-sans text-5xl font-extrabold leading-[1.05] tracking-tight text-brand-lavender md:text-6xl lg:text-7xl">
          Strand Labs
        </h1>
        <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-white/85 md:text-lg">
          Blue copper peptide shampoo and conditioner for everyday hair care.
          Clean formula, matching pair, made for modern scalp and strand routines.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          {catalogVisible ? (
            <>
              <Link
                to="/product/blue-copper-shampoo"
                className="inline-flex items-center border-2 border-brand-gold bg-brand-gold px-8 py-3.5 font-semibold text-ink-950 transition hover:border-brand-gold-light hover:bg-brand-gold-light"
              >
                Shop Shampoo
              </Link>
              <Link
                to="/product/blue-copper-conditioner"
                className="inline-flex items-center border-2 border-white/50 px-8 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Shop Conditioner
              </Link>
            </>
          ) : (
            <Link
              to="/contact"
              className="inline-flex items-center border-2 border-brand-gold bg-brand-gold px-8 py-3.5 font-semibold text-ink-950 transition hover:bg-brand-gold-light"
            >
              Contact Us
            </Link>
          )}
        </div>

        <div className="mt-10 flex items-center gap-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Now showing · {slide.title}
          </p>
          {slides.length > 1 && (
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={slides[i].image + i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-brand-gold' : 'w-1.5 bg-white/35 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
