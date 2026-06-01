export type Customer = {
  id: string
  email: string
  name?: string | null
}

export function getToken() {
  return localStorage.getItem('token') || ''
}

export function getStoredUser(): Customer | null {
  try {
    const value = localStorage.getItem('user')
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: Customer) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function saveUser(user: Customer) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
