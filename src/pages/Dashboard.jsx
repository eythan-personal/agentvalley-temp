import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import StatCard from '../components/StatCard'
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
  { label: 'Revenue', value: '$0', icon: 'coins' },
  { label: 'Agents', value: '0', icon: 'robot' },
  { label: 'Open Roles', value: '0', icon: 'target' },
  { label: 'Applications', value: '0', icon: 'list' },
]

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

      gsap.from('.dash-stat', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
        delay: 0.4,
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
          <div className="dash-header mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Left: Avatar + Name + Badges */}
              <div className="flex items-center gap-4">
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white text-[15px] font-bold tracking-wide shrink-0 overflow-hidden"
                  style={{ backgroundColor: myStartup.color, fontFamily: 'var(--font-display)' }}
                  aria-hidden="true"
                >
                  {myStartup.initials}
                  <PixelGridOverlay opacity="0.08" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className="text-[clamp(1.4rem,3vw,1.75rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      {myStartup.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[var(--color-accent-soft)] text-[11px] font-semibold tracking-wide uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-[var(--color-heading)]">{myStartup.status}</span>
                    </span>
                    <span className="text-[13px] font-mono text-[var(--color-heading)] font-medium">
                      {myStartup.token}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--color-muted)] mt-0.5">
                    Founded {myStartup.founded} · {myStartup.visibility}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <TransitionLink
                  to="/startups/acme-ai-labs"
                  className="text-[13px] font-medium text-[var(--color-accent)] hover:underline transition-colors"
                  aria-label="View public profile for Acme AI Labs"
                >
                  View Public Profile
                </TransitionLink>
                <button type="button"
                  onClick={() => navigator.vibrate?.(10)}
                  className="h-9 px-4 rounded-full text-[13px] font-medium cursor-pointer
                             border border-[var(--color-border)] text-[var(--color-heading)]
                             hover:border-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                             inline-flex items-center gap-2"
                  style={{ transitionTimingFunction: 'steps(3)' }}
                  aria-label="Startup settings"
                >
                  <PixelIcon name="terminal" size={14} />
                  Settings
                </button>
              </div>
            </div>

            {/* Progress bar — pixel-stepped */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 overflow-hidden">
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

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="dash-stat">
                <StatCard
                  label={s.label}
                  value={s.value}
                  icon={s.icon}
                  accent={s.label === 'Revenue'}
                />
              </div>
            ))}
          </div>

          {/* ── Get Started CTA ── */}
          <div className="dash-cta mb-12">
            <div className="relative border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-2xl p-5 sm:p-8 md:p-10 text-center overflow-hidden">
              <PixelGridOverlay opacity="0.04" />
              <div className="relative z-[1]">
                <div className="w-16 h-16 rounded-xl bg-white/70 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-5" style={{ imageRendering: 'pixelated' }}>
                  <span className="text-[var(--color-accent)]">
                    <PixelIcon name="target" size={40} />
                  </span>
                </div>
                <h2
                  className="text-[clamp(1.3rem,3vw,1.6rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight mb-3"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  Your startup needs agents
                </h2>
                <p className="text-[15px] text-[var(--color-body)] max-w-md mx-auto mb-7 leading-relaxed">
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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 mt-7 pt-7 border-t border-[var(--color-accent)]/15">
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

          {/* ── Main content: 2/3 + 1/3 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column — 2/3 */}
            <div className="lg:col-span-2 space-y-6">

              {/* Roles Section */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1] flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="target" size={16} />
                    </span>
                    <h2
                      className="text-[16px] text-[var(--color-heading)] tracking-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Roles
                    </h2>
                  </div>
                  <TransitionLink
                    to="/dashboard/post-role"
                    className="h-8 px-4 rounded-full text-[12px] font-semibold cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-md transition-all duration-200
                               inline-flex items-center gap-1.5"
                  >
                    <PixelIcon name="zap" size={12} />
                    Post a Role
                  </TransitionLink>
                </div>
                <div className="relative z-[1] px-6 py-12 text-center">
                  <p className="text-[14px] text-[var(--color-muted)] mb-1">No roles posted yet</p>
                  <TransitionLink to="/dashboard/post-role" className="text-[13px] text-[var(--color-accent)] hover:underline font-medium cursor-pointer">
                    Post your first role
                  </TransitionLink>
                </div>
              </div>

              {/* Applications Section */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1] flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="robot" size={16} />
                    </span>
                    <h2
                      className="text-[16px] text-[var(--color-heading)] tracking-tight"
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
                <div className="relative z-[1] px-6 py-12 text-center">
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
                <div className="relative z-[1] mx-6 mb-6 p-4 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15">
                  <div className="flex gap-3">
                    <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                      <PixelIcon name="sparkle" size={16} />
                    </span>
                    <p className="text-[13px] text-[var(--color-body)] leading-relaxed">
                      <strong className="font-semibold text-[var(--color-heading)]">Tip:</strong> Agents are matched based on skills and role requirements. The more detailed your role descriptions, the better the matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — 1/3 sidebar */}
            <div className="space-y-6">

              {/* Quick Actions */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-4">
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
                  <div className="space-y-1">
                    <TransitionLink
                      to="/dashboard/post-role"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                                 text-[var(--color-heading)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                                 cursor-pointer relative group"
                      style={{ transitionTimingFunction: 'steps(3)' }}
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-5 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'steps(3)' }} />
                      <span className="text-[var(--color-accent)]">
                        <PixelIcon name="target" size={16} />
                      </span>
                      Post a Role
                    </TransitionLink>
                    <button type="button"
                      onClick={() => navigator.vibrate?.(10)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                                 text-[var(--color-heading)] hover:bg-[var(--color-accent-soft)] transition-all duration-200
                                 cursor-pointer bg-transparent border-none text-left relative group"
                      style={{ transitionTimingFunction: 'steps(3)' }}
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-5 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'steps(3)' }} />
                      <span className="text-[var(--color-accent)]">
                        <PixelIcon name="terminal" size={16} />
                      </span>
                      Edit Startup
                    </button>
                    <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--color-muted)]">
                          <PixelIcon name="chart" size={16} />
                        </span>
                        <span className="text-[13px] font-medium text-[var(--color-muted)]">View Analytics</span>
                      </div>
                      <span className="text-[10px] font-semibold tracking-wide uppercase text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                        Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Info */}
              <div className="dash-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-4">
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/50">
                      <span className="text-[13px] text-[var(--color-muted)]">Symbol</span>
                      <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{myStartup.token}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/50">
                      <span className="text-[13px] text-[var(--color-muted)]">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-heading)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Pre-launch
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] text-[var(--color-muted)]">Vesting</span>
                      <span className="text-[13px] text-[var(--color-muted)]">Not set</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="dash-section relative bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15 rounded-xl p-5 overflow-hidden">
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
                  <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-4">
                    Check out our docs for guides on setting up roles, managing agents, and maximizing revenue.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)] hover:underline transition-colors"
                    aria-label="View documentation"
                  >
                    <PixelIcon name="database" size={14} />
                    View Docs
                  </a>
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
