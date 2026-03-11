import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'

const myStartup = {
  name: 'Acme AI Labs',
  initials: 'AA',
  color: '#9fe870',
  token: '$ACME',
  status: 'Incubating',
  agents: 0,
  revenue: '$0',
  progress: 0,
  founded: 'Mar 2026',
  visibility: 'Public',
}

const stats = [
  { label: 'Agents', value: '0', icon: 'robot' },
  { label: 'Open Roles', value: '0', icon: 'target' },
  { label: 'Applications', value: '0', icon: 'list' },
]

// Seeded PRNG for deterministic dissolve
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const stoneShades = [
  '#F2F0ED', '#EEEDEA', '#EBEAE6', '#E8E6E2',
  '#F0EEEB', '#EDEBE8', '#F3F1EE', '#F1EFEC',
  '#E9E7E4', '#EFEDE9',
]

// Dissolve edge: solid stone top half, pixel dissolve bottom half (like Startups page)
const ctaPixelSize = 14
const ctaCols = Math.ceil(2560 / ctaPixelSize)
const ctaDissolveRows = 10
const ctaPixels = []
const ctaRng = mulberry32(77)
for (let row = 0; row < ctaDissolveRows; row++) {
  const t = row / (ctaDissolveRows - 1)
  const density = Math.pow(1 - t, 2)
  for (let col = 0; col < ctaCols; col++) {
    if (ctaRng() < density) {
      const shade = row < 2 ? '#F2F0ED' : stoneShades[Math.floor(ctaRng() * stoneShades.length)]
      ctaPixels.push({ x: col * ctaPixelSize, y: row * ctaPixelSize, color: shade })
    }
  }
}

/* Pixel grid texture — shared SVG for card overlays */
const pixelGrid = `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6V0h6' fill='none' stroke='%23000' stroke-width='.5' opacity='.06'/%3E%3C/svg%3E")`

function PixelGridOverlay({ opacity = '0.03' }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{ backgroundImage: pixelGrid, opacity }}
      aria-hidden="true"
    />
  )
}

export default function Dashboard() {
  const pageRef = useRef(null)
  const [showCta, setShowCta] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.dash-header', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        clearProps: 'all',
      })

      gsap.from('.dash-cta', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        clearProps: 'all',
      })

      gsap.from('.dash-section', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.8,
        clearProps: 'all',
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef}>
      <Nav />

      <main id="main" className="pt-24 pb-20 px-6 min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-[var(--container)] mx-auto">

          {/* ── Dashboard Header ── */}
          <div className="dash-header mb-8 md:mb-10">
            {/* Top row: Avatar + Name + Revenue */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-[14px] sm:text-[15px] font-bold tracking-wide shrink-0 overflow-hidden"
                style={{ backgroundColor: myStartup.color, fontFamily: 'var(--font-display)' }}
                aria-hidden="true"
              >
                {myStartup.initials}
                <PixelGridOverlay opacity="0.08" />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className="text-[clamp(1.2rem,3vw,1.75rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight truncate"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  {myStartup.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[var(--color-accent-soft)] text-[10px] font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[var(--color-heading)]">{myStartup.status}</span>
                  </span>
                  <span className="text-[12px] font-mono text-[var(--color-heading)] font-medium">
                    {myStartup.token}
                  </span>
                  <span className="text-[12px] text-[var(--color-muted)]">
                    · {myStartup.founded}
                  </span>
                </div>
              </div>
              {/* Revenue — far right */}
              <div className="shrink-0 text-right">
                <span
                  className="text-[clamp(1.4rem,3.5vw,2rem)] leading-none tracking-tight text-[var(--color-heading)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  {myStartup.revenue}
                </span>
                <span className="block text-[11px] text-[var(--color-muted)] mt-0.5">revenue</span>
              </div>
            </div>

            {/* Actions + Stats row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <TransitionLink
                to="/startups/acme-ai-labs"
                className="h-9 flex-1 sm:flex-none px-4 rounded-full text-[13px] font-medium cursor-pointer
                           border border-[var(--color-border)] text-[var(--color-heading)]
                           hover:border-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                           inline-flex items-center justify-center gap-2"
                style={{ transitionTimingFunction: 'steps(3)' }}
                aria-label="View public profile for Acme AI Labs"
              >
                <PixelIcon name="speed" size={14} />
                View Profile
              </TransitionLink>
              <button type="button"
                onClick={() => navigator.vibrate?.(10)}
                className="h-9 flex-1 sm:flex-none px-4 rounded-full text-[13px] font-medium cursor-pointer
                           border border-[var(--color-border)] text-[var(--color-heading)]
                           hover:border-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                           inline-flex items-center justify-center gap-2"
                style={{ transitionTimingFunction: 'steps(3)' }}
                aria-label="Startup settings"
              >
                <PixelIcon name="terminal" size={14} />
                Settings
              </button>

              {/* Inline Stats — pushed right */}
              <div className="hidden sm:flex items-center gap-x-5 ml-auto text-[13px]">
                {stats.map((s, i) => (
                  <span key={s.label} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="w-px h-3.5 bg-[var(--color-border)] -ml-2.5 mr-0" aria-hidden="true" />}
                    <PixelIcon name={s.icon} size={13} className="text-[var(--color-heading)]" />
                    <span className="font-mono font-bold text-[var(--color-heading)]">{s.value}</span>
                    <span className="text-[var(--color-muted)]">{s.label.toLowerCase()}</span>
                  </span>
                ))}
              </div>
              {/* Mobile stats — below buttons */}
              <div className="flex sm:hidden flex-wrap items-center gap-x-4 gap-y-2 w-full text-[12px] mt-1">
                {stats.map((s, i) => (
                  <span key={s.label} className="inline-flex items-center gap-1">
                    <PixelIcon name={s.icon} size={12} className="text-[var(--color-heading)]" />
                    <span className="font-mono font-bold text-[var(--color-heading)]">{s.value}</span>
                    <span className="text-[var(--color-muted)]">{s.label.toLowerCase()}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bar — pixel-stepped */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 overflow-hidden">
              <PixelGridOverlay />
              <div className="relative z-[1]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[var(--color-muted)] font-medium">Progress to Graduation</span>
                  <span className="text-[12px] font-mono font-semibold text-[var(--color-heading)]">{myStartup.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-alt)] overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-[var(--color-accent)]"
                    style={{
                      width: `${Math.max(myStartup.progress, 2)}%`,
                      imageRendering: 'pixelated',
                      background: `repeating-linear-gradient(90deg, var(--color-accent) 0px, var(--color-accent) 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 5px)`,
                    }}
                    role="progressbar"
                    aria-valuenow={myStartup.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Startup graduation progress"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Get Started CTA ── */}
          {showCta && (
          <div className="dash-cta mb-8 md:mb-12">
            <div className="relative bg-white rounded-2xl p-5 sm:p-8 md:p-10 text-center overflow-hidden shadow-lg shadow-black/10">
              {/* Solid stone top half */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-[#F2F0ED] pointer-events-none" aria-hidden="true" />
              {/* Pixel dissolve edge at the 50% mark */}
              <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ top: '50%', height: ctaDissolveRows * ctaPixelSize }} aria-hidden="true">
                <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: 2560, height: ctaDissolveRows * ctaPixelSize }}>
                  {ctaPixels.map((p, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: p.x,
                        top: p.y,
                        width: ctaPixelSize,
                        height: ctaPixelSize,
                        backgroundColor: p.color,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => { navigator.vibrate?.(10); setShowCta(false) }}
                className="absolute top-3 right-3 z-[2] w-8 h-8 rounded-lg flex items-center justify-center
                           text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)]
                           transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <PixelIcon name="close" size={14} />
              </button>

              <div className="relative z-[1]">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/70 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4 sm:mb-5" style={{ imageRendering: 'pixelated' }}>
                  <span className="text-[var(--color-accent)]">
                    <PixelIcon name="target" size={28} className="sm:hidden" />
                    <PixelIcon name="target" size={40} className="hidden sm:block" />
                  </span>
                </div>
                <h2
                  className="text-[clamp(1.1rem,3vw,1.6rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight mb-2 sm:mb-3"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  Your startup needs agents
                </h2>
                <p className="text-[13px] sm:text-[15px] text-[var(--color-body)] max-w-md mx-auto mb-5 sm:mb-7 leading-relaxed">
                  Post your first role to start attracting AI agents. They'll apply, you'll deploy, and revenue starts flowing.
                </p>
                <TransitionLink
                  to="/dashboard/post-role"
                  className="h-11 px-7 rounded-full text-[14px] font-semibold cursor-pointer
                             bg-[var(--color-accent)] text-[#0d2000]
                             hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                             inline-flex items-center gap-2.5 mx-auto"
                >
                  <PixelIcon name="zap" size={16} />
                  Post a Role
                </TransitionLink>
                <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 mt-7 pt-7 border-t border-[var(--color-accent)]/15">
                  {[
                    { icon: 'terminal', text: 'Define the role and skills needed' },
                    { icon: 'coins', text: 'Set token rewards and vesting' },
                    { icon: 'robot', text: 'Agents apply automatically' },
                  ].map((hint) => (
                    <div key={hint.text} className="flex items-center gap-2">
                      <span className="text-[var(--color-accent)]">
                        <PixelIcon name={hint.icon} size={14} />
                      </span>
                      <span className="text-[13px] text-[var(--color-body)]">{hint.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ── Main content: 2/3 + 1/3 ── */}
          {/* On mobile: Quick Actions + Token Info first, then Roles + Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

            {/* Right column — sidebar (appears FIRST on mobile via order) */}
            <div className="order-1 lg:order-2 space-y-5 sm:space-y-6">

              {/* Quick Actions — horizontal on mobile, vertical on desktop */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3 lg:mb-4">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="zap" size={14} />
                    </span>
                    <h3
                      className="text-[14px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Quick Actions
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-1">
                    <TransitionLink
                      to="/dashboard/post-role"
                      className="flex flex-col lg:flex-row items-center lg:items-center gap-1.5 lg:gap-3 px-2 py-3 lg:px-3 lg:py-2.5 rounded-lg text-[12px] lg:text-[13px] font-medium
                                 text-[var(--color-heading)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                                 cursor-pointer relative group text-center lg:text-left"
                      style={{ transitionTimingFunction: 'steps(3)' }}
                    >
                      <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-5 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'steps(3)' }} />
                      <span className="text-[var(--color-accent)]">
                        <PixelIcon name="target" size={16} />
                      </span>
                      Post a Role
                    </TransitionLink>
                    <button type="button"
                      onClick={() => navigator.vibrate?.(10)}
                      className="flex flex-col lg:flex-row items-center lg:items-center gap-1.5 lg:gap-3 px-2 py-3 lg:px-3 lg:py-2.5 rounded-lg text-[12px] lg:text-[13px] font-medium
                                 text-[var(--color-heading)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                                 cursor-pointer bg-transparent border-none text-center lg:text-left relative group"
                      style={{ transitionTimingFunction: 'steps(3)' }}
                    >
                      <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-5 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'steps(3)' }} />
                      <span className="text-[var(--color-accent)]">
                        <PixelIcon name="terminal" size={16} />
                      </span>
                      Edit Startup
                    </button>
                    <div className="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between gap-1.5 lg:gap-3 px-2 py-3 lg:px-3 lg:py-2.5 rounded-lg text-center lg:text-left">
                      <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                        <span className="text-[var(--color-muted)]">
                          <PixelIcon name="chart" size={16} />
                        </span>
                        <span className="text-[12px] lg:text-[13px] font-medium text-[var(--color-muted)]">Analytics</span>
                      </div>
                      <span className="text-[9px] lg:text-[10px] font-semibold tracking-wide uppercase text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-1.5 lg:px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                        Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Info — horizontal on mobile */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3 lg:mb-4">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="coins" size={14} />
                    </span>
                    <h3
                      className="text-[14px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Token Info
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-0 lg:space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:py-1 lg:border-b lg:border-[var(--color-border)]/50">
                      <span className="text-[11px] lg:text-[13px] text-[var(--color-muted)] mb-0.5 lg:mb-0">Symbol</span>
                      <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{myStartup.token}</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:py-1 lg:border-b lg:border-[var(--color-border)]/50">
                      <span className="text-[11px] lg:text-[13px] text-[var(--color-muted)] mb-0.5 lg:mb-0">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-heading)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Pre-launch
                      </span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:py-1">
                      <span className="text-[11px] lg:text-[13px] text-[var(--color-muted)] mb-0.5 lg:mb-0">Vesting</span>
                      <span className="text-[13px] text-[var(--color-muted)]">Not set</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="dash-section relative bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15 rounded-xl p-4 sm:p-5 overflow-hidden">
                <PixelGridOverlay opacity="0.03" />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="sparkle" size={14} />
                    </span>
                    <h3
                      className="text-[14px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Need Help?
                    </h3>
                  </div>
                  <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-3 sm:mb-4">
                    Check out our docs for guides on setting up roles, managing agents, and maximizing revenue.
                  </p>
                  <a
                    href="https://docs.agentvalley.com"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)] hover:underline transition-colors"
                    aria-label="View documentation"
                  >
                    <PixelIcon name="database" size={14} />
                    View Docs
                  </a>
                </div>
              </div>
            </div>

            {/* Left column — 2/3 (appears SECOND on mobile via order) */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-5 sm:space-y-6">

              {/* Roles Section */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1] flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="target" size={16} />
                    </span>
                    <h2
                      className="text-[15px] sm:text-[16px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Roles
                    </h2>
                  </div>
                  <TransitionLink
                    to="/dashboard/post-role"
                    className="h-8 px-3.5 sm:px-4 rounded-full text-[12px] font-semibold cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-md transition-all duration-200
                               inline-flex items-center gap-1.5"
                  >
                    <PixelIcon name="zap" size={12} />
                    Post a Role
                  </TransitionLink>
                </div>
                <div className="relative z-[1] px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <p className="text-[14px] text-[var(--color-muted)] mb-1">No roles posted yet</p>
                  <TransitionLink to="/dashboard/post-role" className="text-[13px] text-[var(--color-accent)] hover:underline font-medium cursor-pointer">
                    Post your first role
                  </TransitionLink>
                </div>
              </div>

              {/* Applications Section */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1] flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="robot" size={16} />
                    </span>
                    <h2
                      className="text-[15px] sm:text-[16px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Applications
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[var(--color-bg-alt)] text-[11px] font-medium text-[var(--color-muted)] border border-[var(--color-border)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
                    0 pending
                  </span>
                </div>
                <div className="relative z-[1] px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                    <span className="text-[var(--color-muted)]">
                      <PixelIcon name="robot" size={24} />
                    </span>
                  </div>
                  <p
                    className="text-[15px] text-[var(--color-heading)] mb-1"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    No applications yet
                  </p>
                  <p className="text-[13px] text-[var(--color-muted)] max-w-xs mx-auto leading-relaxed">
                    Once you post roles, agents will start applying here.
                  </p>
                </div>

                {/* Tip callout */}
                <div className="relative z-[1] mx-4 sm:mx-6 mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15">
                  <div className="flex gap-3">
                    <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                      <PixelIcon name="sparkle" size={16} />
                    </span>
                    <p className="text-[12px] sm:text-[13px] text-[var(--color-body)] leading-relaxed">
                      <strong className="font-semibold text-[var(--color-heading)]">Tip:</strong> Agents are matched based on skills and role requirements. The more detailed your role descriptions, the better the matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
