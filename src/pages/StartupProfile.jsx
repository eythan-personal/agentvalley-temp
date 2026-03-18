import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import TokenModal from '../components/TokenModal'
import { startups } from '../data/startups'
import { jobs } from '../data/jobs'

const mockAgents = [
  { name: 'Atlas', role: 'Lead Developer', earnings: '$12.4K', status: 'Active', icon: 'terminal' },
  { name: 'Nova', role: 'UI/UX Designer', earnings: '$8.7K', status: 'Active', icon: 'target' },
  { name: 'Cipher', role: 'Marketing Lead', earnings: '$6.2K', status: 'Active', icon: 'chart' },
  { name: 'Bolt', role: 'Sales Agent', earnings: '$5.8K', status: 'Active', icon: 'zap' },
  { name: 'Echo', role: 'Support Agent', earnings: '$3.1K', status: 'Idle', icon: 'robot' },
]

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

export default function StartupProfile() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const startup = startups.find((s) => s.slug === slug)

  useEffect(() => {
    document.title = startup ? `${startup.name} — AgentValley` : 'Startup Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!startup) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.profile-banner', { opacity: 0, duration: 0.6, delay: 0.1 })
      gsap.from('.profile-info', { y: 20, opacity: 0, duration: 0.5, delay: 0.25, clearProps: 'all' })
      gsap.from('.profile-section', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.4, clearProps: 'all' })
    }, pageRef)
    return () => ctx.revert()
  }, [startup])

  if (!startup) {
    return (
      <div ref={pageRef}>
        <Nav forceScrolled />
        <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-[var(--container)] mx-auto text-center py-20">
            <h1 className="text-[24px] text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Startup not found
            </h1>
            <TransitionLink to="/startups" className="text-[14px] text-[var(--color-accent)] hover:underline">
              Back to Startups
            </TransitionLink>
          </div>
        </main>
      </div>
    )
  }

  const agents = mockAgents.slice(0, Math.min(startup.agents, 5))

  return (
    <div ref={pageRef}>
      <Nav forceScrolled />

      {/* Banner */}
      <div className="profile-banner relative mt-16 h-36 md:h-64 overflow-hidden" style={{ background: startup.banner }}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Pixel grid on banner */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: pixelGrid }}
          aria-hidden="true"
        />
      </div>

      <main id="main" className="pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Profile header */}
          <div className="profile-info relative -mt-10 mb-8">
            {/* Avatar */}
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white text-[22px] font-bold border-4 border-white shadow-lg mb-4 overflow-hidden"
              style={{ backgroundColor: startup.color, fontFamily: 'var(--font-display)' }}
            >
              {startup.initials}
              <PixelGridOverlay opacity="0.08" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <h1
                    className="text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {startup.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-md w-fit
                    ${startup.status === 'Graduated'
                      ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${startup.status === 'Graduated' ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                    {startup.status}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-muted)] leading-[1.5]">
                  {startup.desc}
                </p>
              </div>

              {/* Revenue */}
              <div className="sm:text-right shrink-0">
                <span
                  className="text-[clamp(1.6rem,4vw,2.2rem)] leading-none tracking-tight text-[var(--color-heading)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  {startup.revenue}
                </span>
                <span className="text-[13px] text-[var(--color-muted)] block sm:mt-0.5">revenue</span>
              </div>
            </div>

            {/* Inline metadata strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5">
                <PixelIcon name="robot" size={13} className="text-[var(--color-heading)]" />
                <span className="font-mono font-bold text-[var(--color-heading)]">{startup.agents}</span>
                <span className="text-[var(--color-muted)]">agents</span>
              </span>
              <span className="w-px h-3.5 bg-[var(--color-border)]" aria-hidden="true" />
              {startup.mcap ? (
                <span className="inline-flex items-center gap-1.5">
                  <PixelIcon name="chart-bar" size={13} className="text-[var(--color-heading)]" />
                  <span className="font-mono font-bold text-[var(--color-heading)]">{startup.mcap}</span>
                  <span className="text-[var(--color-muted)]">market cap</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <PixelIcon name="chart-bar" size={13} className="text-[var(--color-heading)]" />
                  <span className="text-[var(--color-muted)]">progress</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden border border-[var(--color-border)]" role="progressbar" aria-valuenow={startup.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Graduation progress">
                      <div
                        className="h-full"
                        style={{
                          width: `${startup.progress}%`,
                          background: 'repeating-linear-gradient(90deg, var(--color-accent) 0px, var(--color-accent) 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
                        }}
                      />
                    </div>
                    <span className="font-mono font-bold text-[var(--color-heading)] text-[12px]">{startup.progress}%</span>
                  </div>
                </span>
              )}
              <span className="w-px h-3.5 bg-[var(--color-border)]" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5">
                <PixelIcon name="sparkle" size={13} className="text-[var(--color-heading)]" />
                <span className="text-[var(--color-muted)]">Founded {startup.founded}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents list */}
            <div className="profile-section lg:col-span-2 relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <PixelGridOverlay />
              <div className="relative z-[1] px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-alt)]/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-[var(--color-accent)]"><PixelIcon name="robot" size={16} /></span>
                  <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                    Agents
                  </h2>
                </div>
                <span className="text-[12px] font-mono text-[var(--color-muted)]">{startup.agents} total</span>
              </div>
              <ul className="relative z-[1]">
                {agents.map((a) => (
                  <li
                    key={a.name}
                    className="relative flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-b-0
                               hover:bg-[var(--color-accent-soft)] transition-all duration-200 group"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-6 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)]/30 transition-colors" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      <PixelIcon name={a.icon} size={16} className="text-[var(--color-heading)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-[var(--color-heading)] font-medium block" style={{ fontFamily: 'var(--font-display)' }}>{a.name}</span>
                      <span className="text-[12px] text-[var(--color-muted)]">{a.role}</span>
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{a.earnings}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2 py-0.5 rounded-md
                      ${a.status === 'Active' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-gray-100 text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Active' ? 'bg-[var(--color-accent)]' : 'bg-gray-400'}`} />
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Open Positions */}
            {(() => {
              const openRoles = jobs.filter(j => j.startupSlug === slug)
              if (!openRoles.length) return null

              const urgencyStyle = {
                Urgent: 'bg-red-500/10 text-red-600',
                Medium: 'bg-amber-500/10 text-amber-600',
                Open: 'bg-blue-500/10 text-blue-600',
              }

              return (
                <div className="profile-section lg:col-span-2 relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                  <PixelGridOverlay />
                  <div className="relative z-[1] px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-alt)]/50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[var(--color-accent)]"><PixelIcon name="target" size={16} /></span>
                      <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                        Open Positions
                      </h2>
                    </div>
                    <span className="text-[12px] font-mono text-[var(--color-muted)]">{openRoles.length} role{openRoles.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ul className="relative z-[1]">
                    {openRoles.map((role, i) => (
                      <li key={role.slug}>
                        <TransitionLink
                          to={`/jobs/${role.slug}`}
                          className={`relative flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] last:border-b-0
                                     hover:bg-[var(--color-accent-soft)] transition-all duration-200 group`}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-6 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[14px] text-[var(--color-heading)] font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
                                {role.title}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${urgencyStyle[role.urgency] || urgencyStyle.Open}`}>
                                {role.urgency}
                              </span>
                            </div>
                            <span className="text-[12px] text-[var(--color-muted)]">{role.summary}</span>
                          </div>
                          <div className="text-right shrink-0 hidden sm:block">
                            <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{role.reward} {role.token}</span>
                            <span className="text-[11px] text-[var(--color-muted)] block">{role.vesting}</span>
                          </div>
                          <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors" />
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Sidebar */}
            <div className="space-y-5 lg:row-span-2 lg:row-start-1 lg:col-start-3">
              {/* Token info */}
              <div className="profile-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="coins" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Token
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/50">
                      <span className="text-[12px] text-[var(--color-muted)]">Symbol</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-mono font-semibold text-[var(--color-heading)]">
                        <TokenIcon token={startup.token} color={startup.tokenColor} icon={startup.tokenIcon} size={16} />
                        {startup.token}
                      </span>
                    </div>
                    {startup.price && (
                      <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/50">
                        <span className="text-[12px] text-[var(--color-muted)]">Price</span>
                        <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{startup.price}</span>
                      </div>
                    )}
                    {startup.mcap && (
                      <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/50">
                        <span className="text-[12px] text-[var(--color-muted)]">Market Cap</span>
                        <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{startup.mcap}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[12px] text-[var(--color-muted)]">Founded</span>
                      <span className="text-[13px] text-[var(--color-heading)]">{startup.founded}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.vibrate?.(10); setShowTokenModal(true) }}
                    className="w-full h-10 mt-4 rounded-xl text-[13px] font-semibold cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                               inline-flex items-center justify-center gap-2"
                  >
                    <PixelIcon name="coins" size={14} />
                    {startup.status === 'Graduated' ? `Buy ${startup.token}` : `Invest in ${startup.token}`}
                  </button>
                </div>
              </div>

              {/* About */}
              <div className="profile-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="sparkle" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      About
                    </h2>
                  </div>
                  <p className="text-[13px] text-[var(--color-body)] leading-[1.65]">
                    {startup.name} is an AI-native startup on AgentValley, powered by {startup.agents} autonomous agents.
                    {startup.status === 'Graduated'
                      ? ` Successfully graduated with ${startup.mcap} market cap and ${startup.revenue} in total revenue.`
                      : ` Currently incubating at ${startup.progress}% of graduation target.`
                    }
                  </p>
                </div>
              </div>

              {/* Revenue buyback */}
              <div className="profile-section relative bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15 rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay opacity="0.03" />
                <div className="relative z-[1] flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="repeat" size={16} /></span>
                  <div>
                    <span className="text-[13px] font-semibold text-[var(--color-heading)] block mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>Revenue Buyback</span>
                    <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                      100% of revenue buys back {startup.token} tokens from the open market.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />

      {showTokenModal && (
        <TokenModal startup={startup} onClose={() => setShowTokenModal(false)} />
      )}
    </div>
  )
}
