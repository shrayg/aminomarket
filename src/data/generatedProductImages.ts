export type GeneratedProductImageVariant = {
  dose: string
  image: string
}

export type GeneratedProductImageSet = {
  code: string
  variants: GeneratedProductImageVariant[]
}

const IMG = '/products'

const image = (dose: string, filename: string): GeneratedProductImageVariant => ({
  dose,
  image: `${IMG}/${filename}`,
})

export const generatedProductImages: GeneratedProductImageSet[] = [
  {
    code: 'BPC-157',
    variants: [
      image('2mg', 'generated-bpc-157-2mg.webp'),
      image('5mg', 'generated-bpc-157-5mg.webp'),
      image('10mg', 'generated-bpc-157-10mg.webp'),
    ],
  },
  {
    code: 'CJC-1295 with DAC',
    variants: [
      image('2mg', 'generated-cjc-1295-with-dac-2mg.webp'),
      image('5mg', 'generated-cjc-1295-with-dac-5mg.webp'),
      image('10mg', 'generated-cjc-1295-with-dac-10mg.webp'),
    ],
  },
  {
    code: 'KLOW Blend',
    variants: [image('80mg total', 'generated-klow-blend-80mg-total.webp')],
  },
  {
    code: 'DSIP',
    variants: [
      image('2mg', 'generated-dsip-2mg.webp'),
      image('5mg', 'generated-dsip-5mg.webp'),
      image('10mg', 'generated-dsip-10mg.webp'),
      image('15mg', 'generated-dsip-15mg.webp'),
    ],
  },
  {
    code: 'CJC-1295 no DAC',
    variants: [
      image('2mg', 'generated-cjc-1295-no-dac-2mg.webp'),
      image('5mg', 'generated-cjc-1295-no-dac-5mg.webp'),
      image('10mg', 'generated-cjc-1295-no-dac-10mg.webp'),
    ],
  },
  {
    code: 'NAD+',
    variants: [
      image('100mg', 'generated-nad-plus-100mg.webp'),
      image('250mg', 'generated-nad-plus-250mg.webp'),
      image('500mg', 'generated-nad-plus-500mg.webp'),
      image('1000mg', 'generated-nad-plus-1000mg.webp'),
    ],
  },
  {
    code: 'Selank',
    variants: [
      image('5mg', 'generated-selank-5mg.webp'),
      image('10mg', 'generated-selank-10mg.webp'),
    ],
  },
  {
    code: 'HCG',
    variants: [
      image('5000 IU', 'generated-hcg-5000-iu.webp'),
      image('10000 IU', 'generated-hcg-10000-iu.webp'),
    ],
  },
  {
    code: 'PT-141',
    variants: [image('10mg', 'generated-pt-141-10mg.webp')],
  },
  {
    code: 'Glutathione',
    variants: [
      image('600mg', 'generated-glutathione-600mg.webp'),
      image('1000mg', 'generated-glutathione-1000mg.webp'),
      image('1500mg', 'generated-glutathione-1500mg.webp'),
    ],
  },
  {
    code: 'AOD-9604',
    variants: [
      image('2mg', 'generated-aod-9604-2mg.webp'),
      image('5mg', 'generated-aod-9604-5mg.webp'),
      image('10mg', 'generated-aod-9604-10mg.webp'),
    ],
  },
  {
    code: 'Epithalon',
    variants: [
      image('10mg', 'generated-epithalon-10mg.webp'),
      image('50mg', 'generated-epithalon-50mg.webp'),
    ],
  },
  {
    code: 'KPV',
    variants: [
      image('5mg', 'generated-kpv-5mg.webp'),
      image('10mg', 'generated-kpv-10mg.webp'),
    ],
  },
  {
    code: 'IGF-1 LR3',
    variants: [
      image('100mcg', 'generated-igf-1-lr3-100mcg.webp'),
      image('0.1mg', 'generated-igf-1-lr3-0-1mg.webp'),
      image('1mg', 'generated-igf-1-lr3-1mg.webp'),
    ],
  },
  {
    code: '5-Amino-1MQ',
    variants: [
      image('5mg', 'generated-5-amino-1mq-5mg.webp'),
      image('10mg', 'generated-5-amino-1mq-10mg.webp'),
      image('20mg', 'generated-5-amino-1mq-20mg.webp'),
      image('50mg', 'generated-5-amino-1mq-50mg.webp'),
    ],
  },
  {
    code: 'GHRP-6',
    variants: [
      image('5mg', 'generated-ghrp-6-5mg.webp'),
      image('10mg', 'generated-ghrp-6-10mg.webp'),
    ],
  },
  {
    code: 'Cerebrolysin',
    variants: [image('60mg', 'generated-cerebrolysin-60mg.webp')],
  },
  {
    code: 'Kisspeptin',
    variants: [
      image('5mg', 'generated-kisspeptin-5mg.webp'),
      image('10mg', 'generated-kisspeptin-10mg.webp'),
    ],
  },
]
