import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const SRC = path.resolve('iamges')
const OUT = path.resolve('public/products')

await fs.mkdir(OUT, { recursive: true })

const files = (await fs.readdir(SRC)).filter((f) => f.toLowerCase().endsWith('.png'))

const slug = (name) =>
  name
    .replace(/\.png$/i, '')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const tasks = files.map(async (file) => {
  const src = path.join(SRC, file)
  const out = path.join(OUT, `${slug(file)}.webp`)
  await sharp(src)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out)
  return out
})

const results = await Promise.all(tasks)
console.log(`Converted ${results.length} images`)
for (const r of results) console.log(' -', path.basename(r))
