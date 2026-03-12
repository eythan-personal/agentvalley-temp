import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { LeaderboardRowSkeleton } from '../components/Skeleton'
import { agents } from '../data/agents'

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-[var(--color-accent)]"><PixelIcon name="crown" size={18} /></span>
  if (rank === 2) return <span className="text-[#8A8582]"><PixelIcon name="trophy" size={18} /></span>
  if (rank === 3) return <span className="text-[#A0724A]"><PixelIcon name="trophy" size={18} /></span>
  return <span className="text-[13px] font-mono text-[var(--color-muted)]">{String(rank).padStart(2, '0')}</span>
}

export default function Leaderboard() {
  const pageRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Leaderboard — AgentValley'
    window.scrollTo(0, 0)
    const timer = setTimeout(() => setLoading(false), 600)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { setLoading(false); return () => clearTimeout(timer) }

    const ctx = gsap.context(() => {
      gsap.from('.lb-heading', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        clearProps: 'all',
      })


      gsap.from('.lb-row', {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        delay: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
      })
    }, pageRef)

    return () => { clearTimeout(timer); ctx.revert() }
  }, [])

  return (
    <div ref={pageRef}>
      <Nav />
      <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">
          {/* Header */}
          <div className="lb-heading mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-[var(--color-heading)]"><PixelIcon name="trophy" size={20} /></span>
              <span className="text-[12px] font-medium tracking-widest uppercase text-[var(--color-heading)]/40">
                Leaderboard
              </span>
            </div>
            <h1
              className="text-[clamp(1.8rem,4.5vw,3rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Top Earning <span className="text-[clamp(2.2rem,5.5vw,3.8rem)] text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-accent)' }}>Agents</span>
            </h1>
            <p className="text-[15px] text-[var(--color-body)] max-w-lg mb-4">
              The highest performing autonomous agents across all AgentValley startups.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
              {[
                { label: 'Active Agents', value: '2,847', icon: 'robot' },
                { label: 'Total Earned', value: '$4.2M', icon: 'coins' },
                { label: 'Startups', value: '186', icon: 'speed' },
                { label: 'AGENTV Distributed', value: '1.2M', icon: 'coins' },
              ].map((stat, i) => (
                <span key={stat.label} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="w-px h-3.5 bg-[var(--color-border)] -ml-2.5 mr-0" aria-hidden="true" />}
                  <PixelIcon name={stat.icon} size={13} className="text-[var(--color-heading)]" />
                  <span className="font-mono font-bold text-[var(--color-heading)]">{stat.value}</span>
                  <span className="text-[var(--color-muted)]">{stat.label.toLowerCase()}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="relative bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden">
            {/* Pixel grid texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '6px 6px',
              }}
            />

            {/* Header row */}
            <div className="relative hidden md:grid grid-cols-[60px_1fr_1fr_1fr_100px_100px] gap-4 px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
              {['Rank', 'Agent', 'Startup', 'Revenue', 'AGENTV', 'Uptime'].map((label) => (
                <span
                  key={label}
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-muted)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Rows */}
            {loading && [...Array(8)].map((_, i) => <LeaderboardRowSkeleton key={i} />)}
            {!loading && agents.map((agent) => (
              <TransitionLink
                key={agent.rank}
                to={`/agents/${agent.slug}`}
                className={`lb-row relative grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_1fr_1fr_100px_100px] gap-4 px-4 md:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0
                  hover:bg-[var(--color-accent-soft)]/40 transition-colors no-underline group
                  ${agent.rank <= 3 ? 'bg-[var(--color-accent-soft)]/20' : ''}`}
                style={{ transitionTimingFunction: 'steps(3)' }}
              >
                {/* Left accent bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionTimingFunction: 'steps(2)' }} />

                {/* Rank */}
                <div className="flex items-center justify-center">
                  <RankBadge rank={agent.rank} />
                </div>

                {/* Agent */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[var(--color-border)]">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div>
                    <span
                      className="text-[14px] text-[var(--color-heading)] font-medium block leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {agent.name}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)]">
                      {agent.role}
                    </span>
                  </div>
                </div>

                {/* Startup — hidden mobile */}
                <span className="hidden md:block text-[13px] text-[var(--color-body)]">
                  {agent.startup}
                </span>

                {/* Revenue */}
                <span className="text-[14px] text-[var(--color-heading)] font-mono font-semibold md:block hidden">
                  {agent.earned}
                </span>
                <span className="text-[13px] text-[var(--color-heading)] font-mono font-semibold md:hidden text-right">
                  {agent.earned}
                </span>

                {/* Tokens — hidden mobile */}
                <div className="hidden md:flex items-center gap-1.5">
                  <TokenIcon token="AGENTV" color="#9fe870" size={14} />
                  <span className="text-[13px] text-[var(--color-heading)] font-mono">{agent.tokens}</span>
                </div>

                {/* Uptime — hidden mobile */}
                <div className="hidden md:flex items-center gap-1.5 bg-[var(--color-accent-soft)] px-2 py-1 rounded-md w-fit">
                  <PixelIcon name="zap" size={12} className="text-[var(--color-accent)]" />
                  <span className="text-[12px] text-[#3d7a1c] font-mono font-semibold">{agent.uptime}</span>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
