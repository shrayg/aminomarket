import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' })
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {},
      create: { email: email.trim().toLowerCase() },
    })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
