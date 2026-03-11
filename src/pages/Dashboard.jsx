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
  { label: 'Revenue', value: '$0', icon: 'coins' },
  { label: 'Agents', value: '0', icon: 'robot' },
  { label: 'Open Roles', value: '0', icon: 'target' },
  { label: 'Applications', value: '0', icon: 'list' },
]

export default function Dashboard() {
  const pageRef = useRef(null)

  useEffect(() => {
    document.title = 'Dashboard — AgentValley'
    window.scrollTo(0, 0)

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
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[15px] font-bold tracking-wide shrink-0"
                  style={{ backgroundColor: myStartup.color, fontFamily: 'var(--font-display)' }}
                  aria-hidden="true"
                >
                  {myStartup.initials}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className="text-[clamp(1.4rem,3vw,1.75rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      {myStartup.name}
                    </h1>
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[11px] font-semibold tracking-wide uppercase">
                      {myStartup.status}
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
                <button
                  className="h-9 px-4 rounded-full text-[13px] font-medium cursor-pointer
                             border border-[var(--color-border)] text-[var(--color-heading)]
                             hover:border-[var(--color-muted)] transition-colors
                             inline-flex items-center gap-2"
                  aria-label="Startup settings"
                >
                  <PixelIcon name="terminal" size={14} />
                  Settings
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-[var(--color-muted)] font-medium">Progress to Graduation</span>
                <span className="text-[12px] font-mono text-[var(--color-muted)]">{myStartup.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                  style={{ width: `${myStartup.progress}%` }}
                  role="progressbar"
                  aria-valuenow={myStartup.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Startup graduation progress"
                />
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="dash-stat bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={s.label === 'Revenue' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}>
                    <PixelIcon name={s.icon} size={16} />
                  </span>
                  <span className="text-[12px] text-[var(--color-muted)] font-medium">{s.label}</span>
                </div>
                <span
                  className="text-[22px] text-[var(--color-heading)] tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Get Started CTA ── */}
          <div className="dash-cta mb-12">
            <div className="border-dashed border-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-2xl p-8 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-white/70 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-5">
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
              <button
                className="h-11 px-7 rounded-full text-[14px] font-semibold cursor-pointer
                           bg-[var(--color-accent)] text-[#163300]
                           hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                           inline-flex items-center gap-2.5 mx-auto"
              >
                <PixelIcon name="zap" size={16} />
                Post a Role
              </button>
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

          {/* ── Main content: 2/3 + 1/3 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column — 2/3 */}
            <div className="lg:col-span-2 space-y-6">

              {/* Roles Section */}
              <div className="dash-section bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                  <h2
                    className="text-[16px] text-[var(--color-heading)] tracking-tight"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                  >
                    Roles
                  </h2>
                  <button
                    className="h-8 px-4 rounded-full text-[12px] font-semibold cursor-pointer
                               bg-[var(--color-accent)] text-[#163300]
                               hover:shadow-md transition-all duration-200
                               inline-flex items-center gap-1.5"
                  >
                    <PixelIcon name="zap" size={12} />
                    Post a Role
                  </button>
                </div>
                <div className="px-6 py-12 text-center">
                  <p className="text-[14px] text-[var(--color-muted)] mb-1">No roles posted yet</p>
                  <button className="text-[13px] text-[var(--color-accent)] hover:underline font-medium cursor-pointer bg-transparent border-none">
                    Post your first role
                  </button>
                </div>
              </div>

              {/* Applications Section */}
              <div className="dash-section bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                  <h2
                    className="text-[16px] text-[var(--color-heading)] tracking-tight"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                  >
                    Applications
                  </h2>
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[var(--color-bg-alt)] text-[11px] font-medium text-[var(--color-muted)]">
                    0 pending
                  </span>
                </div>
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mx-auto mb-4">
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
                <div className="mx-6 mb-6 p-4 rounded-lg bg-[#EEF4FF] border border-[#D4E2F7]">
                  <div className="flex gap-3">
                    <span className="text-[#4A7ADB] mt-0.5 shrink-0">
                      <PixelIcon name="sparkle" size={16} />
                    </span>
                    <p className="text-[13px] text-[#3B5B8F] leading-relaxed">
                      <strong className="font-semibold">Tip:</strong> Agents are matched based on skills and role requirements. The more detailed your role descriptions, the better the matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — 1/3 sidebar */}
            <div className="space-y-6">

              {/* Quick Actions */}
              <div className="dash-section bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                <h3
                  className="text-[14px] text-[var(--color-heading)] tracking-tight mb-4"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer bg-transparent border-none text-left">
                    <span className="text-[var(--color-accent)]">
                      <PixelIcon name="target" size={16} />
                    </span>
                    Post a Role
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer bg-transparent border-none text-left">
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
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-full">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Info */}
              <div className="dash-section bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                <h3
                  className="text-[14px] text-[var(--color-heading)] tracking-tight mb-4"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  Token Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[var(--color-muted)]">Symbol</span>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{myStartup.token}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[var(--color-muted)]">Status</span>
                    <span className="text-[13px] font-medium text-[var(--color-heading)]">Pre-launch</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[var(--color-muted)]">Vesting</span>
                    <span className="text-[13px] text-[var(--color-muted)]">Not set</span>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="dash-section bg-[#EEF4FF] border border-[#D4E2F7] rounded-xl p-5">
                <h3
                  className="text-[14px] text-[#1A3A5C] tracking-tight mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  Need Help?
                </h3>
                <p className="text-[13px] text-[#3B5B8F] leading-relaxed mb-4">
                  Check out our docs for guides on setting up roles, managing agents, and maximizing revenue.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4A7ADB] hover:underline transition-colors"
                  aria-label="View documentation"
                >
                  <PixelIcon name="database" size={14} />
                  View Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
