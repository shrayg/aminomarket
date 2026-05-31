import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/data/heroCarousel'

function CTAButton({ slide }: { slide: HeroSlide }) {
  const isExternal = slide.href.startsWith('http://') || slide.href.startsWith('https://')
  const cls =
    'inline-flex border-2 border-[#c9a227] bg-[#c9a227] px-6 py-3 font-sans font-semibold text-ink-950 transition hover:bg-[#d4af37]'
  if (isExternal) {
    return (
      <a href={slide.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {slide.buttonText}
      </a>
    )
  }
  return (
    <Link to={slide.href} className={cls}>
      {slide.buttonText}
    </Link>
  )
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides.length, paused])

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a2c33] via-[#1f2126] to-[#15171c] px-8 py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex w-full flex-1 items-center justify-center">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-auto max-h-[340px] w-auto max-w-[260px] object-contain drop-shadow-2xl"
          key={slide.image}
        />
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-3 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/80">
          {slide.title}
        </p>
        <CTAButton slide={slide} />
        {slides.length > 1 && (
          <div className="mt-2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition ${
                  i === current ? 'w-5 bg-[#c9a227]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}
