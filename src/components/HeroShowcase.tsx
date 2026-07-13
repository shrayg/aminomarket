import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/data/heroCarousel'
import { FadeImageStack } from '@/components/FadeImageStack'

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
 * Split hero: copy on the left, full-bleed product photography on the right.
 * Right-panel images start random and cycle randomly with a smooth crossfade.
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
  const images = slides.map((item) => item.image)
  const goPrev = () => setIndex((current) => (current - 1 + slides.length) % slides.length)
  const goNext = () => setIndex((current) => (current + 1) % slides.length)

  return (
    <section className="relative bg-ink-950 text-white">
      <div className="noise pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-14 text-left md:px-12 lg:py-20">
          <p className="mb-5 font-sans text-xs font-medium uppercase tracking-[0.25em] text-brand-lavender/70">
            Copper Peptide Hair Care
          </p>
          <h1 className="brand-glow font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-lavender md:text-5xl lg:text-6xl">
            Strand Labs
          </h1>
          <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-white/80">
            Blue copper peptide shampoo and conditioner for everyday hair care.
            Clean formula, matching pair, made for modern scalp and strand routines.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {catalogVisible ? (
              <>
                <Link
                  to="/product/blue-copper-shampoo"
                  className="inline-flex items-center border-2 border-brand-purple bg-brand-purple px-8 py-3.5 font-semibold text-white transition hover:border-brand-lavender hover:bg-brand-lavender hover:text-ink-950"
                >
                  Shop Shampoo
                </Link>
                <Link
                  to="/product/blue-copper-conditioner"
                  className="inline-flex items-center border-2 border-brand-lavender/50 px-8 py-3.5 font-semibold text-brand-lavender transition hover:border-brand-lavender hover:bg-brand-lavender/10"
                >
                  Shop Conditioner
                </Link>
              </>
            ) : (
              <Link
                to="/contact"
                className="inline-flex items-center border-2 border-brand-purple bg-brand-purple px-8 py-3.5 font-semibold text-white transition hover:border-brand-lavender hover:bg-brand-lavender hover:text-ink-950"
              >
                Contact Us
              </Link>
            )}
          </div>
        </div>

        <div
          className="relative min-h-[420px] overflow-hidden bg-[#16131f] lg:min-h-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <FadeImageStack
            images={images}
            activeIndex={index}
            alt={slide.title}
            imageClassName="object-cover"
            durationMs={1100}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-ink-950/10" />

          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-6 pb-7 pt-16">
            <p
              key={slide.title + index}
              className="animate-hero-fade font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/85"
            >
              {slide.title}
            </p>
            <Link
              to={slide.href}
              className="inline-flex border-2 border-brand-purple bg-brand-purple px-6 py-3 font-sans text-sm font-semibold text-white transition hover:border-brand-lavender hover:bg-brand-lavender hover:text-ink-950"
            >
              {slide.buttonText}
            </Link>
            {slides.length > 1 && (
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={slides[i].image + i}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                      i === index ? 'w-5 bg-brand-lavender' : 'w-1.5 bg-white/35 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-ink-950/50 p-2 text-white transition hover:bg-brand-purple/80"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-ink-950/50 p-2 text-white transition hover:bg-brand-purple/80"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
