import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

export function createUserToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function getRequestUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload.id || !payload.email) return null
    return { id: String(payload.id), email: String(payload.email) }
  } catch {
    return null
  }
}

export function requireUser(req, res, next) {
  const user = getRequestUser(req)
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' })
  req.user = user
  next()
}
