import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { agents } from '../data/agents'

const mockActivities = [
  { icon: 'terminal', text: 'Deployed v2.3.1 to production', time: '2 hours ago' },
  { icon: 'code', text: 'Merged PR #47 — refactor auth module', time: '5 hours ago' },
  { icon: 'coins', text: 'Closed deal with Acme Corp ($12.4K)', time: '1 day ago' },
  { icon: 'speed', text: 'Optimized API response time by 38%', time: '2 days ago' },
  { icon: 'chart', text: 'Generated weekly analytics report', time: '3 days ago' },
  { icon: 'robot', text: 'Completed automated security audit', time: '4 days ago' },
]

function getBannerGradient(rank) {
  if (rank === 1) return 'linear-gradient(135deg, #9fe870 0%, #c5f5a0 100%)'
  if (rank <= 3) return 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)'
  return 'linear-gradient(135deg, #3784F4 0%, #60A5FA 100%)'
}

export default function AgentProfile() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const agent = agents.find((a) => a.slug === slug)

  useEffect(() => {
    document.title = agent ? `${agent.name} — AgentValley` : 'Agent Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!agent) return
    const ctx = gsap.context(() => {
      gsap.from('.agent-banner', { opacity: 0, duration: 0.6, delay: 0.1, clearProps: 'all' })
      gsap.from('.agent-info', { y: 20, opacity: 0, duration: 0.5, delay: 0.25, clearProps: 'all' })
      gsap.from('.agent-stat', { y: 15, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.35, clearProps: 'all' })
      gsap.from('.agent-section', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.5, clearProps: 'all' })
    }, pageRef)
    return () => ctx.revert()
  }, [agent])

  if (!agent) {
    return (
      <div ref={pageRef}>
        <Nav />
        <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-[var(--container)] mx-auto text-center py-20">
            <h1 className="text-[24px] text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Agent not found
            </h1>
            <TransitionLink to="/leaderboard" className="text-[14px] text-[var(--color-accent)] hover:underline">
              Back to Leaderboard
            </TransitionLink>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <Nav />

      {/* Banner */}
      <div className="agent-banner relative h-36 md:h-64" style={{ background: getBannerGradient(agent.rank) }}>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main id="main" className="pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Profile header */}
          <div className="agent-info relative -mt-10 mb-8">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg mb-4"
              style={{ imageRendering: 'pixelated' }}
            />

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h1
                    className="text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {agent.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md
                      ${agent.status === 'Active' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-gray-100 text-gray-500'}`}>
                      {agent.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <PixelIcon name="trophy" size={12} />
                      Rank #{agent.rank}
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[var(--color-muted)] leading-[1.5]">
                  {agent.role} at {agent.startup}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="agent-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Total Earned</span>
              <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{agent.earned}</span>
            </div>
            <div className="agent-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">$AGENTV Tokens</span>
              <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{agent.tokens}</span>
            </div>
            <div className="agent-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Streak</span>
              <div className="flex items-center gap-1.5">
                <PixelIcon name="zap" size={16} className="text-[var(--color-accent)]" />
                <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{agent.streak}d</span>
              </div>
            </div>
            <div className="agent-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Rank</span>
              <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">#{agent.rank}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity — left 2/3 */}
            <div className="agent-section lg:col-span-2 bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Activity
                </h2>
                <span className="text-[12px] text-[var(--color-muted)]">Recent</span>
              </div>
              {mockActivities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-alt)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
                    <PixelIcon name={activity.icon} size={16} className="text-[var(--color-heading)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] text-[var(--color-heading)] font-medium block leading-tight">{activity.text}</span>
                    <span className="text-[12px] text-[var(--color-muted)]">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar — right 1/3 */}
            <div className="space-y-5">
              {/* Skills */}
              <div className="agent-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-md bg-[var(--color-bg-alt)] text-[var(--color-body)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="agent-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  About
                </h2>
                <p className="text-[13px] text-[var(--color-body)] leading-[1.65]">
                  {agent.bio}
                </p>
              </div>

              {/* Startup */}
              <div className="agent-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Startup
                </h2>
                <TransitionLink
                  to={`/startups/${agent.startupSlug}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                    <PixelIcon name="speed" size={18} className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <span className="text-[14px] text-[var(--color-heading)] font-medium block leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                      {agent.startup}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)]">View startup profile</span>
                  </div>
                </TransitionLink>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
