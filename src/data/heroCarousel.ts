// Add your peptide images here. Place images in public/hero/ or use URLs.
// Each slide: image path, button text, and redirect URL (internal path or external)
export type HeroSlide = {
  image: string
  buttonText: string
  href: string
}

export const heroSlides: HeroSlide[] = [
  { image: '/hero/peptide-1.jpg', buttonText: 'Shop Research Peptides', href: '/shop?category=research-peptides' },
  { image: '/hero/peptide-2.jpg', buttonText: 'View Formulations', href: '/shop?category=research-formulations' },
  { image: '/hero/peptide-3.jpg', buttonText: 'Browse Accessories', href: '/shop?category=accessories' },
]
