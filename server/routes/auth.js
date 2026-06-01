import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const db = getSupabase()
    const { data: existing, error: lookupError } = await db
      .from('app_users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()
    throwIfSupabaseError(lookupError)

    if (existing) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hash = await bcrypt.hash(String(password), 10)
    const { data: user, error: createError } = await db
      .from('app_users')
      .insert({
        email: normalizedEmail,
        name: name ? String(name).slice(0, 120) : null,
        password_hash: hash,
      })
      .select('id, email, name')
      .single()
    throwIfSupabaseError(createError)

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'User already exists' })
    }
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const db = getSupabase()
    const { data: user, error } = await db
      .from('app_users')
      .select('id, email, name, password_hash')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle()
    throwIfSupabaseError(error)

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(String(password), user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
