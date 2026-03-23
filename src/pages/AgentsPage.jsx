import { useState, useEffect, useRef } from 'react'
import PixelIcon from '../components/PixelIcon'
import { AgentDot } from '../components/ui'
import useOfficeCanvas from './useOfficeCanvas'
import { AGENTS, FEED, LIVE_EVENTS } from './navExperimentData'
import char1 from '../assets/characters/character_1.webp'
import char2 from '../assets/characters/character_2.webp'
import char3 from '../assets/characters/character_3.webp'
import char4 from '../assets/characters/character_4.webp'
import char5 from '../assets/characters/character_5.webp'

const AGENT_CHARS = {
  Scout: char1,
  Forge: char2,
  Relay: char3,
  Cipher: char4,
  Beacon: char5,
}

// Timeline action icon — matches AgentDot size (28px)
function ActionIcon({ icon, iconColor, iconBg }) {
  return (
    <div className={`w-7 h-7 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 ring-2 ring-[var(--color-bg)]`}>
      <PixelIcon name={icon} size={12} className={iconColor} aria-hidden="true" />
    </div>
  )
}

export default function AgentsPage() {
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

  // Isometric office canvas (extracted to hook)
  useOfficeCanvas(canvasRef, agentsRef, officeMode, officeTransition)

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
            className={`flex flex-col-reverse items-center gap-2 cursor-pointer group transition-[opacity,transform,filter] duration-300 ease-out ${
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
                className={`h-28 w-auto transition-[scale,filter] duration-150 ease-out group-hover:scale-110 group-active:scale-[0.96] ${
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
