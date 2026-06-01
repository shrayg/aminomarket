import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sendSessionUpdate, trackPageView } from '@/lib/analytics'

export function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView()
    const handleConsent = () => trackPageView()
    window.addEventListener('amp-consent', handleConsent)
    return () => window.removeEventListener('amp-consent', handleConsent)
  }, [location.pathname, location.search])

  useEffect(() => {
    const interval = window.setInterval(sendSessionUpdate, 15000)
    window.addEventListener('pagehide', sendSessionUpdate)
    document.addEventListener('visibilitychange', sendSessionUpdate)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('pagehide', sendSessionUpdate)
      document.removeEventListener('visibilitychange', sendSessionUpdate)
    }
  }, [])

  return null
}
