import { useState, useEffect, useRef } from 'react'
import NumberFlow from '@number-flow/react'
import PixelIcon from '../components/PixelIcon'
import { BottomNav, TopBar, AgentDot, CommandPalette } from '../components/ui'

const TABS = [
  { id: 'dashboard', label: 'Startup Overview', icon: 'home' },
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
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

function OverviewTab({ startup }) {
  const [showAll, setShowAll] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterBy, setFilterBy] = useState('all')
  const [liveEvents, setLiveEvents] = useState([])
  const [paused, setPaused] = useState(false)
  const [reviewDismissed, setReviewDismissed] = useState(false)
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
      <div className="relative z-10 rounded-2xl bg-[var(--color-surface)] shadow-lg shadow-black/5" style={{ outline: '1px solid rgba(0,0,0,0.08)', outlineOffset: '0px' }}>
        {/* Current objective */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Current Objective</div>
              <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                Scrape competitor pricing &amp; generate weekly analysis report
              </h2>
            </div>
            <NumberFlow value={objPercent} suffix="%" className="hidden sm:block text-[32px] font-bold leading-none tabular-nums text-[var(--color-heading)] flex-shrink-0 -mt-1" style={{ fontFamily: 'var(--font-display)' }} />
          </div>

          {/* Task progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--color-body)] flex items-center gap-2">
              Task Progress
              <NumberFlow value={objPercent} suffix="%" className="sm:hidden text-[13px] font-bold tabular-nums text-[var(--color-heading)]" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] hidden sm:block">Started 2h ago · ETA 45min</span>
          </div>
          <div
            className="flex h-2.5 rounded-full overflow-hidden bg-[var(--color-border)] mb-3"
            role="progressbar"
            aria-valuenow={objPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Objective progress"
          >
            <div className="bg-[var(--color-accent)] rounded-l-full" style={{ width: mounted ? objCompletedPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s' }} />
            <div className="bg-[#60A5FA]" style={{ width: mounted ? objInProgressPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s' }} />
            <div className="bg-amber-400" style={{ width: mounted ? objReviewPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' }} />
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={objCompleted} className="text-[11px] tabular-nums" /> completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={objInProgress} className="text-[11px] tabular-nums" /> in progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={objReview} className="text-[11px] tabular-nums" /> needs review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={objPending} className="text-[11px] tabular-nums" /> pending</span>
            </div>
          </div>

          {/* Active agents */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <AgentDot name="Scout" size={24} className="ring-2 ring-[var(--color-surface)]" />
                <AgentDot name="Forge" size={24} className="ring-2 ring-[var(--color-surface)]" />
              </div>
              <span className="text-[11px] text-[var(--color-muted)]">Scout &amp; Forge are working on this</span>
            </div>
            <span className={`text-[11px] font-medium ${paused ? 'text-amber-500' : 'text-[var(--color-accent)]'}`}>
              {paused ? 'Paused' : 'Active'}
            </span>
          </div>

          {/* Review banner */}
          {objReview > 0 && !reviewDismissed && (
            <div className="mt-4 -mx-6 -mb-5 px-5 py-3.5 bg-amber-50 rounded-b-2xl border-t border-amber-200/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-[12px] text-amber-800">
                  {objReview} {objReview === 1 ? 'agent is' : 'agents are'} waiting for review of their work
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setReviewDismissed(true)}
                  className="text-[11px] text-amber-600/70 hover:text-amber-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-[12px] font-semibold text-amber-800 bg-amber-200/60 rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out hover:bg-amber-200 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                >
                  Review
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Stats shelf — tucked under the objective card */}
      <div className="relative -mt-4 rounded-b-2xl px-6 pt-7 pb-5 mb-8" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-alt) 50%, var(--color-bg))' }}>
        {/* Desktop */}
        <div className="hidden sm:flex items-end gap-0">
          <div className="flex items-end gap-5 pr-8 flex-1">
            <div className="flex-shrink-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Total Tasks:</div>
              <NumberFlow value={totalTasks} className="text-[28px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }} />
            </div>
            <div className="flex-1"><Sparkline data={[3, 5, 4, 7, 6, 8, 12, 10, 11, 9, 12]} width={200} /></div>
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
            <div className="flex -space-x-1.5 pb-1">
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
      <div className="mt-6">
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
      <div>
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
                        className="px-4 py-1.5 text-[12px] font-semibold text-amber-800 bg-amber-100 rounded-lg cursor-pointer transition-[background-color,scale] duration-150 ease-out hover:bg-amber-200 active:scale-[0.96] flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
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
  const [activeTab, setActiveTab] = useState('dashboard')
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
    { label: 'Upload File', icon: 'upload', iconColor: 'text-[#60A5FA]', onAction: () => console.log('Upload File') },
    { label: 'Invite Agent', icon: 'robot', iconColor: 'text-blue-500', onAction: () => console.log('Invite Agent') },
    { label: 'Post a Role', icon: 'target', iconColor: 'text-amber-500', onAction: () => console.log('Post Role') },
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
        {activeTab === 'dashboard' ? (
          <OverviewTab startup={currentStartup} />
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
