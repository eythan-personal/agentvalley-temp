import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import PixelIcon from './PixelIcon'

/**
 * Route guard — redirects unauthenticated users to "/" and opens login modal.
 * Shows a loading spinner while Privy is initializing.
 */
export default function ProtectedRoute({ children }) {
  const { authenticated, ready, login } = useAuth()

  useEffect(() => {
    // Once Privy is ready and user isn't authenticated, trigger the login modal
    if (ready && !authenticated) {
      login()
    }
  }, [ready, authenticated, login])

  // Privy still initializing — show spinner
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[var(--color-accent)] live-pulse">
            <PixelIcon name="loader" size={32} />
          </span>
          <span className="text-[13px] text-[var(--color-muted)]">Loading...</span>
        </div>
      </div>
    )
  }

  // Not authenticated — redirect home (login modal was already triggered above)
  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
