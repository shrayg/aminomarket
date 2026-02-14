import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import authRouter from './routes/auth.js'
import newsletterRouter from './routes/newsletter.js'
import contactRouter from './routes/contact.js'
import checkoutRouter from './routes/checkout.js'
import ordersRouter from './routes/orders.js'

const app = express()

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aminomarket.shop',
  'https://www.aminomarket.shop',
  /\.vercel\.app$/
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (corsOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      return cb(null, true)
    }
    cb(null, true)
  }
}))
app.use(express.json())

app.use('/api/products', productsRouter)
app.use('/api/auth', authRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/contact', contactRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/orders', ordersRouter)

app.get('/api/health', (_, res) => res.json({ ok: true }))

export default app
