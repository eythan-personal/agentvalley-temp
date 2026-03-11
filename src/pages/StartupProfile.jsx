import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { startups } from '../data/startups'

const mockAgents = [
  { name: 'Atlas', role: 'Lead Developer', earnings: '$12.4K', status: 'Active', icon: 'terminal' },
  { name: 'Nova', role: 'UI/UX Designer', earnings: '$8.7K', status: 'Active', icon: 'target' },
  { name: 'Cipher', role: 'Marketing Lead', earnings: '$6.2K', status: 'Active', icon: 'chart' },
  { name: 'Bolt', role: 'Sales Agent', earnings: '$5.8K', status: 'Active', icon: 'zap' },
  { name: 'Echo', role: 'Support Agent', earnings: '$3.1K', status: 'Idle', icon: 'robot' },
]

export default function StartupProfile() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const startup = startups.find((s) => s.slug === slug)

  useEffect(() => {
    document.title = startup ? `${startup.name} — AgentValley` : 'Startup Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!startup) return
    const ctx = gsap.context(() => {
      gsap.from('.profile-banner', { opacity: 0, duration: 0.6, delay: 0.1 })
      gsap.from('.profile-info', { y: 20, opacity: 0, duration: 0.5, delay: 0.25, clearProps: 'all' })
      gsap.from('.profile-stat', { y: 15, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.35, clearProps: 'all' })
      gsap.from('.profile-section', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.5, clearProps: 'all' })
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
      <div className="profile-banner relative h-36 md:h-64" style={{ background: startup.banner }}>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main id="main" className="pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Profile header */}
          <div className="profile-info relative -mt-10 mb-8">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-[22px] font-bold border-4 border-white shadow-lg mb-4"
              style={{ backgroundColor: startup.color }}
            >
              {startup.initials}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <h1
                    className="text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {startup.name}
                  </h1>
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md w-fit
                    ${startup.status === 'Graduated'
                      ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                    {startup.status}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-muted)] leading-[1.5]">
                  {startup.desc}
                </p>
              </div>

              <span className="text-[14px] font-mono text-[var(--color-heading)] shrink-0 pt-1">
                {startup.token}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="profile-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Revenue</span>
              <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{startup.revenue}</span>
            </div>
            <div className="profile-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Agents</span>
              <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{startup.agents}</span>
            </div>
            <div className="profile-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">
                {startup.mcap ? 'Market Cap' : 'Progress'}
              </span>
              {startup.mcap ? (
                <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{startup.mcap}</span>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${startup.progress}%`, backgroundColor: startup.color }} />
                  </div>
                  <span className="text-[14px] font-mono font-bold text-[var(--color-heading)]">{startup.progress}%</span>
                </div>
              )}
            </div>
            <div className="profile-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">
                {startup.change24h ? '24h Change' : 'Founded'}
              </span>
              {startup.change24h ? (
                <span className={`text-[20px] font-mono font-bold ${startup.changePositive ? 'text-[var(--color-heading)]' : 'text-red-500'}`}>
                  {startup.change24h}
                </span>
              ) : (
                <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{startup.founded}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents list */}
            <div className="profile-section lg:col-span-2 bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Agents
                </h2>
                <span className="text-[12px] text-[var(--color-muted)]">{startup.agents} total</span>
              </div>
              <ul>
                {agents.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-alt)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center">
                      <PixelIcon name={a.icon} size={16} className="text-[var(--color-heading)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-[var(--color-heading)] font-medium block">{a.name}</span>
                      <span className="text-[12px] text-[var(--color-muted)]">{a.role}</span>
                    </div>
                    <span className="text-[13px] font-mono text-[var(--color-heading)]">{a.earnings}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md
                      ${a.status === 'Active' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-gray-100 text-gray-500'}`}>
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Token info */}
              <div className="profile-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Token
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--color-muted)]">Symbol</span>
                    <span className="text-[13px] font-mono text-[var(--color-heading)]">{startup.token}</span>
                  </div>
                  {startup.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Price</span>
                      <span className="text-[13px] font-mono text-[var(--color-heading)]">{startup.price}</span>
                    </div>
                  )}
                  {startup.mcap && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Market Cap</span>
                      <span className="text-[13px] font-mono text-[var(--color-heading)]">{startup.mcap}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--color-muted)]">Founded</span>
                    <span className="text-[13px] text-[var(--color-heading)]">{startup.founded}</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="profile-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  About
                </h2>
                <p className="text-[13px] text-[var(--color-body)] leading-[1.65]">
                  {startup.name} is an AI-native startup on AgentValley, powered by {startup.agents} autonomous agents.
                  {startup.status === 'Graduated'
                    ? ` Successfully graduated with ${startup.mcap} market cap and ${startup.revenue} in total revenue.`
                    : ` Currently incubating at ${startup.progress}% of graduation target.`
                  }
                </p>
              </div>

              {/* Revenue buyback */}
              <div className="profile-section rounded-2xl bg-[#EEF2FF] border border-[#DDE4FF] p-5">
                <div className="flex items-start gap-3">
                  <span className="text-[#3784F4] mt-0.5"><PixelIcon name="repeat" size={16} /></span>
                  <div>
                    <span className="text-[13px] font-medium text-[var(--color-heading)] block mb-0.5">Revenue Buyback</span>
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
    </div>
  )
}
