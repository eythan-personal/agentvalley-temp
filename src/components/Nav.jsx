import { useAuth } from '../hooks/useAuth'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import TransitionLink from './TransitionLink'
import PixelIcon from './PixelIcon'
import { useTheme } from '../hooks/useTheme'
import logoSvg from '../assets/logo_av.svg'

const NAV_LINKS = [
  { to: '/startups', label: 'Startups', icon: 'speed' },
  { to: '/jobs', label: 'Jobs', icon: 'target' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
]

export default function Nav({ forceScrolled = false }) {
  const { login, logout, authenticated, user } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)
  const showCreateStartup = location.pathname === '/startups' || location.pathname.startsWith('/startups/')

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close menu on Escape key + focus trap
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        // Return focus to hamburger button
        menuRef.current?.querySelector('[aria-expanded]')?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <nav
        ref={menuRef}
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          forceScrolled || scrolled || menuOpen
            ? 'bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]'
            : ''
        }`}
      >
        <div className="w-full px-6 mx-auto flex items-center justify-between h-16" style={{ maxWidth: 'calc(var(--container) + 48px)' }}>
          {/* Left: Logo + desktop links */}
          <div className="flex items-center gap-6">
            <TransitionLink to="/" className="flex items-center gap-2">
              <img src={logoSvg} alt="AgentValley" width={24} height={24} />
              <span
                className="text-[var(--color-heading)] text-[14px] tracking-tight font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AgentValley
              </span>
            </TransitionLink>

            {NAV_LINKS.map(link => (
              <TransitionLink
                key={link.to}
                to={link.to}
                className={`hidden md:flex items-center text-[13px] font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-heading)] hover:text-[var(--color-accent)]'
                }`}
              >
                {link.label}
              </TransitionLink>
            ))}
          </div>

          {/* Right: CTA buttons + hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full
                         text-[var(--color-muted)] hover:text-[var(--color-heading)]
                         hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <PixelIcon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>

            {showCreateStartup && (
              <TransitionLink
                to="/create"
                className="hidden sm:inline-flex h-9 px-5 rounded-full text-[13px] font-medium cursor-pointer
                           bg-[var(--color-accent)] text-[#0d2000]
                           hover:shadow-lg transition-all duration-200
                           items-center gap-2"
              >
                <PixelIcon name="zap" size={14} />
                Create Startup
              </TransitionLink>
            )}

            {authenticated ? (
              <>
                <TransitionLink
                  to="/dashboard"
                  className="hidden sm:inline-flex h-9 px-5 rounded-full text-[13px] font-medium
                             bg-[var(--color-heading)] text-white
                             hover:bg-[#343433] transition-colors
                             items-center"
                >
                  Dashboard
                </TransitionLink>
                <button type="button"
                  onClick={logout}
                  className="text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer hidden md:block"
                >
                  Log out
                </button>
              </>
            ) : (
              <TransitionLink
                to="/dashboard"
                className="hidden sm:inline-flex h-9 px-5 rounded-full text-[13px] font-medium
                           bg-[var(--color-heading)] text-white
                           hover:bg-[#343433] transition-colors
                           items-center gap-2"
              >
                <PixelIcon name="wallet" size={14} />
                Connect
              </TransitionLink>
            )}

            {/* Hamburger — visible below md */}
            <button type="button"
              onClick={() => { navigator.vibrate?.(10); setMenuOpen(prev => !prev) }}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg
                         hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer text-[var(--color-heading)]"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <PixelIcon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 pt-2 flex flex-col gap-1" style={{ maxWidth: 'calc(var(--container) + 48px)', margin: '0 auto' }}>
            {NAV_LINKS.map(link => (
              <TransitionLink
                key={link.to}
                to={link.to}
                onClick={() => navigator.vibrate?.(10)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-[14px] font-medium transition-colors min-h-[44px] ${
                  location.pathname === link.to
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
                    : 'text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)]'
                }`}
              >
                <PixelIcon name={link.icon} size={18} />
                {link.label}
              </TransitionLink>
            ))}

            {/* Divider */}
            <div className="h-px bg-[var(--color-border)] my-2" />

            {showCreateStartup && (
              <TransitionLink
                to="/create"
                onClick={() => navigator.vibrate?.(10)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-[14px] font-medium
                           text-[#0d2000] hover:bg-[var(--color-accent)]/10 transition-colors"
              >
                <PixelIcon name="zap" size={14} />
                Create Startup
              </TransitionLink>
            )}

            {authenticated ? (
              <>
                <TransitionLink
                  to="/dashboard"
                  onClick={() => navigator.vibrate?.(10)}
                  className="flex items-center justify-center h-11 rounded-full text-[14px] font-medium
                             bg-[var(--color-heading)] text-white
                             hover:bg-[#343433] transition-colors mt-1"
                >
                  Dashboard
                </TransitionLink>
                <button type="button"
                  onClick={() => { navigator.vibrate?.(10); logout(); setMenuOpen(false) }}
                  className="flex items-center justify-center h-11 rounded-full text-[14px] font-medium
                             text-[var(--color-muted)] hover:text-[var(--color-heading)]
                             border border-[var(--color-border)] transition-colors cursor-pointer mt-1"
                >
                  Log out
                </button>
              </>
            ) : (
              <TransitionLink
                to="/dashboard"
                onClick={() => navigator.vibrate?.(10)}
                className="flex items-center justify-center gap-2 h-11 rounded-full text-[14px] font-medium
                           bg-[var(--color-heading)] text-white
                           hover:bg-[#343433] transition-colors mt-1"
              >
                <PixelIcon name="wallet" size={14} />
                Connect
              </TransitionLink>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
