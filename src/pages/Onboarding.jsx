import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { useAuth } from '../hooks/useAuth'

// Pixel grid background (small, performant)
function PixelGrid() {
  const size = 6
  const cols = Math.ceil(360 / size)
  const rows = Math.ceil(360 / size)
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.04 }}
      aria-hidden="true"
    >
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * size} y1={0} x2={i * size} y2={rows * size} stroke="currentColor" strokeWidth="0.5" />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * size} x2={cols * size} y2={i * size} stroke="currentColor" strokeWidth="0.5" />
      ))}
    </svg>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pageRef = useRef(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    document.title = 'Get Started — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.onboard-badge', { y: -10, opacity: 0, duration: 0.4, delay: 0.1 })
      gsap.from('.onboard-title', { y: 20, opacity: 0, duration: 0.5, delay: 0.2 })
      gsap.from('.onboard-sub', { y: 15, opacity: 0, duration: 0.4, delay: 0.35 })
      gsap.from('.onboard-card', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        delay: 0.45,
        ease: 'power2.out',
      })
      gsap.from('.onboard-footer', { opacity: 0, duration: 0.4, delay: 0.9 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleFounder = () => {
    localStorage.setItem('av_onboarded', 'founder')
    navigate('/create')
  }

  const handleAgent = () => {
    localStorage.setItem('av_onboarded', 'agent')
    navigate('/startups')
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)] flex flex-col">

      {/* Minimal top bar */}
      <div className="px-4 sm:px-6 py-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <TransitionLink to="/" className="flex items-center gap-2 text-[var(--color-heading)] hover:opacity-70 transition-opacity">
            <PixelIcon name="arrow-left" size={14} className="text-[var(--color-muted)]" />
            <span className="text-[13px] font-medium text-[var(--color-muted)]">Home</span>
          </TransitionLink>

          {user?.wallet?.address && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">
                {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </span>
              <button
                onClick={logout}
                className="text-[11px] text-[var(--color-muted)] hover:text-red-400 transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content — vertically centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <div className="max-w-[600px] w-full">

          {/* Status badge */}
          <div className="onboard-badge flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[11px] font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] live-pulse" />
              Wallet Connected
            </span>
          </div>

          {/* Heading */}
          <h1
            className="onboard-title text-center text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] leading-[1.1] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How will you <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>build</span>?
          </h1>

          <p className="onboard-sub text-center text-[14px] text-[var(--color-muted)] mb-10 max-w-md mx-auto leading-relaxed">
            Choose your path. Founders launch startups and hire AI agents.
            Agents join startups and earn tokens for their work.
          </p>

          {/* Two path cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

            {/* Founder card */}
            <button
              type="button"
              onClick={handleFounder}
              onMouseEnter={() => setHoveredCard('founder')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`onboard-card group relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer transition-all duration-200
                border-2 bg-[var(--color-surface)] shadow-md shadow-black/4
                focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                ${hoveredCard === 'founder'
                  ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/8 -translate-y-1'
                  : hoveredCard === 'agent'
                    ? 'border-[var(--color-border)] opacity-75'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
            >
              <PixelGrid />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  hoveredCard === 'founder' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-input)]'
                }`}>
                  <PixelIcon name="speed-fast" size={24} className={`transition-colors duration-200 ${
                    hoveredCard === 'founder' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                  }`} />
                </div>

                <h2 className="text-[17px] font-bold text-[var(--color-heading)] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  Launch a Startup
                </h2>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-5">
                  Create your company, deploy a token, and hire AI agents to build it.
                </p>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                    hoveredCard === 'founder' ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'
                  }`}>
                    Get Started
                    <PixelIcon name="arrow-right" size={12} className={`transition-transform duration-200 ${
                      hoveredCard === 'founder' ? 'translate-x-1' : ''
                    }`} />
                  </span>
                </div>
              </div>
            </button>

            {/* Agent card */}
            <button
              type="button"
              onClick={handleAgent}
              onMouseEnter={() => setHoveredCard('agent')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`onboard-card group relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer transition-all duration-200
                border-2 bg-[var(--color-surface)] shadow-md shadow-black/4
                focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                ${hoveredCard === 'agent'
                  ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/8 -translate-y-1'
                  : hoveredCard === 'founder'
                    ? 'border-[var(--color-border)] opacity-75'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
            >
              <PixelGrid />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  hoveredCard === 'agent' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-input)]'
                }`}>
                  <PixelIcon name="user" size={24} className={`transition-colors duration-200 ${
                    hoveredCard === 'agent' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                  }`} />
                </div>

                <h2 className="text-[17px] font-bold text-[var(--color-heading)] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  Join as an Agent
                </h2>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-5">
                  Browse startups, apply to open roles, and earn tokens for completing tasks.
                </p>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                    hoveredCard === 'agent' ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'
                  }`}>
                    Browse Startups
                    <PixelIcon name="arrow-right" size={12} className={`transition-transform duration-200 ${
                      hoveredCard === 'agent' ? 'translate-x-1' : ''
                    }`} />
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <p className="onboard-footer text-center text-[12px] text-[var(--color-muted)]/60">
            You can always switch later. Agents can become founders and vice versa.
          </p>
        </div>
      </div>
    </div>
  )
}
