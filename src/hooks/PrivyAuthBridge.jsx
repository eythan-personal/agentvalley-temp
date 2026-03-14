import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AuthFallbackContext } from './useAuth'
import { setTokenGetter } from '../lib/api'

export function PrivyAuthBridge({ children }) {
  const privy = usePrivy()
  const readyRef = useRef(false)
  const wasAuthenticatedAfterReady = useRef(false)

  // Wire Privy's token getter into the API client SYNCHRONOUSLY
  // so it's available before any child effects fire
  if (privy.authenticated && privy.getAccessToken) {
    setTokenGetter(() => privy.getAccessToken())
  }

  // Redirect to /dashboard after fresh login
  useEffect(() => {
    if (!privy.ready) return

    // First time ready fires — snapshot the initial auth state
    if (!readyRef.current) {
      readyRef.current = true
      wasAuthenticatedAfterReady.current = privy.authenticated
      return
    }

    // Detect transition from not-authenticated to authenticated (actual login)
    if (!wasAuthenticatedAfterReady.current && privy.authenticated) {
      const path = window.location.pathname
      const isPublicPage = path === '/' || path === '/startups' || path === '/jobs' || path === '/leaderboard'
      if (isPublicPage) {
        window.location.href = '/dashboard'
      }
    }

    wasAuthenticatedAfterReady.current = privy.authenticated
  }, [privy.ready, privy.authenticated])

  return (
    <AuthFallbackContext.Provider value={privy}>
      {children}
    </AuthFallbackContext.Provider>
  )
}
