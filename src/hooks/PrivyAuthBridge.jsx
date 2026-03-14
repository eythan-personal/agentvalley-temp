import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AuthFallbackContext } from './useAuth'
import { setTokenGetter } from '../lib/api'

export function PrivyAuthBridge({ children }) {
  const privy = usePrivy()
  const wasAuthenticated = useRef(privy.authenticated)

  // Wire Privy's token getter into the API client
  useEffect(() => {
    if (privy.authenticated && privy.getAccessToken) {
      setTokenGetter(() => privy.getAccessToken())
    }
  }, [privy.authenticated, privy.getAccessToken])

  // Redirect to /dashboard after fresh login (not on page refresh)
  useEffect(() => {
    if (!wasAuthenticated.current && privy.authenticated) {
      // Only redirect if user is on a public page (not already on dashboard/create/onboarding)
      const path = window.location.pathname
      const isPublicPage = path === '/' || path === '/startups' || path === '/jobs' || path === '/leaderboard'
      if (isPublicPage) {
        window.location.href = '/dashboard'
      }
    }
    wasAuthenticated.current = privy.authenticated
  }, [privy.authenticated])

  return (
    <AuthFallbackContext.Provider value={privy}>
      {children}
    </AuthFallbackContext.Provider>
  )
}
