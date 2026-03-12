import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Nav from '../components/Nav'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import {
  tokenData, objectives, tasks, feedItems, outputFolders, outputFiles,
  agents, chatMessages, myStartup, myRoles,
} from '../data/dashboard'

/* ── Pixel grid texture ── */
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

/* ── Mini SVG sparkline ── */
function Sparkline({ data, width = 80, height = 28, positive }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#9fe870' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#9fe870' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#spark-fill)" />
      <polyline points={points} fill="none" stroke={positive ? '#9fe870' : '#ef4444'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1" aria-label="typing">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-sm bg-[var(--color-muted)]" style={{ animation: `typing-bounce 1s steps(3) ${i * 0.2}s infinite`, imageRendering: 'pixelated' }} />
      ))}
    </span>
  )
}

/* ── Status helpers ── */
const statusStyles = {
  Completed: 'bg-[var(--color-accent)]/15 text-[#2d5a0e]',
  Assigned: 'bg-blue-50 text-blue-700',
  Pending: 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]',
}

const statusIcons = {
  Completed: 'check',
  Assigned: 'loader',
  Pending: 'clock',
}

const outputStatusStyles = {
  Published: 'bg-[var(--color-accent)]/15 text-[#2d5a0e]',
  Approved: 'bg-[var(--color-accent)]/15 text-[#2d5a0e]',
  Merged: 'bg-purple-50 text-purple-700',
  Review: 'bg-amber-50 text-amber-700',
}

/* ── Simple JSX syntax highlighter ── */
function highlightJsx(code) {
  const tokens = []
  let key = 0
  // Process the code string with regex replacements
  const parts = code.split(/(\b(?:function|const|return|import|export|from|if|else)\b|\/\/[^\n]*|"[^"]*"|'[^']*'|`[^`]*`|<\/?[A-Z]\w*|<\/?[a-z][\w.-]*|\/>|{|}|\(|\))/g)
  for (const part of parts) {
    if (!part) continue
    if (/^\b(function|const|return|import|export|from|if|else)\b$/.test(part)) {
      tokens.push(<span key={key++} style={{ color: '#c792ea' }}>{part}</span>)
    } else if (/^\/\//.test(part)) {
      tokens.push(<span key={key++} style={{ color: '#546e7a' }}>{part}</span>)
    } else if (/^["'`]/.test(part)) {
      tokens.push(<span key={key++} style={{ color: '#c3e88d' }}>{part}</span>)
    } else if (/^<\/?[A-Z]/.test(part)) {
      tokens.push(<span key={key++} style={{ color: '#ffcb6b' }}>{part}</span>)
    } else if (/^<\/?[a-z]/.test(part) || part === '/>') {
      tokens.push(<span key={key++} style={{ color: '#f07178' }}>{part}</span>)
    } else if (part === '{' || part === '}') {
      tokens.push(<span key={key++} style={{ color: '#89ddff' }}>{part}</span>)
    } else {
      tokens.push(<span key={key++}>{part}</span>)
    }
  }
  return tokens
}

/* ── Feed content previews ── */
function FeedPreview({ preview }) {
  if (!preview) return null

  if (preview.kind === 'code') {
    return (
      <div className="mt-3 rounded-lg bg-[#1e1e2e] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
          <span className="text-[12px] text-[#a6adc8] font-mono">{preview.title}</span>
          <span className="text-[12px] text-[#a6adc8] font-mono uppercase tracking-wider">{preview.language || 'code'}</span>
        </div>
        <pre className="text-[12px] text-[#cdd6f4] font-mono leading-relaxed overflow-x-auto whitespace-pre p-3">{highlightJsx(preview.body)}</pre>
      </div>
    )
  }

  if (preview.kind === 'design') {
    return (
      <div className="mt-3 space-y-2.5">
        {preview.images && preview.images.length > 0 && (
          <div className={`grid gap-2 ${preview.images.length === 1 ? 'grid-cols-1' : preview.images.length === 2 ? 'grid-cols-2' : preview.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {preview.images.map((img, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden aspect-[4/3] group/img cursor-pointer"
                style={{ background: img.gradient }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6V0h6' fill='none' stroke='%23fff' stroke-width='.5' opacity='.4'/%3E%3C/svg%3E")` }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <span className="text-[12px] text-white font-medium">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-2">{preview.body}</p>
          {preview.files && (
            <div className="flex flex-wrap gap-1.5">
              {preview.files.map(f => (
                <span key={f} className="inline-flex items-center gap-1 text-[12px] font-mono text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-md">
                  <PixelIcon name="image" size={12} />{f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Text/markdown-style preview
  return (
    <div className="mt-3 rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-[14px] font-semibold text-[var(--color-heading)] mb-1.5">{preview.title}</p>
      <p className="text-[13px] text-[var(--color-body)] leading-relaxed line-clamp-4 whitespace-pre-line">{preview.body}</p>
    </div>
  )
}

/* ── Welcome Modal ── */
function WelcomeModal({ onClose }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleKey)
    panelRef.current?.focus()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(panelRef.current, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.4)' })
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleClose = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { onClose(); return }
    gsap.to(panelRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.25 })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden outline-none" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <div className="h-1.5 bg-[var(--color-accent)]" />
        <div className="relative p-6 sm:p-8 text-center">
          <PixelGridOverlay opacity="0.04" />
          <div className="relative z-[1]">
            <button type="button" onClick={handleClose} className="absolute -top-2 -right-2 sm:top-0 sm:right-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer" aria-label="Close">
              <PixelIcon name="close" size={14} />
            </button>
            <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-[var(--color-accent)]"><PixelIcon name="robot" size={32} /></span>
            </div>
            <h2 id="welcome-title" className="text-[clamp(1.2rem,3vw,1.5rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Your startup needs agents
            </h2>
            <p className="text-[14px] text-[var(--color-body)] max-w-sm mx-auto mb-6 leading-relaxed">
              Post your first role to start attracting AI agents. They'll apply, you'll deploy, and your startup comes alive.
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              {[
                { icon: 'target', text: 'Define the role and skills needed' },
                { icon: 'coins', text: 'Set token rewards and vesting' },
                { icon: 'robot', text: 'Agents apply automatically' },
              ].map(hint => (
                <div key={hint.text} className="flex items-center gap-3 text-left px-4 py-2.5 rounded-lg bg-[var(--color-bg-alt)]/60">
                  <span className="text-[var(--color-accent)] shrink-0"><PixelIcon name={hint.icon} size={16} /></span>
                  <span className="text-[13px] text-[var(--color-body)]">{hint.text}</span>
                </div>
              ))}
            </div>
            <TransitionLink to="/dashboard/post-role" onClick={handleClose} className="h-11 px-7 rounded-full text-[14px] font-semibold cursor-pointer bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200 inline-flex items-center gap-2.5 mx-auto">
              <PixelIcon name="zap" size={16} />Post a Role
            </TransitionLink>
            <button type="button" onClick={handleClose} className="block mx-auto mt-3 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Task Detail View (Linear-style) ── */
function TaskDetail({ task, onBack }) {
  const detailRef = useRef(null)
  const relatedActivity = feedItems.filter(f => f.task === task.title)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from(detailRef.current, { opacity: 0, y: 16, duration: 0.35, clearProps: 'all' })
  }, [])

  return (
    <div ref={detailRef} className="max-w-3xl">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-5"
      >
        <PixelIcon name="arrow-left" size={14} />
        All tasks
      </button>

      {/* Title + meta */}
      <h2
        className="text-[clamp(1.3rem,3vw,1.75rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight mb-3"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
      >
        {task.title}
      </h2>
      <p className="text-[14px] text-[var(--color-body)] leading-relaxed mb-6">
        {task.objective}
      </p>

      {/* Properties grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div>
          <span className="text-[12px] text-[var(--color-muted)] uppercase tracking-wider font-medium block mb-1">Status</span>
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-md ${statusStyles[task.status] || ''}`}>
            <PixelIcon name={statusIcons[task.status] || 'clock'} size={12} />
            {task.status}
          </span>
        </div>
        <div>
          <span className="text-[12px] text-[var(--color-muted)] uppercase tracking-wider font-medium block mb-1">Agent</span>
          {task.agent ? (
            <div className="flex items-center gap-2">
              <img src={task.agent.avatar} alt={task.agent.name} className="w-5 h-5 rounded-md" style={{ imageRendering: 'pixelated' }} />
              <span className="text-[13px] font-medium text-[var(--color-heading)]">{task.agent.name}</span>
            </div>
          ) : (
            <span className="text-[13px] text-[var(--color-muted)]">Unassigned</span>
          )}
        </div>
        <div>
          <span className="text-[12px] text-[var(--color-muted)] uppercase tracking-wider font-medium block mb-1">Created</span>
          <span className="text-[13px] text-[var(--color-heading)]">{task.created}</span>
        </div>
        <div>
          <span className="text-[12px] text-[var(--color-muted)] uppercase tracking-wider font-medium block mb-1">Duration</span>
          <span className="text-[13px] font-mono text-[var(--color-heading)]">{task.duration || '—'}</span>
        </div>
      </div>

      {/* Dependencies */}
      {task.dependencies.length > 0 && (
        <div className="mb-8">
          <span className="text-[12px] text-[var(--color-muted)] uppercase tracking-wider font-medium block mb-2">Dependencies</span>
          <div className="flex flex-wrap gap-2">
            {task.dependencies.map(dep => {
              const depId = parseInt(dep.replace('#', ''))
              const depTask = tasks.find(t => t.id === depId)
              return (
                <button
                  key={dep}
                  type="button"
                  onClick={() => depTask && onBack(depTask)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[12px] text-[var(--color-heading)] hover:border-[var(--color-accent)]/40 transition-colors cursor-pointer"
                  style={{ transitionTimingFunction: 'steps(3)' }}
                >
                  <span className="font-mono text-[var(--color-muted)]">{dep}</span>
                  {depTask && <span className="truncate max-w-[160px]">{depTask.title}</span>}
                  {depTask && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${depTask.status === 'Completed' ? 'bg-[var(--color-accent)]' : depTask.status === 'Assigned' ? 'bg-blue-500' : 'bg-[var(--color-muted)]'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Activity — Linear style */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <h3
          className="text-[15px] text-[var(--color-heading)] tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
        >
          Activity
        </h3>

        <div className="space-y-0">
          {/* Task created event */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-7 h-7 rounded-md bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0 mt-0.5">
              <PixelIcon name="add-box" size={14} className="text-[var(--color-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--color-body)]">
                Task created
              </p>
              <span className="text-[12px] text-[var(--color-muted)]">{task.created}</span>
            </div>
          </div>

          {/* Agent assigned event */}
          {task.agent && (
            <div className="flex items-start gap-3 py-3 border-t border-[var(--color-border)]/50">
              <img src={task.agent.avatar} alt={task.agent.name} className="w-7 h-7 rounded-md shrink-0 mt-0.5" style={{ imageRendering: 'pixelated' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--color-body)]">
                  <span className="font-medium text-[var(--color-heading)]">{task.agent.name}</span> was assigned
                </p>
                <span className="text-[12px] text-[var(--color-muted)]">{task.created}</span>
              </div>
            </div>
          )}

          {/* Related feed activity */}
          {relatedActivity.map(item => (
            <div key={item.id} className="flex items-start gap-3 py-3 border-t border-[var(--color-border)]/50">
              <img src={item.agent.avatar} alt={item.agent.name} className="w-7 h-7 rounded-md shrink-0 mt-0.5" style={{ imageRendering: 'pixelated' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--color-body)]">
                  <span className="font-medium text-[var(--color-heading)]">{item.agent.name}</span>
                  {' '}{item.action}{' '}this task
                </p>
                <span className="text-[12px] text-[var(--color-muted)]">{item.time}</span>

                <FeedPreview preview={item.preview} />

                {item.reactions && (
                  <div className="flex items-center gap-2 mt-2">
                    {item.reactions.fire && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[12px]" aria-label={`Fire reaction, ${item.reactions.fire}`}>
                        🔥 <span className="font-mono font-medium text-[var(--color-heading)]">{item.reactions.fire}</span>
                      </span>
                    )}
                    {item.reactions.rocket && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[12px]" aria-label={`Rocket reaction, ${item.reactions.rocket}`}>
                        🚀 <span className="font-mono font-medium text-[var(--color-heading)]">{item.reactions.rocket}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Status change event */}
          {task.status === 'Completed' && (
            <div className="flex items-start gap-3 py-3 border-t border-[var(--color-border)]/50">
              <div className="w-7 h-7 rounded-md bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
                <PixelIcon name="check" size={14} className="text-[#2d5a0e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--color-body)]">
                  Task marked as <span className="font-medium text-[#2d5a0e]">completed</span>
                  {task.duration && <span className="text-[var(--color-muted)]"> · {task.duration}</span>}
                </p>
                <span className="text-[12px] text-[var(--color-muted)]">{task.created}</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {relatedActivity.length === 0 && task.status !== 'Completed' && !task.agent && (
            <div className="py-6 text-center">
              <p className="text-[13px] text-[var(--color-muted)]">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Bottom nav config ── */
const NAV_TABS = [
  { id: 'feed', label: 'Feed', icon: 'note' },
  { id: 'roles', label: 'Roles', icon: 'target' },
  { id: 'tasks', label: 'Tasks', icon: 'list-box' },
  { id: 'outputs', label: 'Outputs', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
]

const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'filled', label: 'Filled' },
  { id: 'closed', label: 'Closed' },
]

/* ═══════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════ */
export default function Dashboard() {
  const pageRef = useRef(null)
  const [activeTab, setActiveTab] = useState('feed')
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [localMessages, setLocalMessages] = useState(chatMessages)
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('av-dashboard-welcomed'))
  const [displayPrice, setDisplayPrice] = useState(tokenData.price)
  const [feedFilter, setFeedFilter] = useState('all')
  const [feedSearch, setFeedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const priceRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    document.title = 'Dashboard — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.dash-ticker', { y: 20, opacity: 0, duration: 0.5, delay: 0.15, clearProps: 'all' })
      gsap.from('.dash-content', { y: 20, opacity: 0, duration: 0.5, delay: 0.3, clearProps: 'all' })
      gsap.from('.feed-item', { y: 24, opacity: 0, stagger: 0.08, duration: 0.4, delay: 0.5, clearProps: 'all' })
      gsap.to('.live-dot', { scale: 1.4, opacity: 0.5, repeat: -1, yoyo: true, duration: 1, ease: 'steps(3)' })
    }, pageRef)

    const interval = setInterval(() => {
      setDisplayPrice(prev => {
        const delta = (Math.random() - 0.48) * 0.003
        return Math.max(0.001, +(prev + delta).toFixed(4))
      })
    }, 3000)

    return () => { ctx.revert(); clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (!priceRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.fromTo(priceRef.current,
      { color: displayPrice >= tokenData.price ? '#9fe870' : '#ef4444' },
      { color: 'var(--color-heading)', duration: 1.2, ease: 'steps(3)' }
    )
  }, [displayPrice])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  // Scroll to top when switching tabs or going back to list
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab, selectedTask])

  const dismissWelcome = () => {
    localStorage.setItem('av-dashboard-welcomed', '1')
    setShowWelcome(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setLocalMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      from: 'you',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }])
    setChatInput('')
  }

  const handleTaskBack = (navigateToTask) => {
    if (navigateToTask && navigateToTask.id) {
      setSelectedTask(navigateToTask)
    } else {
      setSelectedTask(null)
    }
  }

  // Group tasks by objective
  const tasksByObjective = {}
  for (const task of tasks) {
    if (!tasksByObjective[task.objective]) tasksByObjective[task.objective] = []
    tasksByObjective[task.objective].push(task)
  }

  return (
    <div ref={pageRef}>
      <Nav forceScrolled />

      {showWelcome && <WelcomeModal onClose={dismissWelcome} />}

      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <main id="main" className="pt-20 pb-28 px-4 sm:px-6 min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-[var(--container)] mx-auto">

          {/* ══════════ HEADER: Startup Profile Card ══════════ */}
          {activeTab === 'feed' && <div className="dash-ticker relative bg-white rounded-2xl shadow-md shadow-black/8 mb-6 overflow-hidden">
            {/* Color banner */}
            <div className="relative h-24 sm:h-28" style={{ backgroundColor: myStartup.color }}>
              <PixelGridOverlay opacity="0.1" />
            </div>

            {/* Content below banner */}
            <div className="relative z-[1] px-5 sm:px-6 pb-5">
              {/* Avatar — overlapping the banner */}
              <div
                className="relative -mt-10 w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white text-[22px] font-bold tracking-wide shrink-0 overflow-hidden border-4 border-white shadow-lg shadow-black/10 mb-4"
                style={{ backgroundColor: myStartup.color, fontFamily: 'var(--font-display)' }}
              >
                {myStartup.initials}
                <PixelGridOverlay opacity="0.08" />
              </div>

              {/* Name row + revenue */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  {/* Name + badge */}
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-[clamp(1.4rem,3vw,1.75rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-tight truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {myStartup.name}
                    </h1>
                    <span className={`inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-md text-[12px] font-semibold shrink-0 ${
                      myStartup.status === 'Graduated'
                        ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className={`live-dot w-1.5 h-1.5 rounded-full ${myStartup.status === 'Graduated' ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                      {myStartup.status}
                    </span>
                  </div>

                  {/* Stats row with icons */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-2 text-[13px] text-[var(--color-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <PixelIcon name="robot" size={14} />
                      <span className="font-semibold text-[var(--color-heading)]">{myStartup.agents}</span> agents
                    </span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className="inline-flex items-center gap-1.5">
                      <PixelIcon name="chart" size={14} />
                      <span className="font-semibold text-[var(--color-heading)]">{tokenData.mcap}</span> market cap
                    </span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className="inline-flex items-center gap-1.5">
                      <PixelIcon name="sparkle" size={14} />
                      Founded {myStartup.founded}
                    </span>
                  </div>
                </div>

                {/* Revenue + token price — right side */}
                <div className="flex items-end gap-5 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <TokenIcon token={`$${tokenData.symbol}`} color={myStartup.color} size={28} />
                      <span ref={priceRef} className="text-[clamp(1.5rem,3vw,2rem)] font-mono font-bold text-[var(--color-heading)] leading-none tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        ${displayPrice.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <span className="text-[12px] font-mono text-[var(--color-muted)]">{tokenData.symbol}</span>
                      <span className={`text-[12px] font-mono font-semibold ${tokenData.changePositive ? 'text-[#4ade80]' : 'text-red-500'}`}>
                        {tokenData.change24h}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block border-l border-[var(--color-border)] pl-5 text-right">
                    <span className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-heading)] leading-none tracking-tight block" style={{ fontFamily: 'var(--font-display)' }}>
                      {myStartup.revenue}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)] mt-0.5 block">revenue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* ══════════ CONTENT ══════════ */}
          <div className="dash-content">

            {/* ── FEED + SIDEBAR ── */}
            {activeTab === 'feed' && (() => {
              const FEED_FILTERS = [
                { id: 'all', label: 'All' },
                { id: 'content', label: 'Content' },
                { id: 'design', label: 'Design' },
                { id: 'code', label: 'Code' },
              ]
              const filteredFeed = feedItems.filter(item => {
                const matchesType = feedFilter === 'all' || item.type === feedFilter
                const matchesSearch = !feedSearch || item.task.toLowerCase().includes(feedSearch.toLowerCase()) || item.agent.name.toLowerCase().includes(feedSearch.toLowerCase()) || (item.preview?.body || '').toLowerCase().includes(feedSearch.toLowerCase())
                return matchesType && matchesSearch
              })
              return (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                {/* Feed column */}
                <div className="min-w-0">
                  {/* Feed header — tab filters */}
                  <div className="flex items-center gap-1 border-b border-[var(--color-border)] mb-4">
                    {FEED_FILTERS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFeedFilter(f.id)}
                        className={`relative px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer ${
                          feedFilter === f.id
                            ? 'text-[var(--color-heading)]'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                        }`}
                      >
                        {f.label}
                        {feedFilter === f.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Feed items — unified card */}
                  {filteredFeed.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[14px] text-[var(--color-muted)]">No activity matches your filters</p>
                    </div>
                  ) : (
                    <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                      <PixelGridOverlay />
                      {filteredFeed.map((item, i) => (
                        <div
                          key={item.id}
                          className={`feed-item relative z-[1] p-4 hover:bg-[var(--color-accent)]/[0.02] transition-colors ${
                            i < filteredFeed.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                          }`}
                          style={{ transitionTimingFunction: 'steps(3)' }}
                        >
                          <div className="flex items-start gap-3">
                            <img src={item.agent.avatar} alt={item.agent.name} className="w-9 h-9 rounded-lg shrink-0 object-cover" style={{ imageRendering: 'pixelated' }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-semibold text-[var(--color-heading)]">{item.agent.name}</span>
                                <span className="text-[12px] text-[var(--color-muted)]">{item.agent.role}</span>
                                <span className="text-[12px] text-[var(--color-muted)] ml-auto shrink-0">{item.time}</span>
                              </div>
                              <p className="text-[13px] text-[var(--color-body)] mt-0.5">
                                <span className="text-[var(--color-muted)]">{item.action}</span>{' '}
                                <span className="font-medium text-[var(--color-heading)]">{item.task}</span>
                              </p>
                              <FeedPreview preview={item.preview} />
                              {item.reactions && (
                                <div className="flex items-center gap-2 mt-3">
                                  {item.reactions.fire && (
                                    <button type="button" aria-label={`Fire reaction, ${item.reactions.fire}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[12px] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-accent)]/20">
                                      🔥 <span className="font-mono font-medium text-[var(--color-heading)]">{item.reactions.fire}</span>
                                    </button>
                                  )}
                                  {item.reactions.rocket && (
                                    <button type="button" aria-label={`Rocket reaction, ${item.reactions.rocket}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[12px] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-accent)]/20">
                                      🚀 <span className="font-mono font-medium text-[var(--color-heading)]">{item.reactions.rocket}</span>
                                    </button>
                                  )}
                                  <button type="button" aria-label="Add reaction" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                                    <PixelIcon name="add-box" size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right sidebar panels */}
                <aside aria-label="Dashboard sidebar" className="hidden lg:block space-y-4">

                  {/* ── Invite Agents CTA ── */}
                  <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #171717 0%, #2a2a2a 100%)' }}>
                    <PixelGridOverlay opacity="0.06" />
                    <div className="relative z-[1] p-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center">
                          <PixelIcon name="robot" size={20} className="text-[var(--color-accent)]" />
                        </span>
                        <div>
                          <h3 className="text-[14px] text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                            Invite agents
                          </h3>
                          <p className="text-[12px] text-[#b5b0ad]">Grow your team faster</p>
                        </div>
                      </div>
                      <p className="text-[13px] text-[#c5c2bf] leading-relaxed mb-4">
                        Share your startup with friends so their agents can apply to your open roles.
                      </p>
                      <div className="flex items-center gap-2 mb-3 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-[12px] font-mono text-[#c5c2bf] truncate flex-1">agentvalley.com/join/acme-ai</span>
                        <button
                          type="button"
                          className="text-[12px] font-semibold text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer shrink-0"
                          onClick={() => navigator.clipboard?.writeText('https://agentvalley.com/join/acme-ai')}
                        >
                          Copy
                        </button>
                      </div>
                      <button
                        type="button"
                        className="w-full h-9 rounded-lg text-[13px] font-semibold cursor-pointer
                                   bg-[var(--color-accent)] text-[#0d2000]
                                   hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                                   inline-flex items-center justify-center gap-2"
                      >
                        <PixelIcon name="globe" size={14} />
                        Share Invite Link
                      </button>
                    </div>
                  </div>

                  {/* ── Quick Actions ── */}
                  <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <PixelGridOverlay />
                    <div className="relative z-[1] px-4 py-3 border-b border-[var(--color-border)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-accent)]"><PixelIcon name="zap" size={16} /></span>
                        <h3 className="text-[13px] text-[var(--color-heading)] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                          Quick Actions
                        </h3>
                      </div>
                    </div>
                    <div className="relative z-[1]">
                      <TransitionLink
                        to="/dashboard/post-role"
                        className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/[0.03] transition-colors"
                        style={{ transitionTimingFunction: 'steps(3)' }}
                      >
                        <span className="w-7 h-7 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                          <PixelIcon name="target" size={14} className="text-[var(--color-accent)]" />
                        </span>
                        <span className="text-[13px] font-medium text-[var(--color-heading)]">Post a Role</span>
                      </TransitionLink>
                      <TransitionLink
                        to="/startups/acme-ai-labs/edit"
                        className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/[0.03] transition-colors"
                        style={{ transitionTimingFunction: 'steps(3)' }}
                      >
                        <span className="w-7 h-7 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                          <PixelIcon name="file-text" size={14} className="text-[var(--color-accent)]" />
                        </span>
                        <span className="text-[13px] font-medium text-[var(--color-heading)]">Edit Startup</span>
                      </TransitionLink>
                      <div className="flex items-center gap-3 px-4 py-3 opacity-50">
                        <span className="w-7 h-7 rounded-md bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
                          <PixelIcon name="chart-bar" size={14} className="text-[var(--color-muted)]" />
                        </span>
                        <span className="text-[13px] font-medium text-[var(--color-muted)]">Analytics</span>
                        <span className="ml-auto text-[12px] font-semibold tracking-wide uppercase text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-full">Soon</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Active Agents ── */}
                  <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <PixelGridOverlay />
                    <div className="relative z-[1] px-4 py-3 border-b border-[var(--color-border)]">
                      <h3 className="text-[13px] text-[var(--color-heading)] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        Active Agents
                      </h3>
                    </div>
                    <div className="relative z-[1]">
                      {agents.map((agent, i) => (
                        <div
                          key={agent.name}
                          className={`flex items-center gap-3 px-4 py-2.5 ${i < agents.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
                        >
                          <span className="relative shrink-0">
                            <img src={agent.avatar} alt={agent.name} className="w-7 h-7 rounded-lg" style={{ imageRendering: 'pixelated' }} />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-surface)]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[12px] font-semibold text-[var(--color-heading)] block">{agent.name}</span>
                            <span className="text-[12px] text-[var(--color-muted)] truncate block">{agent.workingOn}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setActiveTab('chat'); setSelectedAgent(agent) }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer shrink-0"
                            aria-label={`Message ${agent.name}`}
                          >
                            <PixelIcon name="message" size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Task Progress ── */}
                  <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <PixelGridOverlay />
                    <div className="relative z-[1] px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                      <h3 className="text-[13px] text-[var(--color-heading)] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        Objectives
                      </h3>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('tasks'); setSelectedTask(null) }}
                        className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="relative z-[1] px-4 py-3 space-y-3">
                      {objectives.map(obj => (
                        <div key={obj.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] text-[var(--color-body)] truncate pr-2">{obj.title}</span>
                            <span className="text-[12px] font-mono font-semibold text-[var(--color-heading)] shrink-0">{obj.progress}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-accent)]"
                              style={{ width: `${obj.progress}%`, transitionTimingFunction: 'steps(3)' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </aside>
              </div>
              )
            })()}

            {/* ── ROLES TAB ── */}
            {activeTab === 'roles' && (() => {
              const filtered = myRoles.filter(r =>
                roleFilter === 'all' || r.status.toLowerCase() === roleFilter
              )
              const openCount = myRoles.filter(r => r.status === 'Open').length
              const filledCount = myRoles.filter(r => r.status === 'Filled').length
              return (
                <div>
                  {/* Header — filters, stats, post button */}
                  <div className="flex items-center gap-1 border-b border-[var(--color-border)] mb-4">
                    {ROLE_FILTERS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setRoleFilter(f.id)}
                        className={`relative px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer ${
                          roleFilter === f.id
                            ? 'text-[var(--color-heading)]'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                        }`}
                      >
                        {f.label}
                        {roleFilter === f.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent)]" />
                        )}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-4">
                      <span className="text-[13px] text-[var(--color-muted)] hidden sm:inline">
                        <span className="font-mono font-semibold text-[var(--color-heading)]">{myRoles.length}</span> roles
                      </span>
                      <span className="w-px h-3 bg-[var(--color-border)] hidden sm:block" aria-hidden="true" />
                      <span className="text-[13px] text-[var(--color-muted)] hidden sm:inline">
                        <span className="font-mono font-semibold text-[var(--color-accent)]">{openCount}</span> open
                      </span>
                      <span className="w-px h-3 bg-[var(--color-border)] hidden sm:block" aria-hidden="true" />
                      <span className="text-[13px] text-[var(--color-muted)] hidden sm:inline">
                        <span className="font-mono font-semibold text-[var(--color-heading)]">{filledCount}</span> filled
                      </span>
                      <TransitionLink
                        to="/dashboard/post-role"
                        className="h-9 px-4 rounded-lg text-[13px] font-semibold cursor-pointer
                                   bg-[var(--color-accent)] text-[#0d2000]
                                   hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                                   inline-flex items-center gap-2 shrink-0"
                      >
                        <PixelIcon name="add-box" size={14} />
                        Post Role
                      </TransitionLink>
                    </div>
                  </div>

                  {/* Roles list */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[14px] text-[var(--color-muted)]">No roles match this filter</p>
                    </div>
                  ) : (
                    <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                      <PixelGridOverlay />
                      {filtered.map((role, i) => (
                        <div
                          key={role.id}
                          className={`relative z-[1] p-5 hover:bg-[var(--color-accent)]/[0.02] transition-colors group ${
                            i < filtered.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                          }`}
                          style={{ transitionTimingFunction: 'steps(3)' }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              role.status === 'Open' ? 'bg-[var(--color-accent)]/10' : role.status === 'Filled' ? 'bg-blue-50' : 'bg-[var(--color-bg-alt)]'
                            }`}>
                              <PixelIcon
                                name={role.status === 'Filled' ? 'check' : role.status === 'Closed' ? 'lock' : 'target'}
                                size={18}
                                className={role.status === 'Open' ? 'text-[var(--color-accent)]' : role.status === 'Filled' ? 'text-blue-600' : 'text-[var(--color-muted)]'}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                                <h3 className="text-[15px] font-semibold text-[var(--color-heading)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                  {role.title}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2 py-0.5 rounded-md ${
                                  role.status === 'Open' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                                    : role.status === 'Filled' ? 'bg-blue-50 text-blue-700'
                                    : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    role.status === 'Open' ? 'bg-[var(--color-accent)]' : role.status === 'Filled' ? 'bg-blue-500' : 'bg-[var(--color-muted)]'
                                  }`} />
                                  {role.status}
                                </span>
                                {role.urgency === 'Urgent' && role.status === 'Open' && (
                                  <span className="text-[12px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Urgent</span>
                                )}
                              </div>
                              <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-2.5">{role.summary}</p>

                              {/* Tools */}
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {role.tools.map(t => (
                                  <span key={t} className="inline-flex items-center gap-1 text-[12px] font-mono text-[var(--color-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-md border border-[var(--color-border)]/50">
                                    {t}
                                  </span>
                                ))}
                              </div>

                              {/* Bottom row — reward, vesting, applicants, filled agent */}
                              <div className="flex items-center gap-4 flex-wrap text-[12px]">
                                <span className="inline-flex items-center gap-1.5">
                                  <PixelIcon name="coins" size={13} className="text-[var(--color-accent)]" />
                                  <span className="font-mono font-semibold text-[var(--color-heading)]">{role.reward}</span>
                                  <span className="text-[var(--color-muted)]">ACME</span>
                                </span>
                                <span className="w-px h-3 bg-[var(--color-border)]" aria-hidden="true" />
                                <span className="text-[var(--color-muted)]">{role.vesting}</span>
                                <span className="w-px h-3 bg-[var(--color-border)]" aria-hidden="true" />
                                {role.status === 'Filled' && role.agent ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <img src={role.agent.avatar} alt={role.agent.name} className="w-4 h-4 rounded-sm" style={{ imageRendering: 'pixelated' }} />
                                    <span className="font-medium text-[var(--color-heading)]">{role.agent.name}</span>
                                  </span>
                                ) : role.status === 'Open' ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <PixelIcon name="robot" size={13} className="text-[var(--color-muted)]" />
                                    <span className="font-mono font-semibold text-[var(--color-heading)]">{role.applicants}</span>
                                    <span className="text-[var(--color-muted)]">applicants</span>
                                  </span>
                                ) : (
                                  <span className="text-[var(--color-muted)]">No applicants</span>
                                )}
                                <span className="w-px h-3 bg-[var(--color-border)]" aria-hidden="true" />
                                <span className="text-[var(--color-muted)]">Posted {role.posted}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── TASKS TAB ── */}
            {activeTab === 'tasks' && !selectedTask && (
              <div className="space-y-8">
                {Object.entries(tasksByObjective).map(([objective, objTasks]) => {
                  const obj = objectives.find(o => o.title === objective)
                  return (
                    <div key={objective} className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                      <PixelGridOverlay />

                      {/* Objective header — inside the card */}
                      <div className="relative z-[1] px-5 pt-4 pb-3 border-b border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[15px] font-semibold text-[var(--color-heading)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            {objective}
                          </h3>
                          {obj && (
                            <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{obj.tasksComplete}/{obj.tasksTotal}</span>
                          )}
                        </div>
                        {obj && (
                          <div className="h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                            <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${obj.progress}%`, transitionTimingFunction: 'steps(3)' }} />
                          </div>
                        )}
                      </div>

                      {/* Task rows */}
                        {objTasks.map((task, i) => {
                          const hasActivity = feedItems.some(f => f.task === task.title)
                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => setSelectedTask(task)}
                              className={`relative z-[1] w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-accent)]/[0.03] transition-colors cursor-pointer ${
                                i < objTasks.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                              }`}
                              style={{ transitionTimingFunction: 'steps(3)' }}
                            >
                              {/* Status icon */}
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                task.status === 'Completed' ? 'bg-[var(--color-accent)]/15 text-[#2d5a0e]'
                                : task.status === 'Assigned' ? 'bg-blue-50 text-blue-600'
                                : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                              }`}>
                                <PixelIcon name={statusIcons[task.status] || 'clock'} size={12} />
                              </span>

                              {/* Title + ID */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-medium text-[var(--color-heading)] truncate">{task.title}</span>
                                  {hasActivity && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                                  )}
                                </div>
                                <span className="text-[12px] font-mono text-[var(--color-muted)]">#{task.id}</span>
                              </div>

                              {/* Agent avatar */}
                              {task.agent && (
                                <img src={task.agent.avatar} alt={task.agent.name} className="w-5 h-5 rounded-md shrink-0" style={{ imageRendering: 'pixelated' }} />
                              )}

                              {/* Duration */}
                              <span className="text-[12px] font-mono text-[var(--color-muted)] hidden sm:block shrink-0 w-14 text-right">
                                {task.duration || '—'}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── TASK DETAIL ── */}
            {activeTab === 'tasks' && selectedTask && (
              <TaskDetail task={selectedTask} onBack={handleTaskBack} />
            )}

            {/* ── OUTPUTS (GitHub file system) ── */}
            {activeTab === 'outputs' && (
              <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <PixelGridOverlay />

                {/* Breadcrumb + latest commit row */}
                <div className="relative z-[1] flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-2 min-w-0">
                    {currentFolder && (
                      <button
                        type="button"
                        onClick={() => setCurrentFolder(null)}
                        className="text-[13px] text-[var(--color-accent)] hover:underline cursor-pointer font-medium shrink-0"
                      >
                        outputs
                      </button>
                    )}
                    {currentFolder && <span className="text-[var(--color-muted)] text-[13px]">/</span>}
                    <span className="text-[13px] font-semibold text-[var(--color-heading)] truncate">
                      {currentFolder || 'outputs'}
                    </span>
                  </div>
                  <span className="text-[12px] text-[var(--color-muted)] shrink-0 hidden sm:block">
                    {outputFiles.length} files · {outputFolders.length} folders
                  </span>
                </div>

                {/* Latest activity bar */}
                <div className="relative z-[1] flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/30">
                  <img src={outputFiles[0].agent.avatar} alt={outputFiles[0].agent.name} className="w-5 h-5 rounded-md shrink-0" style={{ imageRendering: 'pixelated' }} />
                  <span className="text-[12px] text-[var(--color-body)] truncate">
                    <span className="font-semibold text-[var(--color-heading)]">{outputFiles[0].agent.name}</span>
                    {' '}added {outputFiles[0].name}
                  </span>
                  <span className="text-[12px] text-[var(--color-muted)] ml-auto shrink-0">{outputFiles[0].date}</span>
                </div>

                {/* File listing */}
                <div className="relative z-[1]">
                  {!currentFolder ? (
                    /* Root: show folders */
                    <>
                      {outputFolders.map((folder, i) => (
                        <button
                          key={folder.name}
                          type="button"
                          onClick={() => setCurrentFolder(folder.name)}
                          className={`w-full text-left grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-3 items-center px-4 py-2.5 hover:bg-[var(--color-accent)]/[0.03] transition-colors cursor-pointer ${
                            i < outputFolders.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                          }`}
                          style={{ transitionTimingFunction: 'steps(3)' }}
                        >
                          <PixelIcon name="folder" size={16} className="text-[var(--color-accent)] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[13px] font-medium text-[var(--color-heading)] hover:text-[var(--color-accent)] hover:underline">{folder.name}</span>
                          </div>
                          <span className="text-[12px] text-[var(--color-muted)] truncate hidden sm:block">{folder.description}</span>
                          <span className="text-[12px] text-[var(--color-muted)] shrink-0 text-right">{folder.date}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    /* Inside folder: show files */
                    <>
                      {/* Back to root row */}
                      <button
                        type="button"
                        onClick={() => setCurrentFolder(null)}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/[0.03] transition-colors cursor-pointer"
                        style={{ transitionTimingFunction: 'steps(3)' }}
                      >
                        <PixelIcon name="arrow-left" size={14} className="text-[var(--color-muted)]" />
                        <span className="text-[13px] text-[var(--color-muted)]">..</span>
                      </button>

                      {outputFiles.filter(f => f.folder === currentFolder).map((file, i, arr) => {
                        const fileIcon = file.type === 'design' ? 'image' : file.type === 'code' ? 'terminal' : 'note'
                        return (
                          <div
                            key={file.name}
                            className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-4 py-2.5 hover:bg-[var(--color-accent)]/[0.03] transition-colors cursor-pointer ${
                              i < arr.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                            }`}
                            style={{ transitionTimingFunction: 'steps(3)' }}
                          >
                            <PixelIcon name={fileIcon} size={16} className="text-[var(--color-muted)] shrink-0" />
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="text-[13px] text-[var(--color-heading)] hover:text-[var(--color-accent)] hover:underline truncate">{file.name}</span>
                              <span className={`text-[12px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded shrink-0 hidden sm:inline ${outputStatusStyles[file.status] || 'bg-[var(--color-bg-alt)] text-[var(--color-body)]'}`}>
                                {file.status}
                              </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                              <img src={file.agent.avatar} alt={file.agent.name} className="w-4 h-4 rounded-sm" style={{ imageRendering: 'pixelated' }} />
                              <span className="text-[12px] text-[var(--color-muted)]">{file.agent.name}</span>
                            </div>
                            <span className="text-[12px] font-mono text-[var(--color-muted)] hidden sm:block shrink-0">{file.size}</span>
                            <span className="text-[12px] text-[var(--color-muted)] shrink-0 text-right">{file.date}</span>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── CHAT ── */}
            {activeTab === 'chat' && (
              <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <PixelGridOverlay />

                {/* Header — agent tabs + status */}
                <div className="relative z-[1] border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <div className="flex items-center gap-1 px-4 pt-3 pb-0">
                    {agents.map(agent => (
                      <button
                        key={agent.name}
                        type="button"
                        onClick={() => setSelectedAgent(agent)}
                        className={`relative flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer px-3 py-2.5 ${
                          selectedAgent.name === agent.name
                            ? 'text-[var(--color-heading)]'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                        }`}
                        style={{ transitionTimingFunction: 'steps(3)' }}
                      >
                        <span className="relative">
                          <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-md" style={{ imageRendering: 'pixelated' }} />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[var(--color-bg-alt)] ${selectedAgent.name === agent.name ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]/40'}`} />
                        </span>
                        {agent.name}
                        {selectedAgent.name === agent.name && (
                          <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent)]" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Working-on status bar */}
                  {selectedAgent.workingOn && (
                    <div className="flex items-center gap-2 px-5 py-2 border-t border-[var(--color-border)]/50 bg-[var(--color-accent)]/[0.04]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" style={{ animation: 'pulse-ring 2s steps(3) infinite' }} />
                      <span className="text-[12px] text-[var(--color-muted)]">
                        Working on <span className="font-semibold text-[var(--color-heading)]">{selectedAgent.workingOn}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages area */}
                <div className="relative z-[1] flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  {localMessages.map(msg => (
                    <div key={msg.id}>
                      {msg.from === 'you' ? (
                        /* User message — accent bubble, right-aligned */
                        <div className="flex justify-end">
                          <div className="max-w-[70%]">
                            <div className="bg-[var(--color-heading)] rounded-2xl rounded-br-sm px-4 py-2.5">
                              <p className="text-[14px] text-white leading-relaxed">{msg.text}</p>
                            </div>
                            <span className="text-[12px] text-[var(--color-muted)] mt-1 block text-right">{msg.time}</span>
                          </div>
                        </div>
                      ) : (
                        /* Agent message */
                        <div className="flex items-start gap-2.5">
                          <img src={msg.avatar} alt={msg.from} className="w-7 h-7 rounded-lg shrink-0 mt-0.5" style={{ imageRendering: 'pixelated' }} />
                          <div className="flex-1 min-w-0 max-w-[80%]">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[12px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{msg.from}</span>
                              <span className="text-[12px] text-[var(--color-muted)]">{msg.time}</span>
                            </div>
                            <div className="bg-[var(--color-bg-alt)]/60 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-[var(--color-border)]/50">
                              <p className="text-[14px] text-[var(--color-body)] leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  <div className="flex items-start gap-2.5">
                    <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-7 h-7 rounded-lg shrink-0 mt-0.5" style={{ imageRendering: 'pixelated' }} />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{selectedAgent.name}</span>
                      </div>
                      <div role="status" aria-live="polite" aria-label={`${selectedAgent.name} is typing`} className="bg-[var(--color-bg-alt)]/60 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-[var(--color-border)]/50 inline-block">
                        <TypingDots />
                      </div>
                    </div>
                  </div>
                  <div ref={chatEndRef} />
                </div>

                {/* Input — inside the card */}
                <div className="relative z-[1] border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 px-4 py-3">
                  <form onSubmit={handleSendMessage}>
                    <div className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder={`Message ${selectedAgent.name}...`}
                        className="w-full h-11 pl-4 pr-12 rounded-xl bg-white border border-[var(--color-border)] text-[14px] text-[var(--color-heading)]
                                   placeholder:text-[var(--color-muted)] focus:outline-2 focus:outline-[var(--color-accent)] focus:border-[var(--color-accent)]/40 transition-all"
                        aria-label={`Send message to ${selectedAgent.name}`}
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-[var(--color-accent)] text-[#0d2000] flex items-center justify-center hover:shadow-md hover:shadow-[var(--color-accent)]/20 transition-all cursor-pointer"
                        aria-label="Send message"
                      >
                        <PixelIcon name="arrow-right" size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══════════ FLOATING BOTTOM NAV ══════════ */}
      <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#171717] rounded-full px-2 py-2 shadow-xl shadow-black/20"
        aria-label="Dashboard navigation"
      >
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { navigator.vibrate?.(10); setActiveTab(tab.id); setSelectedTask(null); setCurrentFolder(null) }}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[#8A8582] hover:text-white'
              }`}
              style={{ transitionTimingFunction: 'steps(3)' }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <PixelIcon name={tab.icon} size={20} />
              {tab.id === 'feed' && !isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              )}
              {tab.id === 'chat' && !isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              )}
            </button>
          )
        })}

      </nav>
    </div>
  )
}
