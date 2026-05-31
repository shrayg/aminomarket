import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/data/heroCarousel'

function CTAButton({ slide, tabIndex }: { slide: HeroSlide; tabIndex?: number }) {
  const isExternal = slide.href.startsWith('http://') || slide.href.startsWith('https://')
  const cls =
    'inline-flex border-2 border-[#c9a227] bg-[#c9a227] px-6 py-3 font-sans font-semibold text-ink-950 transition hover:bg-[#d4af37]'
  if (isExternal) {
    return (
      <a
        href={slide.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        tabIndex={tabIndex}
      >
        {slide.buttonText}
      </a>
    )
  }
  return (
    <Link to={slide.href} className={cls} tabIndex={tabIndex}>
      {slide.buttonText}
    </Link>
  )
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  // direction: 1 = next, -1 = prev. Used to make slides enter from the right
  // when moving forward and from the left when moving backward.
  const [direction, setDirection] = useState<1 | -1>(1)
  const prevCurrentRef = useRef(0)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setDirection(1)
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [slides.length, paused])

  if (slides.length === 0) return null

  const goTo = (next: number) => {
    if (next === current) return
    const forward = (next - current + slides.length) % slides.length <= slides.length / 2
    setDirection(forward ? 1 : -1)
    prevCurrentRef.current = current
    setCurrent(next)
  }

  const goPrev = () => {
    setDirection(-1)
    prevCurrentRef.current = current
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }

  const goNext = () => {
    setDirection(1)
    prevCurrentRef.current = current
    setCurrent((c) => (c + 1) % slides.length)
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a2c33] via-[#1f2126] to-[#15171c] px-8 py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex w-full flex-1 items-stretch justify-center">
        {slides.map((s, i) => {
          const isCurrent = i === current
          // Off-slides park slightly to the right when moving forward, to the
          // left when moving backward, so the current slide always feels like
          // it's gliding in from that side.
          const offsetClass = isCurrent
            ? 'opacity-100 translate-x-0'
            : direction === 1
              ? 'opacity-0 translate-x-6'
              : 'opacity-0 -translate-x-6'
          return (
            <div
              key={i}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${offsetClass} ${
                isCurrent ? '' : 'pointer-events-none'
              }`}
            >
              <div className="flex w-full flex-1 items-center justify-center">
                <img
                  src={s.image}
                  alt={s.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-auto max-h-[340px] w-auto max-w-[260px] object-contain drop-shadow-2xl"
                />
              </div>
              <div className="mt-6 flex w-full flex-col items-center gap-3 text-center">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/80">
                  {s.title}
                </p>
                <CTAButton slide={s} tabIndex={isCurrent ? 0 : -1} />
              </div>
            </div>
          )
        })}
      </div>

      {slides.length > 1 && (
        <div className="relative z-10 mt-4 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-5 bg-[#c9a227]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
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
