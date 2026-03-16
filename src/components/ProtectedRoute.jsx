import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import PixelIcon from './PixelIcon'

/**
 * Route guard — shows login modal for unauthenticated users.
 * Stays on the current URL so intent is preserved after login.
 */
export default function ProtectedRoute({ children }) {
  const { authenticated, ready, login } = useAuth()
  const loginTriggered = useRef(false)

  useEffect(() => {
    // Only trigger login once — re-calling login() resets the Privy modal
    // and destroys the OTP code input screen
    if (ready && !authenticated && !loginTriggered.current) {
      loginTriggered.current = true
      login()
    }
  }, [ready, authenticated, login])

  // Privy still initializing or not authenticated — show loading screen
  // (login modal renders on top of this via Privy portal)
  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[var(--color-accent)] live-pulse">
            <PixelIcon name="loader" size={32} />
          </span>
          <span className="text-[13px] text-[var(--color-muted)]">
            {ready ? 'Connect to continue' : 'Loading...'}
          </span>
        </div>
      </div>
    )
  }

  return children
}
