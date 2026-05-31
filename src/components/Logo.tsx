import { Link } from 'react-router-dom'

type LogoProps = {
  variant?: 'light' | 'dark'
  height?: 'sm' | 'md' | 'lg' | 'xl'
  link?: boolean
  withText?: boolean
  className?: string
}

const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12', xl: 'h-16 md:h-20' } as const

export function Logo({
  variant = 'light',
  height = 'md',
  link = true,
  withText = false,
  className = '',
}: LogoProps) {
  const src = variant === 'dark' ? '/logo/logo-dark.png' : '/logo/logo.png'
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink-900'

  const img = (
    <img
      src={src}
      alt="Amino Market"
      className={`${heights[height]} w-auto shrink-0 object-contain object-left`}
      style={{ imageRendering: 'auto' }}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  )

  const content = withText ? (
    <span className="inline-flex items-center gap-2">
      {img}
      <span
        className={`font-sans text-lg font-extrabold tracking-tight ${textColor}`}
      >
        amino market
      </span>
    </span>
  ) : (
    img
  )

  if (link) {
    return (
      <Link
        to="/"
        aria-label="Amino Market — Home"
        className={`inline-flex items-center ${className}`}
      >
        {content}
      </Link>
    )
  }
  return <span className={`inline-flex items-center ${className}`}>{content}</span>
}
