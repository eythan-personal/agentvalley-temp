import { useState, useEffect, useRef, useMemo } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable, isSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import NumberFlow from '@number-flow/react'
import PixelIcon from '../components/PixelIcon'
import { BottomNav, TopBar, AgentDot, CommandPalette, ObjectiveCard, QueuedObjectiveCard, ReviewSheet } from '../components/ui'
import objectiveCompleteSfx from '../assets/objective-complete.mp3'
import { TABS, STARTUPS, AGENTS, FEED, LIVE_EVENTS, CONFETTI_COLORS, OBJECTIVE, TASKS, LOADING_STEPS } from './navExperimentData'
import StartupsTab from './StartupsTab'
import AgentsTab from './AgentsTab'

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

// Timeline action icon — matches AgentDot size (28px)
function ActionIcon({ icon, iconColor, iconBg }) {
  return (
    <div className={`w-7 h-7 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 ring-2 ring-[var(--color-bg)]`}>
      <PixelIcon name={icon} size={12} className={iconColor} aria-hidden="true" />
    </div>
  )
}

const CARD_SHADOW = '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)'
const CARD_SHADOW_HOVER = '0 14px 20px -4px rgba(0,0,0,0.18), 0 6px 8px -5px rgba(0,0,0,0.15)'

function HoverCard({ children, className = '', onClick, overflow, style: extraStyle }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`rounded-2xl bg-[var(--color-surface)] p-5 flex flex-col ${onClick ? 'cursor-pointer' : ''} ${overflow === 'visible' ? 'overflow-visible' : ''} ${className}`}
      style={{
        boxShadow: hovered ? CARD_SHADOW_HOVER : CARD_SHADOW,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
        ...extraStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

function CurrentObjectiveCard({ percent, title, subtitle, paused, total, animate, onSeeAll }) {
  return (
    <HoverCard onClick={onSeeAll}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Current Objective</div>
        <button type="button" className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer" onClick={onSeeAll}>
          See All &rsaquo;
        </button>
      </div>
      <div className="flex items-baseline gap-1 mt-3">
        <NumberFlow value={percent} className="text-[48px] font-bold leading-none tabular-nums text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }} />
        <span className="text-[20px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>%</span>
      </div>
      <div className="mt-auto">
        <div className="mb-4 min-w-0">
          <div className="text-[13px] font-semibold text-[var(--color-heading)] truncate">{title}</div>
          <div className="text-[11px] text-[var(--color-muted)]">{subtitle}</div>
        </div>
        <div className="mb-3">
          <div className="h-2 rounded-full overflow-hidden bg-[var(--color-border)]">
            <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: animate ? `${percent}%` : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s' }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
            {paused ? 'Paused' : 'Running'}
          </span>
          <span>{total} tasks · ETA 45min</span>
        </div>
      </div>
    </HoverCard>
  )
}

function ActiveAgentsCard({ agents, percent, animate, onSeeAll }) {
  return (
    <HoverCard onClick={onSeeAll} overflow="visible">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Active Agents</div>
        <button type="button" className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer">
          See All &rsaquo;
        </button>
      </div>
      <div className="flex items-baseline gap-1 mt-3">
        <NumberFlow value={animate ? percent : 0} className="text-[48px] font-bold leading-none tabular-nums text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }} />
        <span className="text-[20px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>%</span>
      </div>
      <div className="mt-auto">
        <div className="flex items-center gap-3 mb-4">
          {agents.map((name, i) => (
            <AgentDot key={name} name={name} size={28} inactive={i >= 3} />
          ))}
        </div>
        <div className="space-y-1.5 text-[11px] text-[var(--color-muted)]">
          <div className="flex justify-between"><span>Avg. Task Time</span><span className="text-[var(--color-heading)] font-medium tabular-nums">14 min</span></div>
          <div className="flex justify-between"><span>Avg. Tasks Completed</span><span className="text-[var(--color-heading)] font-medium tabular-nums">8.4</span></div>
        </div>
      </div>
    </HoverCard>
  )
}

const REVIEW_ITEMS = [
  { id: 1, task: 'TSK-038', title: 'Payment service security review', description: 'Pull request #127 touches the payment service and needs a security review before merging. 3 files changed, 47 additions.', agent: 'Cipher', type: 'code' },
  { id: 2, task: 'TSK-045', title: 'Weekly competitor pricing analysis', description: 'Generated the first weekly analysis report. Need human sign-off on data accuracy and recommendations before automating.', agent: 'Scout', type: 'markdown' },
]

const COMPLETED_ITEMS = [
  { id: 1, title: 'Set up CI/CD pipeline & deploy staging', agents: ['Forge', 'Relay', 'Cipher'], duration: '3d 4h' },
]

function ThisWeekCard({ animate, state = 'default', onStateChange, onReview }) {
  const [reviewItems, setReviewItems] = useState(REVIEW_ITEMS)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [completedItems, setCompletedItems] = useState(COMPLETED_ITEMS)

  const currentReview = reviewItems[reviewIndex]
  const currentCompleted = completedItems[0]

  const dismissReview = () => {
    const next = reviewItems.filter((_, i) => i !== reviewIndex)
    if (next.length === 0) {
      setReviewItems(REVIEW_ITEMS)
      setReviewIndex(0)
      onStateChange?.('default')
    } else {
      setReviewItems(next)
      setReviewIndex(Math.min(reviewIndex, next.length - 1))
    }
  }

  const dismissCompleted = () => {
    const next = completedItems.slice(1)
    if (next.length === 0) {
      setCompletedItems(COMPLETED_ITEMS)
      onStateChange?.('default')
    } else {
      setCompletedItems(next)
    }
  }

  if (state === 'review' && currentReview) {
    return (
      <HoverCard style={{ background: 'radial-gradient(100% 59.71% at 100% 0%, rgba(240, 185, 11, 0.18) 0%, rgba(227, 27, 70, 0.00) 100%), #FFF' }}>
        {/* Header badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(240, 185, 11, 0.2)' }}>
              <PixelIcon name="alert" size={14} style={{ color: 'oklch(0.72 0.18 80)' }} aria-hidden="true" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(240, 185, 11, 0.15)', color: 'oklch(0.55 0.15 80)' }}>
              Needs Review
            </span>
          </div>
          <div className="flex items-center gap-1">
            {reviewItems.length > 1 && (
              <>
                <button type="button" onClick={() => setReviewIndex((reviewIndex - 1 + reviewItems.length) % reviewItems.length)} className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="chevron-left" size={12} aria-hidden="true" />
                </button>
                <span className="text-[10px] font-mono tabular-nums text-[var(--color-muted)]">{reviewIndex + 1}/{reviewItems.length}</span>
                <button type="button" onClick={() => setReviewIndex((reviewIndex + 1) % reviewItems.length)} className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="chevron-right" size={12} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
        {/* Description */}
        <div className="mb-2">
          <div className="text-[14px] font-semibold text-[var(--color-heading)] leading-snug mb-2" style={{ fontFamily: 'var(--font-display)' }}>{currentReview.title}</div>
          <p className="text-[13px] text-[var(--color-body)] leading-relaxed">{currentReview.description}</p>
        </div>
        {/* Actions */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <button type="button" onClick={dismissReview} className="flex-1 h-10 rounded-xl text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] cursor-pointer transition-[color,scale] duration-150 ease-out active:scale-[0.96]" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
            Dismiss
          </button>
          <button type="button" onClick={() => onReview?.(currentReview.type || 'code')} className="flex-1 h-10 rounded-xl text-[12px] font-semibold text-[var(--color-heading)] cursor-pointer transition-[background-color,scale] duration-150 ease-out active:scale-[0.96]" style={{ backgroundColor: 'color-mix(in srgb, oklch(0.82 0.18 80) 25%, var(--color-surface))' }}>
            Review Now
          </button>
        </div>
      </HoverCard>
    )
  }

  if (state === 'completed' && currentCompleted) {
    return (
      <HoverCard>
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-accent)]">Objective Complete</div>
        </div>
        <div className="mt-3">
          <div className="text-[13px] font-semibold text-[var(--color-heading)] mb-2">{currentCompleted.title}</div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
            <span>{currentCompleted.agents.join(', ')}</span>
            <span>·</span>
            <span>{currentCompleted.duration}</span>
          </div>
        </div>
        <div className="mt-auto pt-4 flex items-center gap-2">
          <button type="button" className="flex-1 h-8 rounded-lg text-[12px] font-semibold bg-[var(--color-accent)] text-[#0d2000] cursor-pointer transition-[background-color,scale] duration-150 active:scale-[0.96] hover:brightness-110">
            View Output
          </button>
          <button type="button" onClick={dismissCompleted} className="h-8 px-3 rounded-lg text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] cursor-pointer transition-colors" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
            Dismiss
          </button>
        </div>
      </HoverCard>
    )
  }

  // Default: This Week
  return (
    <HoverCard>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">This Week</div>
      </div>
      <div className="mt-auto">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-[var(--color-heading)]">Objectives Completed</span>
              <span className="text-[11px] font-semibold tabular-nums text-[var(--color-heading)]"><NumberFlow value={animate ? 3 : 0} /></span>
            </div>
            <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">CI/CD pipeline, monitoring alerts, and auth token refresh shipped this week</p>
          </div>
          <div className="border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-[var(--color-heading)]">Tasks Shipped</span>
              <span className="text-[11px] font-semibold tabular-nums text-[var(--color-heading)]"><NumberFlow value={animate ? 28 : 0} /></span>
            </div>
            <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">Across 3 objectives with an average completion time of 14 minutes per task</p>
          </div>
        </div>
      </div>
    </HoverCard>
  )
}

function OverviewTab({ startup, onTabChange }) {
  const [showAll, setShowAll] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterBy, setFilterBy] = useState('all')
  const [liveEvents, setLiveEvents] = useState([])
  const [paused, setPaused] = useState(false)
  const [reviewDismissed, setReviewDismissed] = useState(true)
  const [objCelebration, setObjCelebration] = useState(null)
  const [weekCardState, setWeekCardState] = useState('default') // 'default' | 'review' | 'completed'
  const [devOpen, setDevOpen] = useState(false)
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const [reviewSheetType, setReviewSheetType] = useState('code') // 'code' | 'markdown'
  const taskCountRef = useRef(42)

  // Add a new event every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const template = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)]
      const event = { ...template(agent), time: 'Just now', id: Date.now() }
      setLiveEvents(prev => [event, ...prev.slice(0, 19).map(e => ({
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
      {/* Header bar + controls */}
      <div className="flex items-center gap-2 mb-5">
        {/* Title bar */}
        <div className="flex-1 min-w-0 px-0 h-10 flex items-center">
          <h1 className="text-[22px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Overview</h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 h-10">
          <button
            type="button"
            onClick={() => setPaused(prev => !prev)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[12px] font-medium cursor-pointer transition-[color,scale] duration-150 ease-out active:scale-[0.96] text-[var(--color-muted)] hover:text-[var(--color-heading)]"
            style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
          >
            <PixelIcon name={paused ? 'power' : 'clock'} size={13} aria-hidden="true" />
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-[color,scale] duration-150 cursor-pointer active:scale-[0.96]"
            style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
          >
            <PixelIcon name="settings" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Objective + Completed cards — side by side */}
      <div className="hidden flex-col sm:flex-row gap-3 relative z-10 mb-3">
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
          className="sm:flex-[3]"
        />
        {/* Completed objectives summary */}
        <div className="sm:flex-[1] rounded-2xl bg-[var(--color-surface)] px-6 py-5 flex flex-col items-center justify-center text-center" style={{ outline: '1px solid var(--color-border)', outlineOffset: '0px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)' }}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">Completed</div>
          <NumberFlow value={mounted ? 3 : 0} className="text-[42px] font-bold leading-none tabular-nums text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }} />
          <span className="text-[11px] text-[var(--color-muted)] mt-1">this week</span>
          <div className="mt-auto pt-3 border-t border-[var(--color-border)] w-full text-center">
            <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={mounted ? 2 : 0} className="text-[11px] tabular-nums" /> queued</span>
          </div>
        </div>
      </div>

      {/* Three info cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-[5]">
        <CurrentObjectiveCard
          percent={objPercent}
          title="Scrape competitor pricing"
          subtitle="generate weekly analysis report"
          paused={paused}
          total={objTotal}
          animate={mounted}
          onSeeAll={() => onTabChange?.('objectives')}
        />
        <ActiveAgentsCard agents={AGENTS} percent={60} animate={mounted} onSeeAll={() => onTabChange?.('agents')} />
        <ThisWeekCard animate={mounted} state={weekCardState} onStateChange={setWeekCardState} onReview={(type) => { setReviewSheetType(type); setReviewSheetOpen(true) }} />
      </div>

      {/* Stats shelf — hidden for now */}
      <div className="hidden relative -mt-4 rounded-b-2xl px-6 pt-7 pb-5 mb-4 z-[1]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 30%, var(--color-bg-alt))' }}>
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
      <div className="mt-6 px-6">
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
                <div className="rounded-[20px] bg-[var(--color-nav)] py-2 px-2 w-44" role="menu" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
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

                {/* Detail card — special treatment for completed objectives */}
                {item.detail && item.type === 'objective-complete' ? (
                  <div
                    className="mt-2.5 ml-8 rounded-xl p-4 cursor-pointer transition-[box-shadow,transform] duration-200 active:scale-[0.99]"
                    style={{ background: 'radial-gradient(100% 59.71% at 100% 0%, rgba(159, 232, 112, 0.18) 0%, rgba(159, 232, 112, 0.00) 100%), #FFF', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}
                    onClick={() => setObjCelebration(item.objective)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setObjCelebration(item.objective) } }}
                  >
                    <p className="text-[13px] text-[var(--color-body)] leading-relaxed">{item.detail}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-accent)]/15">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {item.objective.agents.map(name => (
                            <AgentDot key={name} name={name} size={20} className="ring-2 ring-[var(--color-surface)]" />
                          ))}
                        </div>
                        <span className="text-[11px] text-[var(--color-muted)]">{item.objective.agents.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <PixelIcon name="clipboard" size={11} aria-hidden="true" />
                          {item.objective.tasksCompleted}/{item.objective.tasksCompleted}
                        </span>
                        <span className="flex items-center gap-1">
                          <PixelIcon name="clock" size={11} aria-hidden="true" />
                          {item.objective.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : item.detail && (
                  <div className={`mt-2.5 ml-8 rounded-xl bg-[var(--color-surface)] p-4 ${item.needsReview || item.mention ? 'flex items-start gap-4' : ''}`} style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}>
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

      {/* Dev controls flyout */}
      <div className="fixed bottom-20 left-4 z-50">
        <button
          type="button"
          onClick={() => setDevOpen(prev => !prev)}
          className="w-8 h-8 rounded-lg bg-[var(--color-nav)] text-white flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-95 transition-[transform,filter] duration-150"
          style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.3)' }}
          title="Dev controls"
        >
          <PixelIcon name="settings" size={14} aria-hidden="true" />
        </button>
        <div
          className="absolute bottom-full left-0 mb-2"
          style={{
            opacity: devOpen ? 1 : 0,
            scale: devOpen ? '1' : '0.9',
            filter: devOpen ? 'blur(0px)' : 'blur(4px)',
            transformOrigin: 'bottom left',
            transition: devOpen
              ? 'opacity 0.2s ease-out, scale 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), filter 0.2s ease-out'
              : 'opacity 0.1s ease-in, scale 0.1s ease-in, filter 0.1s ease-in',
            pointerEvents: devOpen ? 'auto' : 'none',
          }}
        >
          <div className="rounded-2xl bg-[var(--color-nav)] p-4 w-56" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)' }}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-3">Dev Controls</div>
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mt-2">Week Card State</div>
              {['default', 'review', 'completed'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setWeekCardState(s)}
                  className={`w-full text-left px-3 py-2 text-[12px] rounded-xl transition-colors cursor-pointer ${weekCardState === s ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  {s === 'default' ? 'This Week' : s === 'review' ? 'Needs Review' : 'Completed Objective'}
                </button>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => { setReviewSheetType('code'); setReviewSheetOpen(true) }}
                  className="w-full text-left px-3 py-2 text-[12px] rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Review: Code
                </button>
                <button
                  type="button"
                  onClick={() => { setReviewSheetType('markdown'); setReviewSheetOpen(true) }}
                  className="w-full text-left px-3 py-2 text-[12px] rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Review: Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setObjCelebration({ title: 'Set up CI/CD pipeline & deploy staging', tasksCompleted: 8, agents: ['Forge', 'Relay', 'Cipher'], duration: '3d 4h' })}
                  className="w-full text-left px-3 py-2 text-[12px] rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Trigger Celebration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review bottom sheet */}
      <ReviewSheet open={reviewSheetOpen} onClose={() => setReviewSheetOpen(false)} type={reviewSheetType} />

      {/* ── Objective Complete Celebration Overlay ── */}
      {objCelebration && <ObjectiveCelebration objective={objCelebration} onClose={() => setObjCelebration(null)} />}
    </div>
  )
}

function ConfettiCanvas({ active, originRef }) {
  const canvasRef = useRef(null)
  const particles = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // Burst from the checkmark position
    let cx = w / 2
    let cy = h / 2
    if (originRef?.current) {
      const rect = originRef.current.getBoundingClientRect()
      cx = rect.left + rect.width / 2
      cy = rect.top + rect.height / 2
    }
    particles.current = Array.from({ length: 120 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const speed = 8 + Math.random() * 18
      const size = 3 + Math.random() * 14
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (6 + Math.random() * 10), // strong upward bias
        w: size,
        h: size * (0.2 + Math.random() * 0.8),
        r: Math.random() * 360,
        rv: (Math.random() - 0.5) * 15,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        opacity: 1,
        gravity: 0.18 + Math.random() * 0.12,
        drag: 0.985 + Math.random() * 0.01,
      }
    })

    let startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      ctx.clearRect(0, 0, w, h)

      let alive = false
      for (const p of particles.current) {
        if (p.opacity <= 0) continue
        alive = true

        p.vx *= p.drag
        p.vy *= p.drag
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.r += p.rv

        // Fade out after 1.5s
        if (elapsed > 1500) {
          p.opacity -= 0.03
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.r * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (alive) {
        raf.current = requestAnimationFrame(animate)
      }
    }

    // Small delay so it syncs with the check icon appearing
    const timer = setTimeout(() => {
      raf.current = requestAnimationFrame(animate)
    }, 280)

    return () => {
      clearTimeout(timer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}

function ObjectiveCelebration({ objective, onClose }) {
  const [phase, setPhase] = useState(0) // 0=enter, 1=visible, 2=exit
  const overlayRef = useRef(null)
  const checkRef = useRef(null)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase(1)))
    // Play sound
    const audio = new Audio(objectiveCompleteSfx)
    audio.volume = 0.5
    audio.play().catch(() => {})
    // Lock scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = () => {
    setPhase(2)
    setTimeout(onClose, 400)
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      onClick={handleClose}
      style={{
        opacity: phase === 1 ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Objective completed"
    >
      {/* Dark overlay with blur */}
      <div className="absolute inset-0 bg-black/70" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, oklch(0.35 0.15 145 / 0.6) 0%, oklch(0.3 0.12 145 / 0.25) 35%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* Confetti — full screen, origin from checkmark */}
      <ConfettiCanvas active={phase === 1} originRef={checkRef} />

      {/* Content card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 sm:mx-0"
        style={{
          transform: phase === 1 ? 'scale(1)' : phase === 0 ? 'scale(0.3)' : 'scale(0.9)',
          opacity: phase === 1 ? 1 : 0,
          filter: phase === 1 ? 'blur(0px)' : 'blur(8px)',
          transition: phase === 2
            ? 'transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in, filter 0.25s ease-in'
            : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s, opacity 0.3s ease-out 0.05s, filter 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s',
        }}
      >
        <div className="rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center">
            {/* Check icon */}
            <div ref={checkRef} className="relative w-16 h-16 mx-auto mb-5">
              <div
                className="absolute inset-0 rounded-full bg-[var(--color-accent)] flex items-center justify-center"
                style={{
                  boxShadow: '0 0 40px oklch(0.7 0.2 145 / 0.4), 0 0 80px oklch(0.6 0.15 145 / 0.2)',
                  transform: phase === 1 ? 'scale(1)' : 'scale(0.5)',
                  transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s',
                }}
              >
                <PixelIcon name="check" size={28} className="text-[#0d2000]" aria-hidden="true" />
              </div>
            </div>

            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2">Objective Complete</div>
            <h2 className="text-[20px] font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {objective.title}
            </h2>
            <p className="text-[13px] text-white/50 mt-2 leading-relaxed">All tasks finished successfully. Pipeline deploys on merge to main, staging auto-updates from develop.</p>
          </div>

          {/* Action */}
          <div className="px-6 pb-6 flex justify-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-[13px] text-white/60 hover:text-white/90 bg-white/10 hover:bg-white/15 px-5 py-2 rounded-xl cursor-pointer transition-[background-color,color] duration-150"
            >
              View Files
            </button>
          </div>
        </div>
      </div>

      {/* Tap to close */}
      <div
        className="absolute bottom-8 left-0 right-0 text-center text-[12px] text-white/40 z-10 pointer-events-none"
        style={{
          opacity: phase === 1 ? 1 : 0,
          transition: 'opacity 0.4s ease-out 0.5s',
        }}
      >
        tap to close
      </div>
    </div>
  )
}

// ─── Objectives Tab ─────────────────────────────────────────────────────────


function LoadingObjectiveCard({ title }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 1200)
    return () => clearInterval(stepInterval)
  }, [])

  // Mini dot matrix (3x4) — CSS-animated, no re-renders
  const dotCols = 4
  const dotRows = 3
  const totalDots = dotCols * dotRows

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] " style={{ boxShadow: CARD_SHADOW }}>
      <div className="px-6 py-5">
        {/* Match ObjectiveCard header */}
        <div className="flex items-start justify-between gap-6 mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Current Objective</div>
            <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          </div>
          <div className="hidden sm:block text-[32px] font-bold leading-none tabular-nums text-[var(--color-border)] flex-shrink-0 -mt-1 animate-pulse" style={{ fontFamily: 'var(--font-display)' }}>—%</div>
        </div>

        {/* Match ObjectiveCard progress section */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-body)] flex items-center gap-2">Task Progress</span>
          <div className="h-3 w-32 rounded bg-[var(--color-border)] animate-pulse" />
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-border)] mb-3 overflow-hidden">
          <div className="h-full w-full animate-[shimmer_1.5s_infinite]" style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-alt) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }} />
        </div>
        {/* Match ObjectiveCard legend */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
            <div className="h-3 w-16 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
            <div className="h-3 w-16 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
            <div className="h-3 w-20 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
            <div className="h-3 w-14 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
        </div>

        {/* Match ObjectiveCard agent row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            {/* Radial progress */}
            <svg className="w-6 h-6 flex-shrink-0 -rotate-90" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2" />
              <circle
                cx="12" cy="12" r="10"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${((step + 1) / LOADING_STEPS.length) * 62.8} 62.8`}
                style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
              />
            </svg>
            <span className="text-[11px] text-[var(--color-muted)]">{LOADING_STEPS[step]}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Dot matrix loader — pure CSS animation */}
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${dotCols}, 1fr)` }}>
              {Array.from({ length: totalDots }, (_, i) => {
                const col = i % dotCols
                return (
                  <span
                    key={i}
                    className="rounded-[1px] animate-[dotWave_0.84s_ease-in-out_infinite]"
                    style={{
                      width: 3,
                      height: 3,
                      backgroundColor: 'var(--color-border)',
                      animationDelay: `${col * 0.12}s`,
                    }}
                  />
                )
              })}
            </div>
            <span className="text-[11px] text-[var(--color-muted)]">Thinking</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableObjective({ obj, idx, queuePosition, loading, analyzing, onClick }) {
  const isActive = obj.type === 'active'
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])
  const { ref, isDragging } = useSortable({
    id: obj.id,
    index: idx,
    transition: { duration: 350, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  })

  return (
    <div ref={ref} onClick={() => !isDragging && onClick?.(obj)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="rounded-2xl" style={{ opacity: isDragging ? 0.4 : 1, cursor: 'pointer', boxShadow: hovered ? CARD_SHADOW_HOVER : (isActive ? CARD_SHADOW : '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)'), transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out' }}>
      {isActive ? (
        loading ? (
          <LoadingObjectiveCard title={obj.title} />
        ) : (
          <ObjectiveCard
            title={obj.title}
            description={obj.description}
            percent={(!mounted || analyzing) ? 0 : (obj.progress || 0)}
            completed={(!mounted || analyzing) ? 0 : (obj.completed || 0)}
            inProgress={(!mounted || analyzing) ? 0 : (obj.inProgress || 2)}
            review={(!mounted || analyzing) ? 0 : (obj.review || 0)}
            pending={(!mounted || analyzing) ? 0 : (obj.pending || 0)}
            total={(!mounted || analyzing) ? 0 : (obj.total || obj.taskCount || 0)}
            agents={obj.agents || ['Scout', 'Forge']}
            analyzing={analyzing}
            animate={mounted && !analyzing}
          />
        )
      ) : (
        <QueuedObjectiveCard
          title={obj.title}
          description={obj.description}
          taskCount={obj.taskCount}
          estDuration={obj.estDuration}
          position={queuePosition}
        />
      )}
    </div>
  )
}

function ObjectivesTab() {
  const [objectives, setObjectives] = useState([
    { id: 'obj-1', type: 'active', ...OBJECTIVE },
    { id: 'obj-2', type: 'queued', title: 'Build investor dashboard with real-time metrics', description: 'Create a live dashboard showing MRR, burn rate, runway, and user growth with auto-refreshing charts for investor meetings.', taskCount: 8, estDuration: '2-3 days' },
    { id: 'obj-3', type: 'queued', title: 'Automate weekly email digest for stakeholders', description: 'Generate and send a weekly summary email with key metrics, completed objectives, and upcoming priorities.', taskCount: 5, estDuration: '1-2 days' },
    { id: 'obj-4', type: 'queued', title: 'Set up CI/CD pipeline for staging deployments', description: 'Configure GitHub Actions to auto-deploy to staging on PR merge, with preview environments for each branch.', taskCount: 6, estDuration: '1 day' },
    { id: 'obj-5', type: 'queued', title: 'Migrate user auth to passkey-based login', description: 'Replace password-based auth with WebAuthn passkeys, including migration flow for existing users and fallback options.', taskCount: 12, estDuration: '4-5 days' },
    { id: 'obj-6', type: 'queued', title: 'Create API documentation with interactive examples', description: 'Build an OpenAPI spec with auto-generated docs, runnable code samples, and a sandbox environment for testing endpoints.', taskCount: 7, estDuration: '2 days' },
  ])
  const [loadingObjective, setLoadingObjective] = useState(false)
  const [analyzingObjective, setAnalyzingObjective] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const workingTasks = useMemo(() => TASKS.filter(t => t.status === 'working'), [])
  const pendingTasks = useMemo(() => TASKS.filter(t => t.status === 'pending'), [])
  const completedTasks = useMemo(() => TASKS.filter(t => t.status === 'completed'), [])

  const handleDragEnd = (event) => {
    if (event.canceled) return
    const { source } = event.operation
    if (!isSortable(source)) return

    const fromIdx = source.initialIndex
    const toIdx = source.index
    if (fromIdx === toIdx) return

    setObjectives(prev => {
      const copy = [...prev]
      const [item] = copy.splice(fromIdx, 1)
      copy.splice(toIdx, 0, item)
      // Position 0 is always active, rest are queued
      const updated = copy.map((obj, i) => ({
        ...obj,
        type: i === 0 ? 'active' : 'queued',
      }))

      // If position 0 has a different objective than before, show loading state
      if (updated[0].id !== prev[0].id) {
        setLoadingObjective(true)
        setTimeout(() => {
          setLoadingObjective(false)
          // If the new active objective has no stats, generate them
          setObjectives(prev => {
            const active = prev[0]
            if (!active.progress && active.progress !== 0) {
              const total = active.taskCount || 8
              const completed = Math.floor(Math.random() * 2)
              const inProg = 2
              const rev = Math.floor(Math.random() * 2)
              const pend = total - completed - inProg - rev
              return [{ ...active, progress: Math.round(((completed + inProg * 0.5) / total) * 100), completed, inProgress: inProg, review: rev, pending: Math.max(pend, 0), total, agents: ['Scout', 'Forge'] }, ...prev.slice(1)]
            }
            return prev
          })
          setAnalyzingObjective(true)
          setTimeout(() => setAnalyzingObjective(false), 3000)
        }, 5500)
      }

      return updated
    })
  }

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-24 sm:pt-[20vh] pb-32">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-5">
        {/* Back button — outside the bar */}
        {selectedObjective && (
          <button
            type="button"
            onClick={() => { if (selectedTask) { setSelectedTask(null) } else { setSelectedObjective(null) } }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)] transition-[background-color,color,scale] duration-150 cursor-pointer active:scale-[0.96] flex-shrink-0"
          >
            <PixelIcon name="arrow-left" size={14} aria-hidden="true" />
          </button>
        )}

        {/* Title / breadcrumb bar */}
        <div className="flex-1 min-w-0 px-0 h-10 flex items-center">
          {!selectedObjective ? (
            <h1 className="text-[22px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Objectives</h1>
          ) : (
            <nav className="flex items-center gap-2 text-[12px] min-w-0" style={{ fontFamily: 'var(--font-display)' }}>
              <button
                type="button"
                onClick={() => { setSelectedObjective(null); setSelectedTask(null) }}
                className="cursor-pointer transition-colors whitespace-nowrap text-[var(--color-muted)] hover:text-[var(--color-heading)]"
              >
                Objectives
              </button>
              <span className="text-[var(--color-muted)]">/</span>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className={`cursor-pointer transition-colors truncate max-w-[250px] ${!selectedTask ? 'text-[var(--color-heading)] font-semibold' : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'}`}
              >
                {selectedObjective.title}
              </button>
              {selectedTask && (
                <>
                  <span className="text-[var(--color-muted)]">/</span>
                  <span className="text-[var(--color-heading)] font-semibold whitespace-nowrap">{selectedTask.id}</span>
                </>
              )}
              {/* Task count at end of bar */}
              {selectedObjective && !selectedTask && (
                <span className="ml-auto text-[11px] text-[var(--color-muted)] tabular-nums whitespace-nowrap">{TASKS.length} tasks</span>
              )}
            </nav>
          )}
        </div>

        {/* Controls — only on top level */}
        {!selectedObjective && (
        <div className="flex items-center gap-2 flex-shrink-0 h-10">
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[12px] font-medium cursor-pointer transition-[color,scale] duration-150 ease-out active:scale-[0.96] text-[var(--color-muted)] hover:text-[var(--color-heading)]"
            style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
          >
            <PixelIcon name="clock" size={13} aria-hidden="true" />
            Pause
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-[color,scale] duration-150 cursor-pointer active:scale-[0.96]"
            style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
          >
            <PixelIcon name="settings" size={14} aria-hidden="true" />
          </button>
        </div>
        )}
      </div>

      {selectedObjective ? (
        <>
          {/* Queued objective detail */}
          {selectedObjective.type !== 'active' && (
            <QueuedObjectiveCard
              title={selectedObjective.title}
              description={selectedObjective.description}
              taskCount={selectedObjective.taskCount}
              estDuration={selectedObjective.estDuration}
              position={0}
              className="mb-6"
            />
          )}

          {/* Tasks */}
          {selectedTask ? (
            <>
              {/* Task header card */}
              <div className="rounded-2xl bg-[var(--color-surface)] p-6 mb-4" style={{ boxShadow: CARD_SHADOW }}>
                {/* Title + status */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">{selectedTask.id}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-md" style={{
                        backgroundColor: selectedTask.status === 'working' ? 'color-mix(in srgb, oklch(0.77 0.12 253.03) 12%, var(--color-surface))' : selectedTask.status === 'completed' ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))' : 'var(--color-bg-alt)',
                        color: selectedTask.status === 'working' ? 'oklch(0.77 0.12 253.03)' : selectedTask.status === 'completed' ? 'var(--color-accent)' : 'var(--color-muted)',
                      }}>{selectedTask.status === 'working' ? 'Working' : selectedTask.status === 'completed' ? 'Completed' : 'Pending'}</span>
                      {selectedTask.duration && <span className="text-[10px] text-[var(--color-muted)]">· {selectedTask.duration}</span>}
                    </div>
                    <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{selectedTask.title}</h2>
                  </div>
                  {selectedTask.agent && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AgentDot name={selectedTask.agent} size={28} thinking={selectedTask.status === 'working'} />
                      <div>
                        <div className="text-[12px] font-semibold text-[var(--color-heading)]">{selectedTask.agent}</div>
                        <div className="text-[10px] text-[var(--color-muted)]">{selectedTask.status === 'working' ? 'Working' : 'Assigned'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-4">{selectedTask.description || selectedTask.detail || 'No description provided.'}</p>

                {/* Meta row + feedback */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted)]">
                    {selectedTask.created && <span>Created {selectedTask.created}</span>}
                    {selectedTask.assigned && <span>· Assigned {selectedTask.assigned}</span>}
                    {selectedTask.pickedUp && <span>· Started {selectedTask.pickedUp}</span>}
                  </div>
                  {selectedTask.votes && (
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
                        <PixelIcon name="thumbs-up" size={13} aria-hidden="true" /> {selectedTask.votes.up}
                      </button>
                      <button type="button" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
                        <PixelIcon name="thumbs-down" size={13} aria-hidden="true" /> {selectedTask.votes.down}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Two column layout — updates + files */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_300px] gap-4">
                {/* Status updates */}
                <div className="rounded-2xl bg-[var(--color-surface)] p-5" style={{ boxShadow: CARD_SHADOW }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4">
                    Status Updates ({selectedTask.updates?.length || 0})
                  </div>
                  {selectedTask.updates?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTask.updates.map((update, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <AgentDot name={update.agent} size={28} />
                            {i < selectedTask.updates.length - 1 && <div className="w-px flex-1 bg-[var(--color-border)] mt-2" />}
                          </div>
                          <div className="pb-4">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[13px] font-semibold text-[var(--color-heading)]">{update.agent}</span>
                              <span className="text-[11px] text-[var(--color-muted)]">{update.time}</span>
                            </div>
                            <p className="text-[13px] text-[var(--color-body)] leading-relaxed">{update.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <PixelIcon name="message" size={20} className="text-[var(--color-border)] mx-auto mb-2" aria-hidden="true" />
                      <span className="text-[12px] text-[var(--color-muted)]">No status updates yet</span>
                    </div>
                  )}
                </div>

                {/* Files sidebar */}
                <div className="rounded-2xl bg-[var(--color-surface)] p-5" style={{ boxShadow: CARD_SHADOW }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4">
                    Files ({selectedTask.files?.length || 0})
                  </div>
                  {selectedTask.files?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-alt)] group cursor-pointer hover:bg-[var(--color-border)] transition-[background-color] duration-150">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
                              <PixelIcon name="folder" size={14} className="text-[var(--color-muted)]" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-medium text-[var(--color-heading)] truncate">{file.name}</div>
                              <div className="text-[10px] text-[var(--color-muted)]">{file.size}</div>
                            </div>
                          </div>
                          {file.status === 'complete' ? (
                            <button type="button" className="text-[10px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-[color] duration-150 text-[var(--color-muted)] hover:text-[var(--color-heading)]" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
                              Download
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <svg className="w-3 h-3 animate-spin" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="var(--color-border)" strokeWidth="2" />
                                <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span className="text-[10px] text-[var(--color-muted)]">In progress</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <PixelIcon name="folder" size={20} className="text-[var(--color-border)] mx-auto mb-2" aria-hidden="true" />
                      <span className="text-[12px] text-[var(--color-muted)]">No files yet</span>
                    </div>
                  )}

                </div>
              </div>
            </>
          ) : selectedObjective.type === 'active' ? (
            <div className="space-y-6">
              {/* Working */}
              {workingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'oklch(0.77 0.12 253.03)' }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      Working ({workingTasks.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {workingTasks.map(task => (
                      <div key={task.id} onClick={() => setSelectedTask(task)} className="rounded-2xl bg-[var(--color-surface)] p-5 cursor-pointer transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5" style={{ boxShadow: CARD_SHADOW }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[var(--color-muted)]">{task.id}</span>
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-md" style={{ backgroundColor: 'color-mix(in srgb, oklch(0.77 0.12 253.03) 12%, var(--color-surface))', color: 'oklch(0.77 0.12 253.03)' }}>Working</span>
                        </div>
                        <h3 className="text-[14px] font-semibold text-[var(--color-heading)] mb-2">{task.title}</h3>
                        {task.detail && <p className="text-[12px] text-[var(--color-muted)] mb-3 leading-relaxed">{task.detail}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                          <div className="flex items-center gap-2">
                            <AgentDot name={task.agent} size={22} thinking={true} />
                            <span className="text-[12px] text-[var(--color-body)]">{task.agent}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[var(--color-muted)]">
                            <button type="button" className="flex items-center gap-1 text-[12px] hover:text-[var(--color-heading)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-up" size={14} aria-hidden="true" /> {task.votes?.up || 0}
                            </button>
                            <button type="button" className="flex items-center gap-1 text-[12px] hover:text-[var(--color-heading)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-down" size={14} aria-hidden="true" /> {task.votes?.down || 0}
                            </button>
                            <button type="button" className="hover:text-[var(--color-heading)] transition-colors cursor-pointer">
                              <PixelIcon name="message" size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending */}
              {pendingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-muted)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      Up Next ({pendingTasks.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pendingTasks.map(task => (
                      <div key={task.id} onClick={() => setSelectedTask(task)} className="rounded-2xl bg-[var(--color-surface)] p-5 cursor-pointer transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5" style={{ boxShadow: CARD_SHADOW }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[var(--color-muted)]">{task.id}</span>
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-md bg-[var(--color-bg-alt)] text-[var(--color-muted)]">Pending</span>
                        </div>
                        <h3 className="text-[14px] font-semibold text-[var(--color-heading)] mb-2">{task.title}</h3>
                        <span className="text-[11px] text-[var(--color-muted)] flex items-center gap-1.5">
                          <PixelIcon name="clock" size={12} aria-hidden="true" /> Awaiting assignment
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      Completed ({completedTasks.length})
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface)] divide-y divide-[var(--color-border)]" style={{ boxShadow: CARD_SHADOW }}>
                    {completedTasks.map(task => (
                      <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--color-bg-alt)] transition-colors">
                        <PixelIcon name="check" size={16} className="text-[var(--color-accent)] flex-shrink-0" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-semibold text-[var(--color-heading)]">{task.title}</h3>
                          <span className="text-[11px] text-[var(--color-muted)]">{task.agent}</span>
                        </div>
                        <AgentDot name={task.agent} size={24} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--color-surface)] p-8 text-center" style={{ boxShadow: CARD_SHADOW }}>
              <PixelIcon name="clock" size={28} className="text-[var(--color-muted)] mx-auto mb-3" />
              <div className="text-[13px] text-[var(--color-muted)]">Tasks will be generated when this objective becomes active</div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Draggable objectives list */}
          <DragDropProvider onDragEnd={handleDragEnd}>
            <div className="mb-6 space-y-3">
              {objectives.map((obj, idx) => {
                const queuePosition = objectives.slice(0, idx + 1).filter(o => o.type === 'queued').length
                return (
                  <SortableObjective key={obj.id} obj={obj} idx={idx} queuePosition={queuePosition} loading={idx === 0 && loadingObjective} analyzing={idx === 0 && analyzingObjective} onClick={(o) => setSelectedObjective(o)} />
                )
              })}
            </div>
          </DragDropProvider>
        </>
      )}

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
    return ['dashboard', 'objectives', 'agents', 'startups', 'files', 'chat'].includes(hash) ? hash : 'dashboard'
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
        ) : activeTab === 'startups' ? (
          <StartupsTab />
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
