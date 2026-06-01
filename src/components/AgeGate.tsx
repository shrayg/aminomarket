import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const STORAGE_KEY = 'am_age_gate'
const INELIGIBLE_DESTINATION = 'https://www.google.com'

function readPersistedAcceptance(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // Private-mode / disabled storage — fail safe by showing the gate so the
    // operator has a record-of-intent for everyone with a working browser.
    return false
  }
}

export function AgeGate() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    setOpen(!readPersistedAcceptance())
  }, [])

  // Lock body scroll while the gate is up so the modal can't be scrolled past.
  useEffect(() => {
    if (!hydrated) return
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [hydrated, open])

  if (!hydrated) return null
  if (!open) return null
  // Admin surface is owner-only — never gate it.
  if (location.pathname.startsWith('/admin')) return null

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore: at worst the gate appears again on the next load
    }
    setOpen(false)
  }

  function decline() {
    window.location.replace(INELIGIBLE_DESTINATION)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-heading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-950/90 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <h2
          id="age-gate-heading"
          className="font-sans text-2xl font-bold text-ink-900"
        >
          You must be 21+ to enter
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">
          Amino Market sells research chemicals for in-vitro laboratory use
          only. Products are not for human or veterinary consumption. By
          entering you confirm you are 21 or older and are acquiring materials
          for legitimate research.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={accept}
            className="flex-1 rounded-xl bg-accent-dark px-5 py-3 font-semibold text-white transition hover:brightness-110"
          >
            I am 21+ and agree
          </button>
          <button
            type="button"
            onClick={decline}
            className="flex-1 rounded-xl border border-ink-200 px-5 py-3 font-medium text-ink-700 transition hover:bg-ink-50"
          >
            I am not eligible
          </button>
        </div>
        <p className="mt-5 text-center text-xs text-ink-500">
          By continuing you agree to our{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-accent-dark">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="underline underline-offset-2 hover:text-accent-dark">
            Terms of Service
          </Link>.
        </p>
      </div>
    </div>
  )
}
