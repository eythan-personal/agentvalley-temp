import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { startups } from '../data/startups'

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

function TokenModal({ startup, onClose }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const [amount, setAmount] = useState('')
  const isGraduated = startup.status === 'Graduated'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Animate in
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, delay: 0.05, ease: 'power3.out' })
  }, [])

  const handleClose = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return onClose()
    gsap.to(panelRef.current, { y: 12, opacity: 0, duration: 0.15, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, delay: 0.05, onComplete: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${isGraduated ? 'Buy' : 'Invest in'} ${startup.token}`}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3.5">
          <div
            className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white text-[14px] font-bold shrink-0 overflow-hidden"
            style={{ backgroundColor: startup.color, fontFamily: 'var(--font-display)' }}
          >
            {startup.initials}
            <PixelGridOverlay opacity="0.08" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-[18px] text-[var(--color-heading)] tracking-[-0.02em] leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              {isGraduated ? 'Buy' : 'Invest in'} {startup.token}
            </h2>
            <span className="text-[13px] text-[var(--color-muted)]">{startup.name}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <PixelIcon name="close" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5 space-y-5">
          {/* Pay with */}
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
              Pay with
            </span>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
              <TokenIcon token="$PROMPT" color="#9fe870" size={28} />
              <span className="text-[15px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>$PROMPT</span>
              <span className="text-[13px] text-[var(--color-muted)] ml-auto">Wayfinder</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
              Amount of {startup.token}
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <TokenIcon token={startup.token} color={startup.tokenColor} icon={startup.tokenIcon} size={18} />
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[16px] font-mono text-[var(--color-heading)]
                           placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                aria-label={`Amount of ${startup.token} to ${isGraduated ? 'buy' : 'invest'}`}
              />
            </div>
          </div>

          {/* Info note */}
          <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0"><PixelIcon name="sparkle" size={14} /></span>
              <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                All transactions are settled in Wayfinder <strong className="font-semibold text-[var(--color-heading)]">$PROMPT</strong>.
                {' '}The 0.25% fee is burned on every transaction.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 flex items-center gap-3">
          <button
            type="button"
            disabled={!amount || parseFloat(amount) <= 0}
            onClick={() => { navigator.vibrate?.(15); handleClose() }}
            className={`flex-1 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer
              ${amount && parseFloat(amount) > 0
                ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg hover:shadow-[var(--color-accent)]/20'
                : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
              }`}
          >
            Confirm {isGraduated ? 'Purchase' : 'Investment'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="h-11 px-5 rounded-xl text-[14px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
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
        <Nav />
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
      <Nav />

      {/* Banner */}
      <div className="profile-banner relative h-36 md:h-64 overflow-hidden" style={{ background: startup.banner }}>
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
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md w-fit
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

              {/* Revenue + Buy/Invest */}
              <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-[clamp(1.6rem,4vw,2.2rem)] leading-none tracking-tight text-[var(--color-heading)]"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      {startup.revenue}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-mono font-semibold text-[var(--color-heading)]">
                      <TokenIcon token={startup.token} color={startup.tokenColor} icon={startup.tokenIcon} size={16} />
                      {startup.token}
                    </span>
                  </div>
                  {startup.change24h && (
                    <span className={`text-[12px] font-mono font-semibold sm:mt-0.5 inline-block ${startup.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>
                      {startup.change24h}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setShowTokenModal(true) }}
                  className="h-9 px-5 rounded-full text-[13px] font-semibold cursor-pointer
                             bg-[var(--color-accent)] text-[#0d2000]
                             hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                             inline-flex items-center gap-2"
                >
                  <PixelIcon name="coins" size={14} />
                  {startup.status === 'Graduated' ? `Buy ${startup.token}` : `Invest in ${startup.token}`}
                </button>
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
                    <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden border border-[var(--color-border)]">
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
                {agents.map((a, i) => (
                  <li
                    key={i}
                    className="relative flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-b-0
                               hover:bg-[var(--color-accent-soft)] transition-all duration-200 group"
                    style={{ transitionTimingFunction: 'steps(3)' }}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-6 rounded-r-full bg-[var(--color-accent)] transition-all duration-200" style={{ transitionTimingFunction: 'steps(3)' }} />
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)]/30 transition-colors" style={{ transitionTimingFunction: 'steps(3)' }}>
                      <PixelIcon name={a.icon} size={16} className="text-[var(--color-heading)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-[var(--color-heading)] font-medium block" style={{ fontFamily: 'var(--font-display)' }}>{a.name}</span>
                      <span className="text-[12px] text-[var(--color-muted)]">{a.role}</span>
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{a.earnings}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md
                      ${a.status === 'Active' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Active' ? 'bg-[var(--color-accent)]' : 'bg-gray-400'}`} />
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
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
