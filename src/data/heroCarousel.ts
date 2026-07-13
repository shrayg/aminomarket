export type HeroSlide = {
  image: string
  title: string
  buttonText: string
  href: string
}

/** Full hero rotation pool — shampoo first, then conditioner. */
export const heroSlides: HeroSlide[] = [
  {
    image: '/products/blue-copper-shampoo-01.png',
    title: 'Blue Copper Peptide Shampoo',
    buttonText: 'Shop Shampoo',
    href: '/product/blue-copper-shampoo',
  },
  {
    image: '/products/blue-copper-shampoo-02.png',
    title: 'Blue Copper Peptide Shampoo',
    buttonText: 'Shop Shampoo',
    href: '/product/blue-copper-shampoo',
  },
  {
    image: '/products/blue-copper-shampoo-03.png',
    title: 'Blue Copper Peptide Shampoo',
    buttonText: 'Shop Shampoo',
    href: '/product/blue-copper-shampoo',
  },
  {
    image: '/products/blue-copper-shampoo-04.png',
    title: 'Blue Copper Peptide Shampoo',
    buttonText: 'Shop Shampoo',
    href: '/product/blue-copper-shampoo',
  },
  {
    image: '/products/blue-copper-conditioner-01.png',
    title: 'Blue Copper Peptide Conditioner',
    buttonText: 'Shop Conditioner',
    href: '/product/blue-copper-conditioner',
  },
  {
    image: '/products/blue-copper-conditioner-02.png',
    title: 'Blue Copper Peptide Conditioner',
    buttonText: 'Shop Conditioner',
    href: '/product/blue-copper-conditioner',
  },
  {
    image: '/products/blue-copper-conditioner-03.png',
    title: 'Blue Copper Peptide Conditioner',
    buttonText: 'Shop Conditioner',
    href: '/product/blue-copper-conditioner',
  },
  {
    image: '/products/blue-copper-conditioner-04.png',
    title: 'Blue Copper Peptide Conditioner',
    buttonText: 'Shop Conditioner',
    href: '/product/blue-copper-conditioner',
  },
]

export const shampooHeroImages = heroSlides
  .filter((slide) => slide.href.includes('shampoo'))
  .map((slide) => slide.image)
