import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { useAuth } from '../hooks/useAuth'
import { useStartupData } from '../hooks/useStartupData'

export default function StartupSettings() {
  const { slug } = useParams()
  const { logout, user } = useAuth()
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const { data: startupData, startup: currentStartup, loading } = useStartupData(slug)
  const myStartup = startupData?.startup ?? {}

  useEffect(() => {
    if (currentStartup?.name) {
      document.title = `Settings — ${currentStartup.name} — AgentValley`
    }
  }, [currentStartup?.name])

  // Panel entry animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from('.dash-panel', { opacity: 0, y: 20, stagger: 0.06, duration: 0.35, delay: 0.15, clearProps: 'all' })
  }, [])

  // Outside click for user menu
  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenu])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          }}
        />
        <div className="max-w-[540px] mx-auto py-3 flex items-center relative">
          <TransitionLink
            to={`/dashboard/${slug}`}
            className="h-8 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                       flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)]
                       hover:border-[var(--color-muted)] transition-all"
          >
            <PixelIcon name="arrow-left" size={13} />
            Workshop
          </TransitionLink>

          <div className="flex-1" />

          {/* User avatar */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenu(prev => !prev)}
              className="w-8 h-8 rounded-full bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Account menu"
            >
              {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : 'ME'}
            </button>
            {userMenu && (
              <div className="animate-menu-in absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                {user?.wallet?.address && (
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </div>
                  </div>
                )}
                <button type="button" onClick={() => setUserMenu(false)} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                  <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                  Copy Address
                </button>
                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                  <button type="button" onClick={() => { setUserMenu(false); logout() }} className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                    <PixelIcon name="power" size={14} />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-[540px] mx-auto">
          {currentStartup && (
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                style={{ background: currentStartup.color }}
              >
                {currentStartup.initials}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-semibold text-[var(--color-heading)]">{currentStartup.name}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    {myStartup.status || 'Incubating'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <h1 className="text-[24px] font-bold text-[var(--color-heading)] mt-4" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 pt-4 pb-24">
        <div className="max-w-[540px] mx-auto">

          {/* Settings shortcuts */}
          <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">General</span>
            <div className="flex flex-col gap-2">
              {[
                { icon: 'edit-box', title: 'Edit Profile', desc: 'Name, description, logo, and links' },
                { icon: 'lock', title: 'Access & Permissions', desc: 'API keys, agent permissions, visibility' },
                { icon: 'notification', title: 'Notifications', desc: 'Agent updates, task alerts, token events' },
              ].map(item => (
                <button
                  key={item.title}
                  type="button"
                  className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
                >
                  <PixelIcon name={item.icon} size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">{item.title}</div>
                    <div className="text-[12px] text-[var(--color-muted)]">{item.desc}</div>
                  </div>
                  <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)]" />
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-red-500/20 mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-red-400 mb-4 block">Danger Zone</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-heading)]">Pause Startup</div>
                  <div className="text-[12px] text-[var(--color-muted)]">Temporarily stop all agent activity</div>
                </div>
                <button type="button" className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5">
                  Pause
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-heading)]">Delete Startup</div>
                  <div className="text-[12px] text-[var(--color-muted)]">Permanently remove this startup and all data</div>
                </div>
                <button type="button" className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5">
                  Delete
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
