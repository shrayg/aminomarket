type FadeImageStackProps = {
  images: string[]
  activeIndex: number
  alt: string
  className?: string
  imageClassName?: string
  durationMs?: number
}

/**
 * Crossfades between stacked images with a smooth opacity transition.
 * Keeps every image mounted so opacity can animate instead of hard-swapping src.
 */
export function FadeImageStack({
  images,
  activeIndex,
  alt,
  className = '',
  imageClassName = 'object-contain',
  durationMs = 900,
}: FadeImageStackProps) {
  if (images.length === 0) return null

  const safeIndex = ((activeIndex % images.length) + images.length) % images.length

  return (
    <div className={`absolute inset-0 ${className}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === safeIndex ? alt : ''}
          aria-hidden={i !== safeIndex}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 h-full w-full transition-opacity ease-in-out ${imageClassName}`}
          style={{
            opacity: i === safeIndex ? 1 : 0,
            transitionDuration: `${durationMs}ms`,
          }}
        />
      ))}
    </div>
  )
}
