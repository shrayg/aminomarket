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
      className="relative h-full min-h-[400px] w-full overflow-hidden bg-gradient-to-br from-[#2a2c33] via-[#1f2126] to-[#15171c]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <img
          src={slide.image}
          alt={slide.title}
          className="max-h-full max-w-full object-contain drop-shadow-2xl transition-opacity duration-500"
          key={slide.image}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 py-8 text-center">
        <p className="font-sans text-sm font-semibold uppercase tracking-widest text-white/90">
          {slide.title}
        </p>
        <CTAButton slide={slide} />
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
          <div className="absolute bottom-32 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === current ? 'w-6 bg-[#c9a227]' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
