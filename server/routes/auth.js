import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'
import { createUserToken, requireUser } from '../middleware/user-auth.js'
import { notifyNewSignup } from '../services/discord-notifications.js'

const router = Router()

function clean(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength)
}

function normalizedEmail(value) {
  return clean(value, 320).toLowerCase()
}

function mapAddress(row) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    line1: row.line1,
    line2: row.line2 || '',
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone || '',
    isDefault: row.is_default,
  }
}

function addressInput(body) {
  return {
    label: clean(body.label) || 'Shipping address',
    recipient_name: clean(body.recipientName),
    line1: clean(body.line1, 180),
    line2: clean(body.line2, 180) || null,
    city: clean(body.city),
    state: clean(body.state, 80),
    postal_code: clean(body.postalCode, 20),
    country: clean(body.country, 2).toUpperCase() || 'US',
    phone: clean(body.phone, 40) || null,
    is_default: Boolean(body.isDefault),
    updated_at: new Date().toISOString(),
  }
}

function isCompleteAddress(address) {
  return address.recipient_name && address.line1 && address.city && address.state && address.postal_code
}

async function clearDefaultAddress(db, userId, exceptId = null) {
  let query = db
    .from('app_user_addresses')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (exceptId) query = query.neq('id', exceptId)
  const { error } = await query
  throwIfSupabaseError(error)
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const normalizedEmailValue = normalizedEmail(email)
    const db = getSupabase()
    const { data: existing, error: lookupError } = await db
      .from('app_users')
      .select('id')
      .eq('email', normalizedEmailValue)
      .maybeSingle()
    throwIfSupabaseError(lookupError)

    if (existing) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hash = await bcrypt.hash(String(password), 10)
    const { data: user, error: createError } = await db
      .from('app_users')
      .insert({
        email: normalizedEmailValue,
        name: clean(name) || null,
        password_hash: hash,
      })
      .select('id, email, name')
      .single()
    throwIfSupabaseError(createError)
    try {
      await notifyNewSignup({ ...user, createdAt: new Date() })
    } catch (notificationError) {
      console.error(`[discord] signup notification failed: ${notificationError.message}`)
    }

    const token = createUserToken(user)
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
      .eq('email', normalizedEmail(email))
      .maybeSingle()
    throwIfSupabaseError(error)

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(String(password), user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = createUserToken(user)
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', requireUser, async (req, res) => {
  try {
    const { data: user, error } = await getSupabase()
      .from('app_users')
      .select('id, email, name, created_at')
      .eq('id', req.user.id)
      .single()
    throwIfSupabaseError(error)
    res.json({ id: user.id, email: user.email, name: user.name, createdAt: user.created_at })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/profile', requireUser, async (req, res) => {
  try {
    const { data: user, error } = await getSupabase()
      .from('app_users')
      .update({ name: clean(req.body?.name) || null })
      .eq('id', req.user.id)
      .select('id, email, name')
      .single()
    throwIfSupabaseError(error)
    res.json({ id: user.id, email: user.email, name: user.name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/password', requireUser, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '')
    const nextPassword = String(req.body?.newPassword || '')
    if (nextPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' })
    }

    const db = getSupabase()
    const { data: user, error: lookupError } = await db
      .from('app_users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single()
    throwIfSupabaseError(lookupError)

    if (!await bcrypt.compare(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' })
    }

    const { error } = await db
      .from('app_users')
      .update({ password_hash: await bcrypt.hash(nextPassword, 10) })
      .eq('id', req.user.id)
    throwIfSupabaseError(error)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/addresses', requireUser, async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('app_user_addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    throwIfSupabaseError(error)
    res.json(data.map(mapAddress))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/addresses', requireUser, async (req, res) => {
  try {
    const db = getSupabase()
    const address = addressInput(req.body || {})
    if (!isCompleteAddress(address)) {
      return res.status(400).json({ error: 'Recipient, street, city, state, and ZIP are required.' })
    }

    const { count, error: countError } = await db
      .from('app_user_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
    throwIfSupabaseError(countError)
    address.is_default = address.is_default || count === 0
    if (address.is_default) await clearDefaultAddress(db, req.user.id)

    const { data, error } = await db
      .from('app_user_addresses')
      .insert({ ...address, user_id: req.user.id })
      .select('*')
      .single()
    throwIfSupabaseError(error)
    res.status(201).json(mapAddress(data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/addresses/:id', requireUser, async (req, res) => {
  try {
    const db = getSupabase()
    const address = addressInput(req.body || {})
    if (!isCompleteAddress(address)) {
      return res.status(400).json({ error: 'Recipient, street, city, state, and ZIP are required.' })
    }
    if (address.is_default) await clearDefaultAddress(db, req.user.id, req.params.id)

    const { data, error } = await db
      .from('app_user_addresses')
      .update(address)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle()
    throwIfSupabaseError(error)
    if (!data) return res.status(404).json({ error: 'Address not found.' })
    res.json(mapAddress(data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/addresses/:id', requireUser, async (req, res) => {
  try {
    const { error } = await getSupabase()
      .from('app_user_addresses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    throwIfSupabaseError(error)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/password-reset-request', async (req, res) => {
  try {
    const email = normalizedEmail(req.body?.email)
    if (!email) return res.status(400).json({ error: 'Email is required.' })
    const { error } = await getSupabase()
      .from('password_reset_requests')
      .insert({ email })
    throwIfSupabaseError(error)
    res.json({ message: 'Request received. Support will follow up by email.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
