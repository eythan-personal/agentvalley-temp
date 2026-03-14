import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { useAuth } from '../hooks/useAuth'
import { myStartups } from '../data/dashboard'
import logoSvg from '../assets/logo_av.svg'

export default function MyStartups() {
  const { logout, user } = useAuth()
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    document.title = 'My Startups — AgentValley'
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from('.startup-card', { opacity: 0, y: 24, stagger: 0.08, duration: 0.4, delay: 0.15, clearProps: 'all' })
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenu])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">

      {/* ── Sticky top nav bar ── */}
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
        <div className="max-w-[540px] mx-auto py-4 flex items-center relative">
          <TransitionLink
            to="/"
            className="w-8 h-8 shrink-0 flex items-center justify-center"
            aria-label="AgentValley home"
          >
            <img src={logoSvg} alt="AgentValley" width={28} height={28} />
          </TransitionLink>

          <span className="ml-4 text-[14px] font-semibold text-[var(--color-heading)]">Startups</span>

          <div className="flex-1" />

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
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                  {user?.wallet?.address && (
                    <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                      <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                        {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setUserMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                    Copy Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="settings" size={14} className="text-[var(--color-muted)]" />
                    Account Settings
                  </button>
                  <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenu(false); logout() }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5"
                    >
                      <PixelIcon name="power" size={14} />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <main className="pt-4 pb-24 px-4 sm:px-6">
        <div className="max-w-[540px] mx-auto">

          {/* Startup cards */}
          <div className="flex flex-col gap-5 mb-6">
            {myStartups.map(startup => {
              const isGraduated = startup.status === 'Graduated'
              return (
                <TransitionLink
                  key={startup.slug}
                  to={`/dashboard/${startup.slug}`}
                  className="startup-card card-alive block rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden
                    hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer group"
                >
                  {/* Banner with pixel grid */}
                  <div className="relative h-20 overflow-hidden" style={{ background: startup.color }}>
                    <div
                      className="absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: '6px 6px',
                      }}
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm bg-white/20 text-white">
                        <span className={`w-1.5 h-1.5 rounded-full ${isGraduated ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                        {startup.status}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pt-4 pb-4">
                    {/* Name row with avatar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: startup.color }}
                      >
                        {startup.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] text-[var(--color-heading)] font-medium leading-none truncate">
                          {startup.name}
                        </h3>
                        <span className="flex items-center gap-2 text-[12px] text-[var(--color-muted)] leading-none mt-1">
                          <span className="flex items-center gap-1">
                            <PixelIcon name="robot" size={11} className="text-[var(--color-heading)]" />
                            {startup.agents}
                          </span>
                          <span>{startup.founded}</span>
                        </span>
                      </div>
                      <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-heading)] transition-colors" />
                    </div>

                    {/* Active objective line */}
                    {startup.activeObjective ? (
                      <p className="text-[12px] text-[var(--color-muted)] leading-[1.5] mb-4 line-clamp-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse inline-block mr-1.5 relative top-[-1px]" />
                        {startup.activeObjective}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[var(--color-accent)] leading-[1.5] mb-4 font-medium">
                        <PixelIcon name="check" size={11} className="inline mr-1 relative top-[-1px]" />
                        All objectives completed
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <TokenIcon token={startup.token} color={startup.tokenColor} size={22} />
                        <span className="text-[12px] font-mono font-semibold text-[var(--color-heading)]">{startup.token}</span>
                        {startup.price && (
                          <span className="text-[12px] font-mono text-[var(--color-muted)]">{startup.price}</span>
                        )}
                        {startup.change24h && (
                          <span className={`text-[12px] font-mono font-semibold ${startup.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>
                            {startup.change24h}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {startup.progress != null && startup.progress < 100 && (
                          <>
                            <div className="w-14 h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[var(--color-accent)]"
                                style={{ width: `${startup.progress}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-mono text-[var(--color-muted)]">{startup.progress}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TransitionLink>
              )
            })}
          </div>

          {/* Create new startup */}
          <TransitionLink
            to="/create"
            className="startup-card card-alive block rounded-2xl border-2 border-dashed border-[var(--color-border)] p-8 text-center
                       hover:border-[var(--color-heading)] transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-3">
              <PixelIcon name="plus" size={22} className="text-[var(--color-muted)]" />
            </div>
            <div className="text-[15px] font-semibold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Create a new startup
            </div>
            <p className="text-[13px] text-[var(--color-muted)] leading-relaxed max-w-[280px] mx-auto">
              Launch a new AI-powered startup and assign agents to start building.
            </p>
          </TransitionLink>

        </div>
      </main>
    </div>
  )
}
