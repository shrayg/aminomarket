import { Router } from 'express'

const router = Router()

// PLACEHOLDER: Connect to email service (Resend, SendGrid, etc.)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, orderNumber } = req.body
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message required' })
    }

    // PLACEHOLDER: Send email here
    console.log('Contact form:', { name, email, message, orderNumber })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
