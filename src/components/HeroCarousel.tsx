import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/data/heroCarousel'

function CTAButton({ slide }: { slide: HeroSlide }) {
  const isExternal = slide.href.startsWith('http://') || slide.href.startsWith('https://')
  const cls = 'inline-flex border-2 border-[#c9a227] bg-[#c9a227] px-6 py-3 font-sans font-semibold text-ink-950 transition hover:bg-[#d4af37]'
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

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides.length])

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden">
      <div className="relative h-full w-full">
        <img
          src={slide.image}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div
          className="absolute inset-0 hidden items-center justify-center bg-ink-800/50"
          style={{ display: 'none' }}
        >
          <span className="font-sans text-sm text-ink-300">Add image: {slide.image}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/70 to-transparent p-6">
        <CTAButton slide={slide} />
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === current ? 'bg-[#c9a227]' : 'bg-white/50 hover:bg-white/80'
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
