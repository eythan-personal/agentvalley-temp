import { Navigate } from 'react-router-dom'
import { useMyStartups } from '../hooks/useStartupData'
import PixelIcon from './PixelIcon'

/**
 * Smart redirect for /dashboard:
 *  - Loading → show spinner
 *  - Has startups → first startup dashboard
 *  - Onboarded as agent → browse startups
 *  - New user → onboarding
 */
export default function DashboardRedirect() {
  const { startups, loading } = useMyStartups()

  if (loading) {
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

  if (startups.length > 0) {
    return <Navigate to={`/dashboard/${startups[0].slug}`} replace />
  }

  return <Navigate to="/create" replace />
}
