import { Link } from 'react-router-dom'

type LogoProps = {
  variant?: 'light' | 'dark'
  height?: 'sm' | 'md' | 'lg' | 'xl'
  link?: boolean
  className?: string
}

const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12', xl: 'h-16 md:h-20' } as const

export function Logo({ variant = 'light', height = 'md', link = true, className = '' }: LogoProps) {
  const src = variant === 'dark' ? '/logo/logo-dark.png' : '/logo/logo.png'
  const img = (
    <img
      src={src}
      alt="Amino Market"
      className={`${heights[height]} w-auto shrink-0 object-contain object-left ${className}`}
      style={{ imageRendering: 'auto' }}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  )
  if (link) {
    return (
      <Link to="/" className={`inline-flex items-center ${className}`}>
        {img}
      </Link>
    )
  }
  return img
}
