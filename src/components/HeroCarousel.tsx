import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/data/heroCarousel'

const TRANSITION_MS = 900

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

function SlideView({
  slide,
  active,
  animationClass,
  eager,
}: {
  slide: HeroSlide
  active: boolean
  animationClass: string
  eager: boolean
}) {
  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} ${
        active ? '' : 'pointer-events-none'
      }`}
    >
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <img
          src={slide.image}
          alt={slide.title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="h-auto max-h-full w-auto max-w-[200px] object-contain drop-shadow-2xl"
        />
      </div>
      <div className="mt-4 flex w-full flex-col items-center gap-3 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/80">
          {slide.title}
        </p>
        <CTAButton slide={slide} tabIndex={active ? 0 : -1} />
      </div>
    </div>
  )
}

type LeavingState = { index: number; direction: 1 | -1 } | null

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [leaving, setLeaving] = useState<LeavingState>(null)
  const [paused, setPaused] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)
  const leaveTimeout = useRef<number | null>(null)

  const change = useCallback(
    (next: number, dir: 1 | -1) => {
      setCurrent((cur) => {
        if (next === cur) return cur
        setHasNavigated(true)
        setDirection(dir)
        setLeaving({ index: cur, direction: dir })
        if (leaveTimeout.current) window.clearTimeout(leaveTimeout.current)
        leaveTimeout.current = window.setTimeout(() => {
          setLeaving(null)
          leaveTimeout.current = null
        }, TRANSITION_MS)
        return next
      })
    },
    []
  )

  useEffect(
    () => () => {
      if (leaveTimeout.current) window.clearTimeout(leaveTimeout.current)
    },
    []
  )

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = window.setInterval(() => {
      change((current + 1) % slides.length, 1)
    }, 6000)
    return () => window.clearInterval(id)
  }, [slides.length, paused, current, change])

  if (slides.length === 0) return null

  const goTo = (next: number) => {
    if (next === current) return
    const forward = (next - current + slides.length) % slides.length <= slides.length / 2
    change(next, forward ? 1 : -1)
  }
  const goPrev = () => change((current - 1 + slides.length) % slides.length, -1)
  const goNext = () => change((current + 1) % slides.length, 1)

  const enterAnimation = !hasNavigated
    ? ''
    : direction === 1
      ? 'animate-hero-slide-in-right'
      : 'animate-hero-slide-in-left'

  return (
    <div
      className="relative flex h-full w-full flex-col items-stretch overflow-hidden bg-gradient-to-br from-[#2a2c33] via-[#1f2126] to-[#15171c] px-8 pb-6 pt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-0 w-full flex-1">
        {leaving !== null && (
          <SlideView
            key={`leave-${leaving.index}-${current}`}
            slide={slides[leaving.index]}
            active={false}
            eager={false}
            animationClass={
              leaving.direction === 1
                ? 'animate-hero-slide-out-left'
                : 'animate-hero-slide-out-right'
            }
          />
        )}
        <SlideView
          key={`enter-${current}`}
          slide={slides[current]}
          active
          eager={current === 0 && !hasNavigated}
          animationClass={enterAnimation}
        />
      </div>

      {slides.length > 1 && (
        <div className="relative z-10 mt-5 flex justify-center gap-1.5">
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
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}
