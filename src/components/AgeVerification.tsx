import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'amp-age-verified'

export function AgeVerification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])

  const handleAgree = () => {
    const age = (document.getElementById('age-confirm') as HTMLInputElement)?.checked
    const terms = (document.getElementById('terms-confirm') as HTMLInputElement)?.checked
    if (age && terms) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setShow(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-950/90 backdrop-blur-sm">
      <div className="mx-4 max-w-md animate-fade-in rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center text-5xl">🔬</div>
        <h2 className="text-center font-sans text-2xl font-bold text-ink-900">
          Age Verification Required
        </h2>
        <p className="mt-4 text-center text-ink-600">
          This site is restricted. Confirm you meet the age requirement and
          accept the agreement below.
        </p>
        <div className="mt-6 space-y-4">
          <label className="flex gap-3 text-sm">
            <input
              type="checkbox"
              id="age-confirm"
              className="mt-1 rounded border-ink-300"
            />
            <span>I confirm I am <strong>21+</strong> years of age.</span>
          </label>
          <label className="flex gap-3 text-sm">
            <input
              type="checkbox"
              id="terms-confirm"
              className="mt-1 rounded border-ink-300"
            />
            <span>
              I agree that products are for <strong>laboratory research use
              only</strong> and are not for human or animal use. I agree to the
              Terms of Service and Privacy Policy.
            </span>
          </label>
        </div>
        <div className="mt-8 flex gap-4">
          <Link
            to="/"
            className="flex-1 rounded-xl border border-ink-200 px-4 py-3 text-center font-medium text-ink-700 transition hover:bg-ink-50"
          >
            Exit
          </Link>
          <button
            onClick={handleAgree}
            className="flex-1 rounded-xl bg-ink-900 px-4 py-3 font-medium text-white transition hover:bg-ink-800"
          >
            I Agree & Enter
          </button>
        </div>
      </div>
    </div>
  )
}
