import { Router } from 'express'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' })
    }

    const { error } = await getSupabase()
      .from('newsletter_subscribers')
      .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true })
    throwIfSupabaseError(error)

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
