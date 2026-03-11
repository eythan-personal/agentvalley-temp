import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TransitionLink from './TransitionLink'
import PixelIcon from './PixelIcon'

export default function Nav() {
  const { login, logout, authenticated, user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const showCreateStartup = location.pathname === '/startups' || location.pathname.startsWith('/startups/')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const displayName = user?.google?.name || (user?.wallet?.address ? user.wallet.address.slice(0, 6) + '...' : null)

  return (
    <>
    <a href="#main" className="skip-link">Skip to main content</a>
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]'
          : ''
      }`}
    >
      <div className="w-full px-6 mx-auto flex items-center justify-between h-16" style={{ maxWidth: 'calc(var(--container) + 48px)' }}>
        <div className="flex items-center gap-6">
          <TransitionLink to="/" className="flex items-center">
            <span
              className="text-[var(--color-heading)] text-[14px] tracking-tight font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AgentValley
            </span>
          </TransitionLink>

          <TransitionLink
            to="/startups"
            className="hidden sm:flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Startups
          </TransitionLink>

          <TransitionLink
            to="/jobs"
            className="hidden sm:flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Jobs
          </TransitionLink>

          <TransitionLink
            to="/leaderboard"
            className="hidden sm:flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Leaderboard
          </TransitionLink>
        </div>

        <div className="flex items-center gap-5">
          <TransitionLink
            to="/startups"
            className="sm:hidden flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Startups
          </TransitionLink>

          <TransitionLink
            to="/jobs"
            className="sm:hidden flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Jobs
          </TransitionLink>

          <TransitionLink
            to="/leaderboard"
            className="sm:hidden flex items-center text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] transition-colors"
          >
            Startups
          </TransitionLink>

          {showCreateStartup && (
            <TransitionLink
              to="/create"
              className="h-9 px-5 rounded-full text-[13px] font-medium cursor-pointer
                         bg-[var(--color-accent)] text-[#163300]
                         hover:shadow-lg transition-all duration-200
                         inline-flex items-center gap-2"
            >
              <PixelIcon name="zap" size={14} />
              Create Startup
            </TransitionLink>
          )}

          {authenticated ? (
            <>
              <TransitionLink
                to="/dashboard"
                className="h-9 px-5 rounded-full text-[13px] font-medium
                           bg-[var(--color-heading)] text-white
                           hover:bg-[#343433] transition-colors
                           inline-flex items-center"
              >
                Dashboard
              </TransitionLink>
              <button
                onClick={logout}
                className="text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer hidden sm:block"
              >
                Log out
              </button>
            </>
          ) : (
            <TransitionLink
              to="/dashboard"
              className="h-9 px-5 rounded-full text-[13px] font-medium
                         bg-[var(--color-heading)] text-white
                         hover:bg-[#343433] transition-colors
                         inline-flex items-center gap-2"
            >
              <PixelIcon name="wallet" size={14} />
              Connect
            </TransitionLink>
          )}
        </div>
      </div>
    </nav>
    </>
  )
}
