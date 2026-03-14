import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { ProfileSkeleton } from '../components/Skeleton'
import { agents } from '../data/agents'

const eventFilters = ['All', 'Commits', 'Deploys', 'Transactions', 'Reports']

const eventTypeMap = {
  Commits: 'commit',
  Deploys: 'deploy',
  Transactions: 'transaction',
  Reports: 'report',
}

const eventIcons = {
  commit: 'git-commit',
  deploy: 'upload',
  transaction: 'coins',
  scan: 'search',
  report: 'article',
  optimize: 'speed',
  test: 'check',
  config: 'sliders-2',
}

const eventColors = {
  commit: '#3B82F6',
  deploy: '#9fe870',
  transaction: '#F59E0B',
  scan: '#8B5CF6',
  report: '#6B7280',
  optimize: '#10B981',
  test: '#06B6D4',
  config: '#EC4899',
}

function HeatmapGrid({ data }) {
  const weeks = 26
  const days = 7
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  const levels = ['bg-[#ebedf0]', 'bg-[#d4edbc]', 'bg-[#7bc96f]', 'bg-[#449e48]', 'bg-[#196127]']

  return (
    <div className="overflow-x-auto -mx-5 px-5 scrollbar-none">
      <div className="flex gap-[2px] sm:gap-1 min-w-0">
        <div className="flex flex-col gap-[2px] sm:gap-[3px] pr-1 sm:pr-1.5">
          {dayLabels.map((label, i) => (
            <span key={i} className="text-[9px] text-[var(--color-muted)] font-mono h-[9px] sm:h-[11px] leading-[9px] sm:leading-[11px]">{label}</span>
          ))}
        </div>
        <div className="flex gap-[3px] flex-1">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {Array.from({ length: days }).map((_, d) => {
                const idx = w * 7 + d
                const val = data[idx] ?? 0
                return (
                  <div
                    key={d}
                    className={`w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-[2px] ${levels[Math.min(val, 4)]}`}
                    title={`${val} contributions`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function groupEventsByDay(events) {
  const groups = {}
  events.forEach((ev) => {
    let day = 'Today'
    if (ev.time.includes('Yesterday')) day = 'Yesterday'
    else if (ev.time.includes('days ago')) {
      const match = ev.time.match(/(\d+) days? ago/)
      day = match ? `${match[1]} days ago` : 'Earlier'
    }
    if (!groups[day]) groups[day] = []
    groups[day].push(ev)
  })
  return groups
}

export default function AgentProfile() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const agent = agents.find((a) => a.slug === slug)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const filteredEvents = agent
    ? agent.events.filter((ev) => {
        const matchesFilter = activeFilter === 'All' || ev.type === eventTypeMap[activeFilter]
        const matchesSearch = search === '' || ev.text.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
      })
    : []

  const groupedEvents = groupEventsByDay(filteredEvents)

  useEffect(() => {
    document.title = agent ? `${agent.name} — AgentValley` : 'Agent Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!agent) return

    const timer = setTimeout(() => setLoading(false), 600)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { setLoading(false); return () => clearTimeout(timer) }

    const ctx = gsap.context(() => {
      gsap.from('.agent-left', { y: 20, opacity: 0, duration: 0.5, delay: 0.2, clearProps: 'all' })
      gsap.from('.agent-right', { y: 20, opacity: 0, duration: 0.5, delay: 0.3, clearProps: 'all' })
    }, pageRef)
    return () => { clearTimeout(timer); ctx.revert() }
  }, [agent])

  if (!agent) {
    return (
      <div ref={pageRef}>
        <Nav forceScrolled />
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

  if (loading) {
    return (
      <div ref={pageRef}>
        <Nav forceScrolled />
        <ProfileSkeleton />
        <Footer />
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <Nav forceScrolled />

      <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Two-column split */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

            {/* LEFT — Profile */}
            <div className="agent-left pb-8">

              {/* Profile card */}
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 mb-5 relative overflow-hidden">
                {/* Pixel grid texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                  backgroundSize: '6px 6px',
                }} />

                <div className="relative">
                  {/* Avatar + name */}
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-20 h-20 rounded-2xl border-2 border-[var(--color-border)] mb-5"
                    style={{ imageRendering: 'pixelated' }}
                  />

                  <h1
                    className="text-[24px] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-1"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {agent.name}
                  </h1>
                  <p className="text-[14px] text-[var(--color-muted)] mb-4">
                    {agent.role}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md
                      ${agent.status === 'Active' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-gray-100 text-gray-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.status === 'Active' ? '#9fe870' : '#9ca3af' }} />
                      {agent.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--color-bg-alt)] text-[var(--color-heading)]">
                      <PixelIcon name="trophy" size={12} />
                      Rank #{agent.rank}
                    </span>
                  </div>

                  {/* Startup link */}
                  <TransitionLink
                    to={`/startups/${agent.startupSlug}`}
                    className="inline-flex items-center gap-2 text-[13px] text-[var(--color-heading)] font-medium hover:text-[var(--color-accent)] transition-colors group"
                  >
                    <PixelIcon name="speed" size={14} className="text-[var(--color-accent)]" />
                    <span className="group-hover:underline">{agent.startup}</span>
                    <PixelIcon name="chevron-right" size={12} className="text-[var(--color-muted)]" />
                  </TransitionLink>

                  {/* Stats */}
                  <div className="border-t border-[var(--color-border)] mt-5 pt-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Total Earned</span>
                      <span className="text-[14px] font-mono font-bold text-[var(--color-heading)]">{agent.earned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Tasks Completed</span>
                      <span className="text-[14px] font-mono font-bold text-[var(--color-heading)]">{agent.tasksCompleted.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Uptime</span>
                      <span className="text-[14px] font-mono font-bold text-[var(--color-heading)] inline-flex items-center gap-1.5">
                        <PixelIcon name="zap" size={12} className="text-[var(--color-accent)]" />
                        {agent.uptime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">Revenue Share</span>
                      <span className="text-[14px] font-mono font-bold text-[var(--color-heading)]">{agent.revenueShare}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-muted)]">AGENTV Balance</span>
                      <span className="text-[14px] font-mono font-bold text-[var(--color-heading)] inline-flex items-center gap-1.5">
                        <TokenIcon token="AGENTV" color="#9fe870" size={13} />
                        {agent.tokens}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="border-t border-[var(--color-border)] mt-5 pt-5">
                    <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--color-bg-alt)] text-[var(--color-body)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* About */}
                  <div className="border-t border-[var(--color-border)] mt-5 pt-5">
                    <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      About
                    </h2>
                    <p className="text-[13px] text-[var(--color-body)] leading-[1.7]">
                      {agent.bio}
                    </p>
                  </div>

                  {/* Activity Heatmap */}
                  <div className="border-t border-[var(--color-border)] mt-5 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-display)' }}>
                        Activity
                      </h2>
                      <span className="text-[11px] text-[var(--color-muted)] font-mono">6 months</span>
                    </div>
                    <HeatmapGrid data={agent.heatmap} />
                    <div className="flex items-center justify-end gap-1.5 mt-3">
                      <span className="text-[10px] text-[var(--color-muted)]">Less</span>
                      {['bg-[#ebedf0]', 'bg-[#d4edbc]', 'bg-[#7bc96f]', 'bg-[#449e48]', 'bg-[#196127]'].map((c, i) => (
                        <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
                      ))}
                      <span className="text-[10px] text-[var(--color-muted)]">More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Event Feed, open layout */}
            <div className="agent-right pt-4 lg:pt-0">

              {/* Feed header */}
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-[18px] text-[var(--color-heading)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Event <span style={{ fontFamily: 'var(--font-accent)' }}>Feed</span>
                </h2>
                <span className="text-[12px] text-[var(--color-muted)] font-mono">{filteredEvents.length} events</span>
              </div>

              {/* Search + filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 mt-4">
                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    placeholder="Search events..."
                    aria-label="Search events"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 sm:h-9 w-full pl-9 pr-4 rounded-lg border border-[var(--color-border)] bg-white text-[13px] text-[var(--color-heading)]
                               placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    <PixelIcon name="search" size={14} />
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
                  {eventFilters.map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => { navigator.vibrate?.(10); setActiveFilter(f) }}
                      aria-pressed={activeFilter === f}
                      className={`h-10 sm:h-8 px-3.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 whitespace-nowrap shrink-0
                        ${activeFilter === f
                          ? 'bg-[var(--color-heading)] text-white'
                          : 'bg-white border border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-muted)]'
                        }`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event list — flat, separated by thin lines */}
              <div className="border-t border-[var(--color-border)]">
                {filteredEvents.length === 0 && (
                  <div className="py-12 text-center text-[14px] text-[var(--color-muted)]">
                    No events match your search.
                  </div>
                )}

                {Object.entries(groupedEvents).map(([day, events]) => (
                  <div key={day}>
                    {/* Day label */}
                    <div className="pt-5 pb-2">
                      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {day}
                      </span>
                    </div>

                    {/* Events */}
                    {events.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 sm:gap-3 py-3 border-b border-[var(--color-border)]/50 last:border-b-0 group"
                      >
                        {/* Type icon */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${eventColors[ev.type]}12` }}
                        >
                          <PixelIcon name={eventIcons[ev.type] || 'article'} size={13} style={{ color: eventColors[ev.type] }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-[var(--color-heading)] leading-[1.4] block break-words">
                            {ev.text}
                          </span>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                            {ev.meta && (
                              <span className="text-[11px] font-mono text-[var(--color-muted)]">
                                {ev.meta}
                              </span>
                            )}
                            {ev.duration && (
                              <span className="text-[11px] font-mono text-[var(--color-muted)]">
                                {ev.duration}
                              </span>
                            )}
                            {ev.amount && (
                              <span className={`text-[11px] font-mono font-semibold ${ev.amount.startsWith('+') ? 'text-[#3d7a1c]' : 'text-[#dc2626]'}`}>
                                {ev.amount}
                              </span>
                            )}
                            {/* Time on mobile — inline with meta */}
                            <span className="text-[11px] text-[var(--color-muted)] font-mono sm:hidden">
                              {ev.time.includes(',') ? ev.time.split(', ')[1] : ev.time}
                            </span>
                          </div>
                        </div>

                        {/* Time — desktop only */}
                        <span className="text-[11px] text-[var(--color-muted)] font-mono shrink-0 pt-0.5 hidden sm:block">
                          {ev.time.includes(',') ? ev.time.split(', ')[1] : ev.time}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
