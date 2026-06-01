import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { clearSession, getStoredUser, getToken, saveUser, type Customer } from '@/lib/auth'

type Props = {
  title: string
  subtitle: string
  back?: boolean
  children: ReactNode
}

export function AccountShell({ title, subtitle, back = false, children }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<Customer | null>(() => getStoredUser())
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }

    api.auth.me()
      .then((nextUser) => {
        saveUser(nextUser)
        setUser(nextUser)
      })
      .catch(() => {
        clearSession()
        navigate('/login', { replace: true, state: { from: location.pathname } })
      })
      .finally(() => setChecking(false))
  }, [location.pathname, navigate])

  if (checking) {
    return <p className="px-4 py-24 text-center text-sm text-ink-500">Loading your account...</p>
  }

  if (!user) return null

  function logout() {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {back && (
            <Link to="/account" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900">
              <ArrowLeft className="h-4 w-4" />
              Back to account
            </Link>
          )}
          <h1 className="font-sans text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-2 text-ink-600">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
      {children}
    </div>
  )
}
