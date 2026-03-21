import { useState, useEffect, useRef, useCallback } from 'react'
import NumberFlow from '@number-flow/react'
import PixelIcon from '../components/PixelIcon'
import { BottomNav, TopBar, AgentDot, CommandPalette, ObjectiveCard, QueuedObjectiveCard } from '../components/ui'
import char1 from '../assets/characters/character_1.webp'
import char2 from '../assets/characters/character_2.webp'
import char3 from '../assets/characters/character_3.webp'
import char4 from '../assets/characters/character_4.webp'
import char5 from '../assets/characters/character_5.webp'

const TABS = [
  { id: 'dashboard', label: 'Startup Overview', icon: 'home' },
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
  { id: 'agents', label: 'Agents', icon: 'robot' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
]

const STARTUPS = [
  { name: 'Acme AI Labs', initials: 'AA', color: '#6366f1', slug: 'acme-ai-labs', role: 'Owner' },
  { name: 'Neon Grid', initials: 'NG', color: '#10b981', slug: 'neon-grid' },
  { name: 'Code Forge', initials: 'CF', color: '#f59e0b', slug: 'code-forge' },
]

const AGENTS = ['Scout', 'Forge', 'Relay', 'Cipher', 'Beacon']

// Timeline icon color — single neutral tone, agents provide the color
const TL = { iconColor: 'text-[var(--color-muted)]', iconBg: 'bg-[var(--color-bg-alt)]' }

const FEED = [
  {
    type: 'file',
    icon: 'plus',
    ...TL,
    agent: 'Scout',
    time: '2 hours ago',
    content: <><span className="font-semibold">Scout</span> Added <span className="font-semibold">competitor_analysis.csv</span></>,
  },
  {
    type: 'task',
    icon: 'clipboard',
    ...TL,
    agent: 'Forge',
    time: '4 hours ago',
    content: <><span className="font-semibold">Forge</span> Completed task <span className="font-semibold">TSK-035</span></>,
    detail: 'Fixed auth token refresh logic — tokens now auto-renew 5 minutes before expiry. Tested across all OAuth providers.',
  },
  {
    type: 'review',
    icon: 'message',
    ...TL,
    agent: 'Cipher',
    time: '5 hours ago',
    content: <><span className="font-semibold">Cipher</span> Requested review on <span className="font-semibold">TSK-038</span></>,
    detail: 'Pull request #127 touches the payment service and needs a security review before merging. 3 files changed, 47 additions.',
    needsReview: true,
    thread: { count: 4, agents: ['Beacon', 'Scout'] },
  },
  {
    type: 'collapse',
    text: 'View 3 more updates from today',
  },
  {
    type: 'comment',
    icon: 'message',
    ...TL,
    agent: 'Beacon',
    time: '1 day ago',
    content: <><span className="font-semibold">Beacon</span> Mentioned you in a comment on <span className="font-semibold">TSK-032</span></>,
    detail: 'Monitoring alerts are now configured for all production endpoints. @team please review the threshold values before the next deploy.',
    mention: true,
    thread: { count: 6, agents: ['Forge', 'Relay'] },
  },
  {
    type: 'assign',
    icon: 'arrow-right',
    ...TL,
    agent: 'Relay',
    time: '2 days ago',
    content: <><span className="font-semibold">Relay</span> was assigned to <span className="font-semibold">Deploy staging environment</span></>,
  },
  {
    type: 'tag',
    icon: 'plus',
    ...TL,
    agent: 'Cipher',
    time: '3 days ago',
    content: <><span className="font-semibold">Cipher</span> Applied <span className="font-semibold">Urgent</span> tag</>,
  },
  {
    type: 'closed',
    icon: 'close',
    ...TL,
    agent: 'Scout',
    time: '4 days ago',
    content: <>Objective closed by <span className="font-semibold">Scout</span></>,
  },
]

// Mini sparkline
function Sparkline({ data, color = 'var(--color-heading)', width = 100, height = 32 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 6) - 3}`
  ).join(' ')
  const fillPoints = `0,${height} ${points} ${width},${height}`
  return (
    <svg width={width} height={height} className="flex-shrink-0" role="img" aria-label="Task trend chart">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#sparkFill)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Mini bar chart
function MiniBar({ values, color = 'var(--color-muted)', width = 28, height = 18 }) {
  const max = Math.max(...values)
  return (
    <svg width={width} height={height} className="flex-shrink-0" role="img" aria-label="Mini bar chart">
      {values.map((v, i) => {
        const barH = (v / max) * (height - 2)
        const barW = (width / values.length) - 1.5
        return (
          <rect key={i} x={i * (barW + 1.5)} y={height - barH} width={barW} height={barH} fill={color} rx={0.5} />
        )
      })}
    </svg>
  )
}


// Timeline action icon — matches AgentDot size (28px)
function ActionIcon({ icon, iconColor, iconBg }) {
  return (
    <div className={`w-7 h-7 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 ring-2 ring-[var(--color-bg)]`}>
      <PixelIcon name={icon} size={12} className={iconColor} aria-hidden="true" />
    </div>
  )
}

const LIVE_EVENTS = [
  (agent) => ({
    type: 'task', icon: 'clipboard', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Completed task <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
  }),
  (agent) => ({
    type: 'file', icon: 'plus', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Added <span className="font-semibold">{['report.pdf', 'metrics.csv', 'schema.sql', 'config.yaml', 'readme.md'][Math.floor(Math.random() * 5)]}</span></>,
  }),
  (agent) => ({
    type: 'comment', icon: 'message', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Left a comment on <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
    detail: ['Looks good, shipping this.', 'Found an edge case — adding a fix now.', 'Dependencies updated, re-running tests.', 'Blocked by upstream API changes.'][Math.floor(Math.random() * 4)],
  }),
  (agent) => ({
    type: 'review', icon: 'message', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Requested review on <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
    detail: ['Changes to the auth flow need a second pair of eyes.', 'New endpoint added — please verify the schema.', 'Refactored the caching layer, need perf review.'][Math.floor(Math.random() * 3)],
    needsReview: true,
  }),
  (agent) => ({
    type: 'assign', icon: 'arrow-right', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> was assigned to <span className="font-semibold">{['Update search index', 'Fix webhook retry logic', 'Migrate to new CDN', 'Audit rate limits'][Math.floor(Math.random() * 4)]}</span></>,
  }),
]

function OverviewTab({ startup, onTabChange }) {
  const [showAll, setShowAll] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterBy, setFilterBy] = useState('all')
  const [liveEvents, setLiveEvents] = useState([])
  const [paused, setPaused] = useState(false)
  const [reviewDismissed, setReviewDismissed] = useState(true)
  const taskCountRef = useRef(42)

  // Add a new event every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const template = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)]
      const event = { ...template(agent), time: 'Just now', id: Date.now() }
      setLiveEvents(prev => [event, ...prev.map(e => ({
        ...e,
        time: e.time === 'Just now' ? '30s ago'
          : e.time === '30s ago' ? '1m ago'
          : e.time === '1m ago' ? '2m ago'
          : e.time === '2m ago' ? '3m ago'
          : e.time,
      }))])
      taskCountRef.current += 1
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close filter on outside click
  useEffect(() => {
    if (!filterOpen) return
    const handleClick = () => setFilterOpen(false)
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  // Animate stats from 0 on mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const totalTasks = mounted ? taskCountRef.current + liveEvents.length : 0
  const inProgress = mounted ? 3 : 0
  const needsReview = mounted ? 5 + liveEvents.filter(e => e.needsReview).length : 0
  const completed = mounted ? 28 + liveEvents.filter(e => e.type === 'task').length : 0

  // Current objective task breakdown
  const objTotal = 10
  const objCompleted = mounted ? 3 : 0
  const objInProgress = mounted ? 2 : 0
  const objReview = mounted ? 2 : 0
  const objPending = mounted ? objTotal - objCompleted - objInProgress - objReview : 0
  const objPercent = mounted ? Math.round(((objCompleted + objInProgress * 0.5 + objReview * 0.75) / objTotal) * 100) : 0
  const objCompletedPct = mounted ? `${Math.round((objCompleted / objTotal) * 100)}%` : '0%'
  const objInProgressPct = mounted ? `${Math.round((objInProgress / objTotal) * 100)}%` : '0%'
  const objReviewPct = mounted ? `${Math.round((objReview / objTotal) * 100)}%` : '0%'

  const allFeed = [...liveEvents, ...FEED]

  const filteredFeed = allFeed.filter(item => {
    if (item.type === 'collapse') return showAll ? false : true
    if (!showAll && ['assign', 'tag', 'closed'].includes(item.type)) return false
    if (filterBy === 'tasks' && !['task', 'file', 'assign', 'closed'].includes(item.type)) return false
    if (filterBy === 'reviews' && item.type !== 'review') return false
    if (filterBy === 'comments' && !['comment', 'review'].includes(item.type)) return false
    return true
  })

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-24 sm:pt-[20vh] pb-32">
      {/* Greeting + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[18px] font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {(() => {
              const h = new Date().getHours()
              return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
            })()}, Eythan
          </h1>
          <div className="text-[12px] text-[var(--color-muted)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
              paused
                ? 'bg-[var(--color-accent)] text-[#0d2000] hover:bg-[var(--color-accent)]/90'
                : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)]'
            }`}
          >
            <PixelIcon name={paused ? 'power' : 'clock'} size={13} aria-hidden="true" />
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)] transition-[background-color,color,scale] duration-150 cursor-pointer active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
          >
            <PixelIcon name="settings" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Objective card */}
      <ObjectiveCard
        title="Scrape competitor pricing & generate weekly analysis report"
        percent={objPercent}
        completed={objCompleted}
        inProgress={objInProgress}
        review={objReview}
        pending={objPending}
        total={objTotal}
        agents={['Scout', 'Forge']}
        paused={paused}
        animate={mounted}
        onViewObjective={() => onTabChange?.('objectives')}
        className="relative z-10"
      />

      {/* Stats shelf — tucked under the objective card */}
      <div className="relative -mt-4 rounded-b-2xl px-6 pt-7 pb-5 mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 30%, var(--color-bg-alt))' }}>
        {/* Desktop */}
        <div className="hidden sm:flex items-end gap-0">
          <div className="flex items-end gap-5 pr-8 flex-1">
            <div className="flex-shrink-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Total Tasks:</div>
              <NumberFlow value={totalTasks} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
            </div>
            <div className="flex-1 mb-2"><Sparkline data={[3, 5, 4, 7, 6, 8, 12, 10, 11, 9, 12]} width={200} /></div>
          </div>
          <div className="px-8 border-l border-[var(--color-border)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">In Progress</div>
            <NumberFlow value={inProgress} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
          </div>
          <div className="px-8 border-l border-[var(--color-border)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Avg Task Time</div>
            <div className="flex items-baseline gap-1">
              <NumberFlow value={mounted ? 14 : 0} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
              <span className="text-[13px] font-medium text-[var(--color-muted)]">min</span>
            </div>
          </div>
          <div className="px-8 border-l border-[var(--color-border)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Completed (24h)</div>
            <NumberFlow value={completed} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
          </div>
          <div className="flex items-end gap-3 pl-8 border-l border-[var(--color-border)]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Team</div>
              <NumberFlow value={AGENTS.length} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
            </div>
            <div className="flex -space-x-1.5 pb-1 mb-2">
              {AGENTS.map(name => (
                <AgentDot key={name} name={name} size={24} className="ring-2 ring-[var(--color-bg-alt)]" />
              ))}
            </div>
          </div>
        </div>
        {/* Mobile */}
        <div className="flex sm:hidden gap-2 overflow-x-auto -mx-6 px-6 pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {[
            { label: 'Tasks', value: totalTasks },
            { label: 'In Progress', value: inProgress },
            { label: 'Avg Time', value: 14, suffix: 'm' },
            { label: 'Done (24h)', value: completed },
            { label: 'Team', value: AGENTS.length },
          ].map((stat, i) => (
            <div key={i} className="flex-shrink-0 rounded-xl bg-[var(--color-bg)] px-4 py-3 min-w-[90px]">
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-0.5">
                <NumberFlow value={stat.value} className="text-[20px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
                {stat.suffix && <span className="text-[11px] font-medium text-[var(--color-muted)]">{stat.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed with timeline connector */}
      <div className="-mt-2 px-6">
        {/* Feed header */}
        <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)] mb-2">
          <h2 className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Activity Log</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={showAll}
              onClick={() => setShowAll(prev => !prev)}
              className="flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded-lg"
            >
              <span className="text-[13px] text-[var(--color-muted)]">Show all activity</span>
              <span className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showAll ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} aria-hidden="true">
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${showAll ? 'translate-x-4' : ''}`} />
              </span>
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Filter activity"
                onClick={() => setFilterOpen(prev => !prev)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${filterOpen || filterBy !== 'all' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-alt)] text-[var(--color-muted)]'}`}
              >
                <PixelIcon name="sliders" size={16} aria-hidden="true" />
              </button>
              {/* Filter dropdown */}
              <div
                style={{
                  transformOrigin: 'top right',
                  scale: filterOpen ? '1' : '0.85',
                  opacity: filterOpen ? 1 : 0,
                  filter: filterOpen ? 'blur(0px)' : 'blur(8px)',
                  transition: filterOpen
                    ? 'scale 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease-out, filter 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)'
                    : 'scale 0.15s cubic-bezier(0.4, 0, 1, 1), opacity 0.12s ease-in, filter 0.15s cubic-bezier(0.4, 0, 1, 1)',
                  pointerEvents: filterOpen ? 'auto' : 'none',
                }}
                className="absolute top-full right-0 mt-2 z-50"
                onMouseDown={e => e.stopPropagation()}
              >
                <div className="rounded-[16px] bg-[var(--color-nav)] py-2 px-2 w-44" role="menu" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">Filter by</div>
                  {[
                    { id: 'all', label: 'All activity' },
                    { id: 'tasks', label: 'Tasks' },
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'comments', label: 'Comments' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      role="menuitem"
                      onClick={() => { setFilterBy(opt.id); setFilterOpen(false) }}
                      className={`w-full text-left px-2.5 py-2 text-[13px] rounded-xl transition-[color,background-color] duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
                        filterBy === opt.id ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6">
        {filteredFeed.map((item, i) => {
          const isLast = i === filteredFeed.length - 1

          // Collapsible "view more" row
          if (item.type === 'collapse') {
            return (
              <div key={i} className="relative flex items-center gap-3 py-3">
                {/* Timeline line */}
                <div className="absolute left-[13px] top-0 bottom-0 w-px bg-[var(--color-border)]" aria-hidden="true" />
                {/* Connector icon */}
                <div className="relative z-10 w-7 h-7 rounded-full bg-[var(--color-bg)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border)]">
                  <PixelIcon name="chevrons-vertical" size={12} className="text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-[13px] text-[var(--color-accent)] font-medium cursor-pointer hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded bg-transparent border-none p-0"
                >
                  {item.text}
                </button>
              </div>
            )
          }

          const hasCard = !!item.detail

          return (
            <div
              key={i}
              className={`relative flex gap-3 py-3 group ${!hasCard ? 'cursor-pointer' : ''}`}
              style={!hasCard ? { borderRadius: 12 } : undefined}
              {...(!hasCard ? {
                role: 'button',
                tabIndex: 0,
                onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); /* activate item */ } },
              } : {})}
            >
              {/* Hover highlight for non-card items */}
              {!hasCard && (
                <div className="absolute -inset-x-2 -inset-y-0.5 rounded-xl bg-[var(--color-bg-alt)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100" aria-hidden="true" />
              )}
              {/* Timeline line — runs full height except on last item */}
              {!isLast && (
                <div className="absolute left-[13px] top-0 bottom-0 w-px bg-[var(--color-border)]" aria-hidden="true" />
              )}
              {/* Line above (connects from previous) */}
              <div className="absolute left-[13px] top-0 h-3 w-px bg-[var(--color-border)]" aria-hidden="true" />

              {/* Action icon — sits on the line */}
              <div className="relative z-10">
                <ActionIcon icon={item.icon} iconColor={item.iconColor} iconBg={item.iconBg} />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 min-w-0 pt-0.5">
                {/* Header line */}
                <div className="flex items-center gap-2 flex-wrap">
                  <AgentDot name={item.agent} size={24} />
                  <span className="text-[13px] text-[var(--color-body)]">
                    {item.content}
                  </span>
                  <span className="text-[12px] text-[var(--color-muted)] flex-shrink-0">· {item.time}</span>
                  {/* Go link on hover — only for non-card items */}
                  {!hasCard && (
                    <span className="ml-auto flex items-center gap-1 text-[12px] text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 flex-shrink-0" aria-hidden="true">
                      Go <PixelIcon name="arrow-right" size={12} aria-hidden="true" />
                    </span>
                  )}
                </div>

                {/* Detail card */}
                {item.detail && (
                  <div className={`mt-2.5 ml-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 ${item.needsReview || item.mention ? 'flex items-start gap-4' : ''}`}>
                    <p className="text-[13px] text-[var(--color-body)] leading-relaxed flex-1">{item.detail}</p>
                    {item.needsReview && (
                      <button
                        type="button"
                        className="px-4 py-1.5 text-[12px] font-semibold rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out active:scale-[0.96] flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                        style={{ backgroundColor: 'color-mix(in srgb, oklch(0.82 0.18 80) 25%, var(--color-surface))', color: 'var(--color-heading)' }}
                      >
                        Review
                      </button>
                    )}
                    {item.mention && (
                      <button
                        type="button"
                        className="px-4 py-1.5 text-[12px] font-semibold text-[var(--color-heading)] bg-[var(--color-bg-alt)] rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out hover:bg-[var(--color-border)] active:scale-[0.96] flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                      >
                        Go
                      </button>
                    )}
                  </div>
                )}

                {/* Thread replies */}
                {item.thread && (
                  <button
                    type="button"
                    className="mt-2.5 ml-8 flex items-center gap-2 cursor-pointer group/thread bg-transparent border-none p-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded"
                  >
                    <PixelIcon name="repeat" size={12} className="text-[var(--color-muted)]" aria-hidden="true" />
                    <div className="flex -space-x-1.5">
                      {item.thread.agents.map(name => (
                        <AgentDot key={name} name={name} size={20} className="ring-2 ring-[var(--color-bg)]" />
                      ))}
                    </div>
                    <span className="text-[12px] text-[var(--color-muted)] group-hover/thread:text-[var(--color-heading)] transition-colors">
                      View {item.thread.count} more replies
                    </span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Objectives Tab ─────────────────────────────────────────────────────────

const OBJECTIVE = {
  id: 'OBJ-001',
  title: 'Scrape competitor pricing & generate weekly analysis report',
  status: 'in_progress',
  progress: 45,
  completed: 3,
  inProgress: 2,
  review: 2,
  pending: 3,
  total: 10,
  agents: ['Scout', 'Forge'],
}

const TASKS = [
  { id: 'TSK-041', title: 'Scrape pricing data from CompetitorA', status: 'working', agent: 'Scout', detail: 'Crawling 47 product pages, extracting price + SKU. 32/47 done so far.', votes: { up: 2, down: 0 }, comments: 1 },
  { id: 'TSK-042', title: 'Normalize scraped data into unified schema', status: 'working', agent: 'Forge', detail: 'Mapping 6 different price formats into a single CSV schema with currency conversion.', votes: { up: 3, down: 1 }, comments: 4 },
  { id: 'TSK-043', title: 'Build comparison dashboard template', status: 'pending', agent: null },
  { id: 'TSK-044', title: 'Set up weekly cron trigger', status: 'pending', agent: null },
  { id: 'TSK-045', title: 'Generate sample report for review', status: 'pending', agent: null },
  { id: 'TSK-035', title: 'Fix auth token refresh logic', status: 'completed', agent: 'Forge', completedAt: '2 hours ago' },
  { id: 'TSK-032', title: 'Configure monitoring alerts', status: 'completed', agent: 'Beacon', completedAt: '1 day ago' },
]

function ObjectivesTab() {
  const [objectives, setObjectives] = useState([
    { id: 'obj-1', type: 'active', ...OBJECTIVE },
    { id: 'obj-2', type: 'queued', title: 'Build investor dashboard with real-time metrics', taskCount: 8, estDuration: '2-3 days' },
    { id: 'obj-3', type: 'queued', title: 'Automate weekly email digest for stakeholders', taskCount: 5, estDuration: '1-2 days' },
    { id: 'obj-4', type: 'queued', title: 'Set up CI/CD pipeline for staging deployments', taskCount: 6, estDuration: '1 day' },
    { id: 'obj-5', type: 'queued', title: 'Migrate user auth to passkey-based login', taskCount: 12, estDuration: '4-5 days' },
    { id: 'obj-6', type: 'queued', title: 'Create API documentation with interactive examples', taskCount: 7, estDuration: '2 days' },
  ])
  const [dragIdx, setDragIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const cardRefs = useRef({})
  const draggingRef = useRef(false)

  const handleGrab = useCallback((startIdx) => {
    if (draggingRef.current) return
    draggingRef.current = true
    setDragIdx(startIdx)

    const onMove = (e) => {
      const y = e.clientY || (e.touches && e.touches[0]?.clientY)
      if (y == null) return

      let closest = null
      let closestDist = Infinity
      Object.entries(cardRefs.current).forEach(([i, el]) => {
        if (!el) return
        const idx = parseInt(i)
        if (idx === startIdx) return
        const rect = el.getBoundingClientRect()
        const mid = rect.top + rect.height / 2
        const dist = Math.abs(y - mid)
        if (dist < closestDist) {
          closestDist = dist
          closest = idx
        }
      })
      setDragOverIdx(closest)
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)

      setDragOverIdx(overIdx => {
        if (overIdx !== null && overIdx !== startIdx) {
          setObjectives(prev => {
            const copy = [...prev]
            const [item] = copy.splice(startIdx, 1)
            copy.splice(overIdx, 0, item)
            return copy
          })
        }
        return null
      })
      setDragIdx(null)
      draggingRef.current = false
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [])

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-24 sm:pt-[20vh] pb-32">
      {/* Greeting + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[18px] font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {(() => {
              const h = new Date().getHours()
              return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
            })()}, Eythan
          </h1>
          <div className="text-[12px] text-[var(--color-muted)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96] bg-[var(--color-bg-alt)] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)]"
          >
            <PixelIcon name="clock" size={13} aria-hidden="true" />
            Pause
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)] transition-[background-color,color,scale] duration-150 cursor-pointer active:scale-[0.96]"
          >
            <PixelIcon name="settings" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Draggable objectives list */}
      <div className="mb-6">
        {objectives.map((obj, idx) => {
          const queuePosition = objectives.slice(0, idx + 1).filter(o => o.type === 'queued').length
          const isDragging = dragIdx === idx
          const isTarget = dragOverIdx === idx && dragIdx !== null && dragIdx !== idx

          return (
            <div key={obj.id} className="pb-3">
              {/* Drop zone — shows above this card when dragging over it */}
              <div
                className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: isTarget ? 80 : 0,
                  opacity: isTarget ? 1 : 0,
                }}
              >
                <div className="mb-3 rounded-2xl border-2 border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 flex items-center justify-center"
                  style={{ height: 72 }}
                >
                  <span className="text-[12px] text-[var(--color-accent)]/60 font-medium">Drop here</span>
                </div>
              </div>

              {/* Card */}
              <div
                ref={el => cardRefs.current[idx] = el}
                onMouseDown={(e) => { if (!e.target.closest('button')) { e.preventDefault(); handleGrab(idx) } }}
                onTouchStart={(e) => { if (!e.target.closest('button')) { handleGrab(idx) } }}
                onDragStart={(e) => e.preventDefault()}
                className="transition-[opacity,transform] duration-200 ease-out select-none"
                style={{
                  cursor: isDragging ? 'grabbing' : dragIdx !== null ? 'default' : 'grab',
                  opacity: isDragging ? 0.25 : 1,
                  transform: isDragging ? 'scale(0.97)' : 'scale(1)',
                }}
              >
                {obj.type === 'active' ? (
                  <ObjectiveCard
                    title={obj.title}
                    percent={obj.progress}
                    completed={obj.completed}
                    inProgress={obj.inProgress}
                    review={obj.review}
                    pending={obj.pending}
                    total={obj.total}
                    agents={obj.agents}
                  />
                ) : (
                  <QueuedObjectiveCard
                    title={obj.title}
                    taskCount={obj.taskCount}
                    estDuration={obj.estDuration}
                    position={queuePosition}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

const AGENT_CHARS = {
  Scout: char1,
  Forge: char2,
  Relay: char3,
  Cipher: char4,
  Beacon: char5,
}

function AgentsTab() {
  const [showAll, setShowAll] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterBy, setFilterBy] = useState('all')
  const [liveEvents, setLiveEvents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [jumpingAgent, setJumpingAgent] = useState(null)
  const [wavingAgent, setWavingAgent] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [officeMode, setOfficeMode] = useState(false)
  const [officeTransition, setOfficeTransition] = useState('idle')
  // idle → feedExit → charsCenter → charsTeleport → boardEnter → active
  const [teleportedOut, setTeleportedOut] = useState([]) // agents that have teleported out
  const [teleportedIn, setTeleportedIn] = useState([])   // agents that have appeared on board
  const canvasRef = useRef(null)
  const agentsRef = useRef(null)

  // Live events every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const template = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)]
      const event = { ...template(agent), time: 'Just now', id: Date.now() }
      setLiveEvents(prev => [event, ...prev.map(e => ({
        ...e,
        time: e.time === 'Just now' ? '30s ago'
          : e.time === '30s ago' ? '1m ago'
          : e.time === '1m ago' ? '2m ago'
          : e.time === '2m ago' ? '3m ago'
          : e.time,
      }))])
      // Make the agent react
      setAnimKey(k => k + 1) // force re-mount
      if (event.needsReview) {
        setWavingAgent(agent)
        setJumpingAgent(null)
        setTimeout(() => setWavingAgent(null), 2000)
      } else {
        setJumpingAgent(agent)
        setWavingAgent(null)
        setTimeout(() => setJumpingAgent(null), 600)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!filterOpen) return
    const handleClick = () => setFilterOpen(false)
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  // Office mode transition — multi-phase animation
  const toggleOffice = () => {
    if (officeMode) {
      // Reverse: board out → chars appear back
      setOfficeTransition('exiting')
      agentsRef.current = null
      setTeleportedOut([])
      setTeleportedIn([])
      setTimeout(() => { setOfficeMode(false); setOfficeTransition('idle') }, 600)
    } else {
      // Phase 1: Feed slides down and out
      setOfficeTransition('feedExit')

      // Phase 2: Characters move to center (after feed exits)
      setTimeout(() => setOfficeTransition('charsCenter'), 400)

      // Phase 3: Characters teleport out one by one (random order)
      const shuffled = [...AGENTS].sort(() => Math.random() - 0.5)
      setTimeout(() => {
        setOfficeTransition('charsTeleport')
        shuffled.forEach((name, i) => {
          setTimeout(() => {
            setTeleportedOut(prev => [...prev, name])
          }, i * 300)
        })
      }, 900)

      // Phase 4: Board enters after all chars have teleported
      const totalTeleportTime = 900 + shuffled.length * 300 + 200
      setTimeout(() => {
        setOfficeMode(true)
        setOfficeTransition('boardEnter')
      }, totalTeleportTime)

      // Phase 5: Active — chars spawn on board
      setTimeout(() => {
        setOfficeTransition('active')
      }, totalTeleportTime + 400)
    }
  }

  // Isometric office canvas
  useEffect(() => {
    if (!officeMode || officeTransition !== 'active') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const cw = window.innerWidth
    const ch = window.innerHeight - 60
    canvas.width = cw * dpr
    canvas.height = ch * dpr
    canvas.style.width = cw + 'px'
    canvas.style.height = ch + 'px'
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = false

    const GRID = 10
    const TW = Math.floor((cw * 0.9) / GRID)
    const TH = Math.floor(TW * 0.42)
    const ox = cw / 2
    // Position so bottom point is just below viewport
    // Bottom point y = oy + GRID * TH, so oy = ch - GRID * TH + some overflow
    const oy = ch - GRID * TH + TH * 2

    const toIso = (gx, gy) => ({
      x: (gx - gy) * (TW / 2) + ox,
      y: (gx + gy) * (TH / 2) + oy,
    })

    // Load character images
    const charImgs = {}
    const loadPromises = AGENTS.map(name => new Promise(resolve => {
      const img = new Image()
      img.src = AGENT_CHARS[name]
      img.onload = () => { charImgs[name] = img; resolve() }
    }))

    // Spawn positions spread across the board
    const spawnSpots = [
      { gx: 2, gy: 4 }, { gx: 5, gy: 2 }, { gx: 7, gy: 5 }, { gx: 4, gy: 7 }, { gx: 6, gy: 3 },
    ]

    if (!agentsRef.current) {
      const shuffled = [...AGENTS].sort(() => Math.random() - 0.5)
      agentsRef.current = shuffled.map((name, i) => ({
        name, gx: spawnSpots[i].gx, gy: spawnSpots[i].gy,
        tx: spawnSpots[i].gx, ty: spawnSpots[i].gy,
        timer: Math.random() * 200 + 100,
        spawned: false, spawnDelay: i * 25, spawnTick: 0, spawnScale: 0, spawnOffsetY: -60,
      }))
    }

    let animId

    Promise.all(loadPromises).then(() => {
      function update() {
        const agents = agentsRef.current
        if (!agents) return
        agents.forEach(a => {
          if (!a.spawned) {
            a.spawnTick++
            if (a.spawnTick > a.spawnDelay) {
              a.spawned = true
              a.spawnScale = 0
            }
            return
          }
          if (a.spawnScale < 1) a.spawnScale = Math.min(a.spawnScale + 0.06, 1)
          if (a.spawnOffsetY < 0) a.spawnOffsetY = Math.min(a.spawnOffsetY + 4, 0)
          a.timer--
          if (a.timer <= 0) {
            a.tx = 3 + Math.floor(Math.random() * (GRID - 5))
            a.ty = 3 + Math.floor(Math.random() * (GRID - 5))
            a.timer = Math.random() * 250 + 100
          }
          const speed = 0.02
          if (Math.abs(a.tx - a.gx) > 0.05) a.gx += Math.sign(a.tx - a.gx) * speed
          else a.gx = a.tx
          if (Math.abs(a.ty - a.gy) > 0.05) a.gy += Math.sign(a.ty - a.gy) * speed
          else a.gy = a.ty
        })
      }

      function draw() {
        ctx.clearRect(0, 0, cw, ch)
        for (let gy = 0; gy < GRID; gy++) {
          for (let gx = 0; gx < GRID; gx++) {
            const { x, y } = toIso(gx, gy)
            ctx.beginPath()
            ctx.moveTo(x, y); ctx.lineTo(x + TW / 2, y + TH / 2); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW / 2, y + TH / 2)
            ctx.closePath()
            ctx.fillStyle = (gx + gy) % 2 === 0 ? '#F0EDE8' : '#E8E5E0'
            ctx.fill()
            ctx.strokeStyle = '#DDD8D2'
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
        const agents = [...(agentsRef.current || [])].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy))
        agents.forEach(a => {
          if (!a.spawned) return
          const { x, y } = toIso(a.gx, a.gy)
          const img = charImgs[a.name]
          if (!img) return
          const s = Math.min(a.spawnScale, 1)
          const oy2 = a.spawnOffsetY || 0
          const charH = TW * 0.45
          const charW = (img.width / img.height) * charH
          const dy = y + oy2
          ctx.globalAlpha = s
          // Blur effect during spawn via shadow trick
          if (s < 1) {
            ctx.filter = `blur(${Math.round((1 - s) * 6)}px)`
          }
          ctx.fillStyle = 'rgba(0,0,0,0.06)'
          ctx.beginPath()
          ctx.ellipse(x, dy + charH * 0.15, TW * 0.15 * s, TH * 0.15 * s, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.drawImage(img, x - charW / 2, dy - charH + charH * 0.15, charW, charH)
          ctx.filter = 'none'
          if (s >= 0.5) {
            const fontSize = Math.max(8, TW * 0.06)
            ctx.font = `600 ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            const textW = ctx.measureText(a.name).width
            const padX = 6, padY = 3
            const bgX = x - textW / 2 - padX
            const bgY = dy - charH - fontSize - padY - 2
            const bgW = textW + padX * 2
            const bgH = fontSize + padY * 2
            const r = 4
            // Rounded rect background
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff'
            ctx.beginPath()
            ctx.moveTo(bgX + r, bgY)
            ctx.lineTo(bgX + bgW - r, bgY)
            ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r)
            ctx.lineTo(bgX + bgW, bgY + bgH - r)
            ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH)
            ctx.lineTo(bgX + r, bgY + bgH)
            ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r)
            ctx.lineTo(bgX, bgY + r)
            ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY)
            ctx.closePath()
            ctx.fill()
            // Border
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#E8E8E8'
            ctx.lineWidth = 1
            ctx.stroke()
            // Shadow (subtle)
            ctx.shadowColor = 'rgba(0,0,0,0.06)'
            ctx.shadowBlur = 4
            ctx.shadowOffsetY = 2
            ctx.fill()
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0
            // Text
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-heading').trim() || '#171717'
            ctx.fillText(a.name, x, bgY + padY + fontSize - 1)
          }
          ctx.globalAlpha = 1
        })
      }

      function loop() { update(); draw(); animId = requestAnimationFrame(loop) }
      loop()
    })

    return () => { if (animId) cancelAnimationFrame(animId) }
  }, [officeMode, officeTransition])

  const allFeed = [...liveEvents, ...FEED]
  const filteredFeed = allFeed.filter(item => {
    if (item.type === 'collapse') return showAll ? false : true
    if (!showAll && ['assign', 'tag', 'closed'].includes(item.type)) return false
    if (filterBy === 'tasks' && !['task', 'file', 'assign', 'closed'].includes(item.type)) return false
    if (filterBy === 'reviews' && item.type !== 'review') return false
    if (filterBy === 'comments' && !['comment', 'review'].includes(item.type)) return false
    if (selectedAgent && item.agent !== selectedAgent) return false
    return true
  })

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-20 pb-32">
      {/* Office view toggle */}
      <div className="flex justify-center mb-12 relative z-40">
        <button
          type="button"
          onClick={toggleOffice}
          className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] px-4 py-2 rounded-xl transition-[background-color,color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex items-center gap-2"
        >
          <PixelIcon name="grid" size={14} aria-hidden="true" />
          {officeMode ? 'List View' : 'Office View'}
        </button>
      </div>

      {/* Office canvas view */}
      {officeMode && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          style={{
            opacity: (officeTransition === 'boardEnter' || officeTransition === 'active') ? 1 : 0,
            scale: (officeTransition === 'boardEnter' || officeTransition === 'active') ? '1' : '0.95',
            transition: 'opacity 0.5s ease-out, scale 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: officeTransition === 'active' ? 'auto' : 'none',
            top: 60,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}

      {/* Characters with office background */}
      <div style={{ height: 'calc(35vh - 180px)' }} />
      <div className="relative mb-8 transition-opacity duration-500" style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        opacity: (officeMode && officeTransition === 'active') ? 0 : 1,
        display: officeMode && officeTransition === 'active' ? 'none' : undefined,
      }}>
        {/* Background art — tiled horizontally */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none transition-opacity duration-500"
          style={{
            height: 300,
            backgroundImage: 'url(/bg_art.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom center',
            backgroundSize: 'auto 100%',
            imageRendering: 'pixelated',
            opacity: officeTransition !== 'idle' ? 0 : 0.32,
          }}
          aria-hidden="true"
        />
      <div
        className="relative z-10 flex items-end justify-between pt-8 -mb-8 transition-[transform,opacity] duration-500 ease-out max-w-[1080px] mx-auto px-20"
        style={{
          transform: 'translateY(0)',
          opacity: officeMode ? 0 : 1,
          pointerEvents: officeMode ? 'none' : 'auto',
          position: officeMode && officeTransition === 'active' ? 'absolute' : 'relative',
          left: officeMode && officeTransition === 'active' ? '-9999px' : undefined,
        }}
      >
        {AGENTS.map(name => {
          const hasTeleported = teleportedOut.includes(name)
          return (
          <button
            key={name}
            type="button"
            onClick={() => officeTransition === 'idle' && setSelectedAgent(selectedAgent === name ? null : name)}
            className={`flex flex-col-reverse items-center gap-2 cursor-pointer group transition-all duration-300 ease-out ${
              selectedAgent && selectedAgent !== name ? 'opacity-30' : ''
            } ${hasTeleported ? 'opacity-0 -translate-y-20 blur-sm' : ''}`}
            style={{ transitionDuration: hasTeleported ? '400ms' : '150ms' }}
          >
            <div className="relative" key={`${name}-${(jumpingAgent === name || wavingAgent === name) ? animKey : 0}`}>
              {wavingAgent === name && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--color-nav)] text-white text-[10px] font-medium whitespace-nowrap animate-[fadeIn_0.15s_ease-out] shadow-lg z-10">
                  Review please! 👋
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--color-nav)]" />
                </div>
              )}
              <img
                src={AGENT_CHARS[name]}
                alt={name}
                className={`h-28 w-auto transition-[scale,filter] duration-150 ease-out group-hover:scale-110 group-active:scale-95 ${
                  selectedAgent === name ? 'scale-110' : ''
                } ${jumpingAgent === name ? 'animate-[agentJump_0.5s_ease-out]' : ''} ${wavingAgent === name ? 'animate-[agentWave_0.4s_ease-in-out_infinite]' : ''}`}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-surface)] shadow-sm ${selectedAgent === name ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'}`} style={{ outline: '1px solid var(--color-border)' }}>{name}</span>
          </button>
          )
        })}
      </div>
      </div>

      {/* Activity section — hidden in office mode */}
      <div style={{
        opacity: (officeTransition !== 'idle') ? 0 : 1,
        transform: (officeTransition !== 'idle') ? 'translateY(40px)' : 'translateY(0)',
        transition: 'opacity 0.3s ease-in, transform 0.3s ease-in',
        pointerEvents: (officeTransition !== 'idle') ? 'none' : 'auto',
        display: officeMode && officeTransition === 'active' ? 'none' : undefined,
      }}>

      {/* Selected agent info */}
      {selectedAgent && (
        <div className="px-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AgentDot name={selectedAgent} size={20} />
            <span className="text-[13px] font-medium text-[var(--color-heading)]">Showing activity for {selectedAgent}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAgent(null)}
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Activity feed */}
      <div className="px-6">
        <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)] mb-2">
          <h2 className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Activity Log</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={showAll}
              onClick={() => setShowAll(prev => !prev)}
              className="flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded-lg"
            >
              <span className="text-[13px] text-[var(--color-muted)]">Show all activity</span>
              <span className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showAll ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} aria-hidden="true">
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${showAll ? 'translate-x-4' : ''}`} />
              </span>
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Filter activity"
                onClick={() => setFilterOpen(prev => !prev)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${filterOpen || filterBy !== 'all' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-alt)] text-[var(--color-muted)]'}`}
              >
                <PixelIcon name="sliders" size={16} aria-hidden="true" />
              </button>
              <div
                style={{
                  transformOrigin: 'top right',
                  scale: filterOpen ? '1' : '0.85',
                  opacity: filterOpen ? 1 : 0,
                  filter: filterOpen ? 'blur(0px)' : 'blur(8px)',
                  transition: filterOpen
                    ? 'scale 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease-out, filter 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)'
                    : 'scale 0.15s cubic-bezier(0.4, 0, 1, 1), opacity 0.12s ease-in, filter 0.15s cubic-bezier(0.4, 0, 1, 1)',
                  pointerEvents: filterOpen ? 'auto' : 'none',
                }}
                className="absolute top-full right-0 mt-2 z-50"
                onMouseDown={e => e.stopPropagation()}
              >
                <div className="rounded-[16px] bg-[var(--color-nav)] py-2 px-2 w-44" role="menu" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">Filter by</div>
                  {[
                    { id: 'all', label: 'All activity' },
                    { id: 'tasks', label: 'Tasks' },
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'comments', label: 'Comments' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      role="menuitem"
                      onClick={() => { setFilterBy(opt.id); setFilterOpen(false) }}
                      className={`w-full text-left px-2.5 py-2 text-[13px] rounded-xl transition-[color,background-color] duration-150 cursor-pointer ${
                        filterBy === opt.id ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6">
        {filteredFeed.map((item, i) => {
          const isLast = i === filteredFeed.length - 1

          if (item.type === 'collapse') {
            return (
              <div key={i} className="relative flex items-center gap-3 py-3">
                <div className="absolute left-[13px] top-0 bottom-0 w-px bg-[var(--color-border)]" aria-hidden="true" />
                <div className="relative z-10 w-7 h-7 rounded-full bg-[var(--color-bg)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border)]">
                  <PixelIcon name="chevrons-vertical" size={12} className="text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-[13px] text-[var(--color-accent)] font-medium cursor-pointer hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded bg-transparent border-none p-0"
                >
                  {item.text}
                </button>
              </div>
            )
          }

          const hasCard = !!item.detail

          return (
            <div
              key={i}
              className={`relative flex gap-3 py-3 group ${!hasCard ? 'cursor-pointer' : ''}`}
              style={!hasCard ? { borderRadius: 12 } : undefined}
              {...(!hasCard ? { role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() } } : {})}
            >
              {!hasCard && (
                <div className="absolute -inset-x-2 -inset-y-0.5 rounded-xl bg-[var(--color-bg-alt)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100" aria-hidden="true" />
              )}
              {!isLast && <div className="absolute left-[13px] top-0 bottom-0 w-px bg-[var(--color-border)]" aria-hidden="true" />}
              <div className="absolute left-[13px] top-0 h-3 w-px bg-[var(--color-border)]" aria-hidden="true" />
              <div className="relative z-10">
                <ActionIcon icon={item.icon} iconColor={item.iconColor} iconBg={item.iconBg} />
              </div>
              <div className="relative z-10 flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <AgentDot name={item.agent} size={24} />
                  <span className="text-[13px] text-[var(--color-body)]">{item.content}</span>
                  <span className="text-[12px] text-[var(--color-muted)] flex-shrink-0">· {item.time}</span>
                  {!hasCard && (
                    <span className="ml-auto flex items-center gap-1 text-[12px] text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 flex-shrink-0" aria-hidden="true">
                      Go <PixelIcon name="arrow-right" size={12} aria-hidden="true" />
                    </span>
                  )}
                </div>
                {item.detail && (
                  <div className={`mt-2.5 ml-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 ${item.needsReview || item.mention ? 'flex items-start gap-4' : ''}`}>
                    <p className="text-[13px] text-[var(--color-body)] leading-relaxed flex-1">{item.detail}</p>
                    {item.needsReview && (
                      <button type="button" className="px-4 py-1.5 text-[12px] font-semibold rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out active:scale-[0.96] flex-shrink-0"
                        style={{ backgroundColor: 'color-mix(in srgb, oklch(0.82 0.18 80) 25%, var(--color-surface))', color: 'var(--color-heading)' }}>
                        Review
                      </button>
                    )}
                    {item.mention && (
                      <button type="button" className="px-4 py-1.5 text-[12px] font-semibold text-[var(--color-heading)] bg-[var(--color-bg-alt)] rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out hover:bg-[var(--color-border)] active:scale-[0.96] flex-shrink-0">
                        Go
                      </button>
                    )}
                  </div>
                )}
                {item.thread && (
                  <button type="button" className="mt-2.5 ml-8 flex items-center gap-2 cursor-pointer group/thread bg-transparent border-none p-0 rounded">
                    <PixelIcon name="repeat" size={12} className="text-[var(--color-muted)]" aria-hidden="true" />
                    <div className="flex -space-x-1.5">
                      {item.thread.agents.map(n => <AgentDot key={n} name={n} size={20} className="ring-2 ring-[var(--color-bg)]" />)}
                    </div>
                    <span className="text-[12px] text-[var(--color-muted)] group-hover/thread:text-[var(--color-heading)] transition-colors">
                      View {item.thread.count} more replies
                    </span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}

function PlaceholderTab({ tab }) {
  return (
    <div className="max-w-[540px] mx-auto px-4 sm:px-6 pt-24 pb-32">
      <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
          <PixelIcon name={tab.icon} size={28} className="text-[var(--color-accent)]" aria-hidden="true" />
        </div>
        <div className="text-[18px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {tab.label}
        </div>
        <div className="text-[13px] text-[var(--color-muted)]">
          Content coming soon
        </div>
      </div>
    </div>
  )
}

export default function NavExperiment() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return ['dashboard', 'objectives', 'agents', 'files', 'chat'].includes(hash) ? hash : 'dashboard'
  })

  // Persist tab in URL hash
  useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])
  const [currentSlug, setCurrentSlug] = useState('acme-ai-labs')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => { document.title = 'Nav Experiment — AgentValley' }, [])

  // Cmd+K to open search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const currentStartup = STARTUPS.find(s => s.slug === currentSlug)

  const addItems = [
    { label: 'New Objective', icon: 'bullseye-arrow', iconColor: 'text-[var(--color-accent)]', onAction: () => console.log('New Objective') },
    { label: 'Upload File', icon: 'upload', iconColor: 'text-[oklch(0.77_0.12_253.03)]', onAction: () => console.log('Upload File') },
    { label: 'Invite Agent', icon: 'robot', iconColor: 'text-[oklch(0.77_0.12_253.03)]', onAction: () => console.log('Invite Agent') },
    { label: 'Post a Role', icon: 'target', iconColor: 'text-[oklch(0.82_0.18_80)]', onAction: () => console.log('Post Role') },
  ]

  const activeTabData = TABS.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">
      <TopBar
        currentStartup={currentStartup}
        startups={STARTUPS}
        onStartupChange={setCurrentSlug}
        avatarUrl="/profile_pic.jpg"
        profile={{ name: 'Eythan D\'Amico', email: 'eythan@agentvalley.com' }}
        profileItems={[
          { label: 'Settings', icon: 'settings', onAction: () => console.log('Settings') },
          { label: 'Support', icon: 'message', onAction: () => console.log('Support') },
          { label: 'Feedback', icon: 'mail', onAction: () => console.log('Feedback') },
          { label: 'Log out', icon: 'logout', danger: true, onAction: () => console.log('Logout') },
        ]}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAction={(item) => console.log('Command:', item)}
      />

      <main>
        {activeTab === 'objectives' ? (
          <ObjectivesTab />
        ) : activeTab === 'agents' ? (
          <AgentsTab />
        ) : activeTab === 'dashboard' ? (
          <OverviewTab startup={currentStartup} onTabChange={setActiveTab} />
        ) : (
          <PlaceholderTab tab={activeTabData} />
        )}
      </main>

      <BottomNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        addItems={addItems}
        avatarUrl="/profile_pic.jpg"
        profile={{ name: 'Eythan D\'Amico', email: 'eythan@agentvalley.com' }}
        profileItems={[
          { label: 'Settings', icon: 'settings', onAction: () => console.log('Settings') },
          { label: 'Support', icon: 'message', onAction: () => console.log('Support') },
          { label: 'Feedback', icon: 'mail', onAction: () => console.log('Feedback') },
          { label: 'Log out', icon: 'logout', danger: true, onAction: () => console.log('Logout') },
        ]}
        chatTabId="chat"
        onSendMessage={(msg) => console.log('Send:', msg)}
      />
    </div>
  )
}
