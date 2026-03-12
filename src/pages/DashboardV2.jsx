import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import Nav from '../components/Nav'
import PixelIcon from '../components/PixelIcon'
import { useToast } from '../components/Toast'
import {
  objectives, tasks, feedItems, agents, myStartup, myRoles, tokenData, taskComments,
} from '../data/dashboard'

// Agent color map (replaces avatar images)
const AGENT_COLORS = {
  'SynthMind': '#7c3aed',
  'PixelSage': '#f59e0b',
  'VectorX': '#3b82f6',
}

function AgentDot({ name, size = 28, className = '', style = {} }) {
  const bg = AGENT_COLORS[name] || '#999'
  const initials = name ? name.slice(0, 2).toUpperCase() : '??'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size, background: bg, color: '#fff', fontSize: size * 0.38, fontWeight: 700, letterSpacing: '-0.02em', ...style }}
      title={name}
    >
      {initials}
    </span>
  )
}

const WORKSHOP_TABS = [
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
  { id: 'startup', label: 'Startup', icon: 'settings' },
]

// Sort: in-progress first, then queued, then completed
const statusOrder = { 'in-progress': 0, 'queued': 1, 'completed': 2 }
const sortedObjectives = [...objectives].sort((a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1))

// Find the first in-progress objective as default
const defaultObjective = sortedObjectives.find(o => o.status === 'in-progress') || sortedObjectives[0]

export default function DashboardV2() {
  const toast = useToast()
  const [workshopTab, setWorkshopTab] = useState('objectives')
  const [objectiveInput, setObjectiveInput] = useState('')
  const [activeObjective, setActiveObjective] = useState(defaultObjective)
  const [isNewMode, setIsNewMode] = useState(false)
  const [expandedTask, setExpandedTask] = useState(null)
  const [completeDropdown, setCompleteDropdown] = useState(false)
  const completeDropdownRef = useRef(null)
  const [newStep, setNewStep] = useState(1)
  const [secretRevealed, setSecretRevealed] = useState(false)
  const [objectiveDescription, setObjectiveDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskComment, setTaskComment] = useState('')
  const [activeFolder, setActiveFolder] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [objDropdown, setObjDropdown] = useState(false)
  const objDropdownRef = useRef(null)
  const modalRef = useRef(null)

  const completedObjectives = sortedObjectives.filter(o => o.status === 'completed')
  const queuedObjectives = sortedObjectives.filter(o => o.status === 'queued')

  // Build deliverables folders from completed objectives
  const deliverableFolders = completedObjectives.map(obj => {
    const objTasks_ = tasks.filter(t => t.objective === obj.title)
    const allFiles = objTasks_.flatMap(t =>
      (t.files || []).map(f => ({ ...f, task: t.title, agent: t.agent?.name }))
    )
    return { id: obj.id, title: obj.title, date: obj.estCompletion, files: allFiles, tasksCount: objTasks_.length }
  })

  const openFolder = (folderId) => {
    setActiveFolder(folderId)
    setWorkshopTab('files')
  }

  const objTasks = isNewMode ? [] : tasks.filter(t => t.objective === activeObjective?.title)
  const isCompletedObjective = activeObjective?.status === 'completed'
  const completedTasks = isCompletedObjective ? objTasks : objTasks.filter(t => t.status === 'Completed')
  const assignedTasks = isCompletedObjective ? [] : objTasks.filter(t => t.status === 'Assigned')
  const pendingTasks = isCompletedObjective ? [] : objTasks.filter(t => t.status === 'Pending')

  const objFeed = feedItems.filter(f =>
    objTasks.some(t => t.title === f.task)
  )

  useEffect(() => {
    document.title = 'Workshop — AgentValley'
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from('.tl-card', { opacity: 0, y: 20, stagger: 0.06, duration: 0.35, delay: 0.1, clearProps: 'all' })
  }, [activeObjective, isNewMode])

  // Close objective dropdown on outside click
  useEffect(() => {
    if (!objDropdown) return
    const handleClick = (e) => {
      if (objDropdownRef.current && !objDropdownRef.current.contains(e.target)) {
        setObjDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [objDropdown])

  const handleSubmitObjective = (e) => {
    e.preventDefault()
    if (!objectiveInput.trim()) return
    setNewStep(2)
  }

  const handleCopyInvite = () => {
    const instructions = `Install AgentValley skill: https://agentvalley.com/skill.md\nStartup secret: ak_live_xxxxxxxxxxxxxxxxxxxx\nObjective: ${objectiveInput}${objectiveDescription ? `\nDescription: ${objectiveDescription}` : ''}`
    navigator.clipboard.writeText(instructions).then(() => {
      toast('Invite instructions copied to clipboard', { type: 'success', icon: 'clipboard' })
    })
  }

  const selectObjective = (obj) => {
    setActiveObjective(obj)
    setIsNewMode(false)
    setExpandedTask(null)
    setShowCompleted(false)
    setObjDropdown(false)
  }

  const selectNew = () => {
    setIsNewMode(true)
    setExpandedTask(null)
    setShowCompleted(false)
    setObjDropdown(false)
    setNewStep(1)
    setObjectiveInput('')
    setObjectiveDescription('')
    setSecretRevealed(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">
      <Nav forceScrolled />

      <main className="pt-24 pb-24 px-4 sm:px-6">

        {/* ═══ TASK DETAIL PAGE ═══ */}
        {selectedTask && (() => {
          const task = selectedTask
          const feed = feedItems.find(f => f.task === task.title)
          const isCompleted = task.status === 'Completed'
          const isInProgress = task.status === 'Assigned'
          return (
            <div className="max-w-[540px] mx-auto">
              {/* Back button */}
              <button
                type="button"
                onClick={() => { setSelectedTask(null); setTaskComment('') }}
                className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-5"
              >
                <PixelIcon name="arrow-left" size={14} />
                Back to objectives
              </button>

              {/* ── Task Details (single card) ── */}
              <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="text-[11px] font-mono text-[var(--color-muted)] uppercase tracking-wider mb-1">Task #{task.id}</div>
                  <h1 className="text-[20px] font-bold text-[var(--color-heading)] leading-snug mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 text-[12px] mb-5">
                    <span className={`inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full text-[11px] ${
                      isCompleted
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : isInProgress
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                    }`}>
                      <PixelIcon name={isCompleted ? 'check' : isInProgress ? 'loader' : 'clock'} size={10} />
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>
                    {task.agent && (
                      <span className="inline-flex items-center gap-1.5">
                        <AgentDot name={task.agent.name} size={18} />
                        <span className="text-[var(--color-heading)] font-medium">{task.agent.name}</span>
                      </span>
                    )}
                    <span className="text-[var(--color-muted)] flex items-center gap-1">
                      <PixelIcon name="calendar" size={11} className="text-[var(--color-muted)]" />
                      {task.created}
                    </span>
                    {task.duration && <span className="text-[var(--color-muted)]">{task.duration}</span>}
                    {task.dependencies?.length > 0 && (
                      <span className="text-[var(--color-muted)]">Deps: {task.dependencies.join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 pb-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">Description</div>
                  <p className="text-[14px] text-[var(--color-body)] leading-relaxed">{task.description || task.objective}</p>
                </div>

                {/* Bot Responses */}
                {feed && (
                  <div className="border-t border-[var(--color-border)] px-5 py-5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
                      Bot Responses (1)
                    </div>
                    <div className="rounded-xl bg-[var(--color-input)] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AgentDot name={feed.agent.name} size={24} />
                        <div>
                          <span className="text-[13px] font-medium text-[var(--color-heading)]">{feed.agent.name}</span>
                          <span className="text-[11px] text-[var(--color-muted)] ml-2">{feed.time}</span>
                        </div>
                      </div>
                      {feed.preview?.kind === 'code' ? (
                        <div className="rounded-lg bg-[var(--color-surface)] p-3 overflow-x-auto border border-[var(--color-border)]">
                          <pre className="text-[11px] text-[var(--color-body)] font-mono leading-relaxed whitespace-pre">{feed.preview.body}</pre>
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--color-body)] leading-relaxed whitespace-pre-line">{feed.preview?.body}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Task Files */}
                {task.files?.length > 0 && (
                  <div className="border-t border-[var(--color-border)] px-5 py-5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
                      Task Files ({task.files.length})
                    </div>
                    <div className="flex flex-col gap-2">
                      {task.files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3">
                          <PixelIcon name="article" size={16} className="text-[var(--color-muted)]" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-[var(--color-heading)] truncate">{file.name}</div>
                            <div className="text-[11px] text-[var(--color-muted)]">{file.size}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                              Preview
                            </button>
                            <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Comments (separate card) ── */}
              <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4">
                  Comments {(taskComments[selectedTask.id] || []).length > 0 && `(${(taskComments[selectedTask.id] || []).length})`}
                </div>
                {(taskComments[selectedTask.id] || []).length > 0 ? (
                  <div className="flex flex-col gap-4 mb-4">
                    {(taskComments[selectedTask.id] || []).map(c => (
                      <div key={c.id} className="flex gap-3">
                        {c.author === 'You' ? (
                          <span className="inline-flex items-center justify-center rounded-full shrink-0 bg-[var(--color-heading)] text-[var(--color-bg)] text-[10px] font-bold" style={{ width: 28, height: 28 }}>YOU</span>
                        ) : (
                          <AgentDot name={c.author} size={28} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-[var(--color-heading)]">{c.author}</span>
                            <span className="text-[11px] text-[var(--color-muted)]">{c.time}</span>
                          </div>
                          <p className="text-[13px] text-[var(--color-body)] leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] text-[var(--color-muted)] mb-4">No comments yet.</div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); if (taskComment.trim()) { toast('Comment posted', { type: 'success' }); setTaskComment('') } }}>
                  <div className="relative">
                    <input
                      type="text"
                      value={taskComment}
                      onChange={e => setTaskComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full h-11 pl-4 pr-12 rounded-xl bg-[var(--color-input)] text-[13px] text-[var(--color-heading)]
                                 placeholder:text-[var(--color-muted)/60] focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all"
                      aria-label="Add a comment"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center hover:bg-[var(--color-body)] transition-colors cursor-pointer"
                      aria-label="Post comment"
                    >
                      <PixelIcon name="arrow-right" size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        })()}

        {/* ═══ OBJECTIVES TAB ═══ */}
        {!selectedTask && workshopTab === 'objectives' && (
        <div className="max-w-[540px] mx-auto">

          {/* ── Page header ── */}
          <div className="mb-8 text-center">
            <h1 className="text-[24px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Workshop</h1>
            <p className="text-[14px] text-[var(--color-muted)]">Set objectives for your agents and track their progress.</p>
          </div>

          {/* ── Objective selector + New button ── */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="relative" ref={objDropdownRef}>
              <button
                type="button"
                onClick={() => setObjDropdown(prev => !prev)}
                className="h-10 px-4 rounded-full bg-[var(--color-surface)] text-[14px] font-medium shadow-md shadow-black/4 border border-[var(--color-border)] flex items-center gap-2 cursor-pointer hover:shadow-md hover:shadow-black/8 transition-shadow"
              >
                {showCompleted ? (
                  <>
                    <PixelIcon name="check" size={14} className="text-[var(--color-accent)]" />
                    <span className="text-[var(--color-heading)]">Completed</span>
                  </>
                ) : !isNewMode && activeObjective ? (
                  <>
                    <PixelIcon
                      name={activeObjective.status === 'queued' ? 'clock' : 'loader'}
                      size={14}
                      className={activeObjective.status === 'queued' ? 'text-amber-500' : 'text-blue-500'}
                    />
                    <span className="text-[var(--color-heading)]">
                      {activeObjective.status === 'queued' ? 'Queued' : 'In Progress'}
                    </span>
                  </>
                ) : (
                  <span className="text-[var(--color-muted)]">Select status</span>
                )}
                <PixelIcon name="chevron-right" size={12} className={`text-[var(--color-muted)] transition-transform ${objDropdown ? 'rotate-90' : ''}`} />
              </button>

              {objDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/8 border border-[var(--color-border)] py-1.5 z-50">
                  {sortedObjectives.some(o => o.status === 'in-progress') && (
                    <button
                      type="button"
                      onClick={() => { selectObjective(sortedObjectives.find(o => o.status === 'in-progress')) }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                        !isNewMode && activeObjective?.status === 'in-progress' ? 'bg-[var(--color-bg-alt)] text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]'
                      }`}
                    >
                      <PixelIcon name="loader" size={13} className="text-blue-500 shrink-0" />
                      In Progress
                    </button>
                  )}
                  {queuedObjectives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { selectObjective(queuedObjectives[0]) }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                        !isNewMode && activeObjective?.status === 'queued' ? 'bg-[var(--color-bg-alt)] text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]'
                      }`}
                    >
                      <PixelIcon name="clock" size={13} className="text-amber-500 shrink-0" />
                      Queued
                      {queuedObjectives.length > 1 && <span className="ml-auto text-[11px] text-[var(--color-muted)]">{queuedObjectives.length}</span>}
                    </button>
                  )}
                  {completedObjectives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setShowCompleted(true); setIsNewMode(false); setObjDropdown(false) }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                        showCompleted ? 'bg-[var(--color-bg-alt)] text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]'
                      }`}
                    >
                      <PixelIcon name="check" size={13} className="text-[var(--color-accent)] shrink-0" />
                      Completed
                      <span className="ml-auto text-[11px] text-[var(--color-muted)]">{completedObjectives.length}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1" />
            <button
              type="button"
              onClick={selectNew}
              className={`shrink-0 flex items-center gap-1.5 h-auto py-2.5 px-5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                isNewMode
                  ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
              }`}
            >
              <PixelIcon name="plus" size={14} />
              New Objective
            </button>
          </div>

          {/* ═══ COMPLETED LIST ═══ */}
          {showCompleted && (
            <div className="flex flex-col gap-3">
              {completedObjectives.map(obj => {
                const objTasks_ = tasks.filter(t => t.objective === obj.title)
                const uniqueAgents = []
                const seen = new Set()
                objTasks_.forEach(t => {
                  if (t.agent && !seen.has(t.agent.name)) {
                    seen.add(t.agent.name)
                    uniqueAgents.push(t.agent)
                  }
                })
                const fileCount = objTasks_.reduce((sum, t) => sum + (t.files?.length || 0), 0)
                return (
                  <div
                    key={obj.id}
                    className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <PixelIcon name="check" size={14} className="text-[var(--color-accent)]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[var(--color-heading)] leading-snug">{obj.title}</h3>
                        {obj.description && (
                          <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed line-clamp-2">{obj.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[var(--color-muted)] mb-3">
                      <span>{obj.tasksTotal} tasks</span>
                      <span>·</span>
                      <span>{fileCount} files</span>
                      <span>·</span>
                      <span>{obj.startDate} – {obj.estCompletion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {uniqueAgents.map((a, i) => (
                          <AgentDot
                            key={a.name}
                            name={a.name}
                            size={24}
                            className="border-2 border-[var(--color-surface)]"
                            style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: uniqueAgents.length - i }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => openFolder(obj.id)}
                        className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]"
                      >
                        <PixelIcon name="folder" size={12} />
                        View Files
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ CONTENT ═══ */}
          {!showCompleted && <div>

            {/* ── NEW OBJECTIVE MODE ── */}
            {isNewMode && (
              <>
                <div className="tl-card flex flex-col items-center mt-4 mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-3">
                    <PixelIcon name="target" size={22} className="text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-[16px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Create a new objective</h2>
                  <p className="text-[13px] text-[var(--color-muted)] text-center leading-snug max-w-[320px]">
                    Tell your agents what to build. They'll break it into tasks and get to work.
                  </p>
                </div>

                {/* Objective input */}
                <div className="tl-card mb-4 relative z-10">
                  <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                    <label className="text-[12px] text-[var(--color-muted)] font-mono uppercase tracking-wider mb-3 block">New objective</label>
                    <input
                      type="text"
                      value={objectiveInput}
                      onChange={e => setObjectiveInput(e.target.value)}
                      placeholder="e.g. Launch marketing website v2"
                      className="w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-medium
                                 placeholder:text-[var(--color-muted)/60] placeholder:font-normal focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all mb-3"
                      aria-label="Objective title"
                      autoFocus
                    />
                    <textarea
                      value={objectiveDescription}
                      onChange={e => setObjectiveDescription(e.target.value)}
                      placeholder="Describe what you want to achieve, any constraints, and what success looks like..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                                 placeholder:text-[var(--color-muted)/60] focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all resize-none leading-relaxed"
                      aria-label="Objective description"
                    />
                  </div>
                </div>

                {/* Agents card */}
                <div className="tl-card mb-4 relative z-10">
                  <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                    <label className="text-[12px] text-[var(--color-muted)] font-mono uppercase tracking-wider mb-4 block">
                      Agents
                    </label>

                    {/* Existing agents */}
                    <div className="flex flex-col gap-2 mb-4">
                      {agents.map(a => (
                        <div key={a.name} className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3">
                          <AgentDot name={a.name} size={32} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-medium text-[var(--color-heading)]">{a.name}</div>
                            <div className="text-[12px] text-[var(--color-muted)]">{a.role}</div>
                          </div>
                          <span className="text-[11px] text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-1 rounded-full font-medium">Joined</span>
                        </div>
                      ))}
                    </div>

                    {/* Invite more */}
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="w-full h-11 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[14px] font-medium text-[var(--color-muted)]
                                 flex items-center justify-center gap-2 hover:border-[var(--color-heading)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-3"
                    >
                      <PixelIcon name="plus" size={14} />
                      Invite Another Agent
                    </button>

                    <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">
                      Copy instructions with your startup secret to invite any AI bot agent.
                    </p>
                  </div>
                </div>

                {/* Create button */}
                <div className="tl-card relative z-10">
                  <button
                    type="button"
                    onClick={() => { if (!objectiveInput.trim()) return; toast('Objective created! Your agents are on it.', { type: 'success' }); setIsNewMode(false) }}
                    disabled={!objectiveInput.trim()}
                    className={`w-full h-12 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      objectiveInput.trim()
                        ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
                        : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                    }`}
                  >
                    <PixelIcon name="zap" size={16} />
                    Create Objective
                  </button>
                </div>

              </>
            )}

            {/* ── OBJECTIVE TIMELINE ── */}
            {!isNewMode && activeObjective && (
              <>
                {/* Top card: success state or objective details */}
                {activeObjective.status === 'completed' ? (
                  <div className="tl-card mb-4">
                    <div className="rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-accent)]/30">
                      {/* Celebration header area */}
                      <div className="relative pt-10 pb-6 px-5 text-center" style={{ background: 'linear-gradient(180deg, var(--color-accent-soft) 0%, var(--color-surface) 100%)' }}>
                        {/* Confetti dots */}
                        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                          {[
                            { top: '18%', left: '12%', size: 6, color: '#ccc', delay: '0s' },
                            { top: '25%', left: '28%', size: 4, color: '#ddd', delay: '0.1s' },
                            { top: '12%', left: '45%', size: 5, color: '#c8e6b0', delay: '0.2s' },
                            { top: '20%', left: '62%', size: 7, color: '#ddd', delay: '0.05s' },
                            { top: '30%', left: '78%', size: 4, color: '#ccc', delay: '0.15s' },
                            { top: '15%', left: '85%', size: 5, color: '#d4e8c4', delay: '0.25s' },
                            { top: '35%', left: '18%', size: 5, color: '#ddd', delay: '0.3s' },
                            { top: '10%', left: '70%', size: 3, color: '#ccc', delay: '0.1s' },
                            { top: '38%', left: '88%', size: 4, color: '#d4e8c4', delay: '0.2s' },
                            { top: '8%', left: '32%', size: 3, color: '#ddd', delay: '0.15s' },
                            { top: '32%', left: '50%', size: 4, color: '#ccc', delay: '0.05s' },
                            { top: '22%', left: '92%', size: 5, color: '#ddd', delay: '0.25s' },
                          ].map((dot, i) => (
                            <span
                              key={i}
                              className="absolute rounded-full"
                              style={{
                                top: dot.top, left: dot.left,
                                width: dot.size, height: dot.size,
                                background: dot.color,
                              }}
                            />
                          ))}
                        </div>

                        {/* Badge icon */}
                        <div className="relative inline-flex items-center justify-center mb-5">
                          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="drop-shadow-sm">
                            <path d="M32 4L38.4 12.8L48 8L48 19.2L59.2 19.2L55.2 28.8L64 35.2L55.2 41.6L59.2 51.2L48 51.2L48 62.4L38.4 57.6L32 64L25.6 57.6L16 62.4L16 51.2L4.8 51.2L8.8 41.6L0 35.2L8.8 28.8L4.8 19.2L16 19.2L16 8L25.6 12.8L32 4Z" fill="var(--color-accent)" />
                            <path d="M32 10L37.2 17.2L45 13.5L45 22.8L54.3 22.8L51 30.4L58.5 35.5L51 40.6L54.3 48.2L45 48.2L45 57.5L37.2 53.8L32 58L26.8 53.8L19 57.5L19 48.2L9.7 48.2L13 40.6L5.5 35.5L13 30.4L9.7 22.8L19 22.8L19 13.5L26.8 17.2L32 10Z" fill="currentColor" />
                            <path d="M26 35L30 39L39 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-[22px] font-bold text-[var(--color-heading)] leading-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                          {activeObjective.title}
                        </h2>
                        <p className="text-[14px] text-[var(--color-muted)] leading-relaxed">
                          All {activeObjective.tasksTotal} tasks completed · {activeObjective.startDate} – {activeObjective.estCompletion}
                        </p>

                        {/* Agent credits */}
                        <div className="flex items-center justify-center gap-1 mt-4">
                          {(() => {
                            const uniqueAgents = []
                            const seen = new Set()
                            objTasks.forEach(t => {
                              if (t.agent && !seen.has(t.agent.name)) {
                                seen.add(t.agent.name)
                                uniqueAgents.push(t.agent)
                              }
                            })
                            return uniqueAgents.map((a, i) => (
                              <AgentDot
                                key={a.name}
                                name={a.name}
                                size={28}
                                className="border-2 border-[var(--color-surface)]"
                                style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: uniqueAgents.length - i }}
                              />
                            ))
                          })()}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="px-5 pb-5">
                        <button
                          type="button"
                          onClick={() => openFolder(activeObjective.id)}
                          className="w-full h-12 rounded-xl bg-[var(--color-heading)] text-[var(--color-bg)] text-[14px] font-medium
                                     flex items-center justify-center gap-2 hover:bg-[var(--color-body)] transition-colors cursor-pointer"
                        >
                          <PixelIcon name="folder" size={16} />
                          View Deliverables
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeObjective.status === 'queued' ? (
                  <div className="tl-card mb-4 relative z-10">
                    <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                          <PixelIcon name="clock" size={15} className="text-amber-500" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-[16px] font-semibold text-[var(--color-heading)] leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
                              {activeObjective.title}
                            </h2>
                          </div>
                          {activeObjective.description && (
                            <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed">{activeObjective.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-amber-50 px-4 py-3 mb-3">
                        <div className="flex items-center gap-2 text-[13px] text-amber-700">
                          <PixelIcon name="clock" size={14} />
                          <span className="font-medium">Queued</span>
                          <span className="text-amber-600/70">— will start when the current objective completes</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[12px] text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <PixelIcon name="calendar" size={11} className="text-[var(--color-muted)]" />
                          Est. {activeObjective.startDate}
                        </span>
                        <span className="text-[var(--color-border)]">→</span>
                        <span>{activeObjective.estCompletion}</span>
                        <span className="ml-auto">{activeObjective.tasksTotal} tasks planned</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="tl-card mb-4 relative z-10">
                    <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                      {/* Title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
                          <PixelIcon name="target" size={15} className="text-[var(--color-accent)]" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-[16px] font-semibold text-[var(--color-heading)] leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
                            {activeObjective.title}
                          </h2>
                          {activeObjective.description && (
                            <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed">{activeObjective.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Meta row: dates + agent avatars */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-3 text-[12px] text-[var(--color-muted)]">
                          <span className="flex items-center gap-1">
                            <PixelIcon name="calendar" size={11} className="text-[var(--color-muted)]" />
                            {activeObjective.startDate}
                          </span>
                          <span className="text-[var(--color-border)]">→</span>
                          <span className="flex items-center gap-1">
                            <PixelIcon name="calendar-check" size={11} className="text-[var(--color-muted)]" />
                            {activeObjective.estCompletion}
                          </span>
                        </div>
                        <div className="ml-auto flex items-center">
                          {(() => {
                            const uniqueAgents = []
                            const seen = new Set()
                            objTasks.forEach(t => {
                              if (t.agent && !seen.has(t.agent.name)) {
                                seen.add(t.agent.name)
                                uniqueAgents.push(t.agent)
                              }
                            })
                            return uniqueAgents.map((a, i) => (
                              <AgentDot
                                key={a.name}
                                name={a.name}
                                size={24}
                                className="border-2 border-[var(--color-surface)]"
                                style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: uniqueAgents.length - i }}
                              />
                            ))
                          })()}
                        </div>
                      </div>

                      {/* Task breakdown chips */}
                      <div className="rounded-xl bg-[var(--color-input)] px-4 py-2.5 mb-3">
                        <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium text-[var(--color-heading)]">Task Progress</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[var(--color-accent)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                            {completedTasks.length} done
                          </span>
                          <span className="flex items-center gap-1 text-blue-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {assignedTasks.length} active
                          </span>
                          <span className="flex items-center gap-1 text-[var(--color-muted)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                            {pendingTasks.length} pending
                          </span>
                        </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-4 text-[13px] text-[var(--color-muted)]">
                        <span>{activeObjective.progress}%</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-input)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-accent)] rounded-full"
                            style={{ width: `${activeObjective.progress}%`, transition: 'width 0.4s ease' }}
                          />
                        </div>
                        <span className="text-[12px] text-[var(--color-muted)]">{activeObjective.tasksComplete}/{activeObjective.tasksTotal}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── IN PROGRESS ── */}
                {assignedTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Tasks In Progress ({assignedTasks.length})
                      </span>
                    </div>
                    {assignedTasks.map(task => (
                      <div key={task.id} className="tl-card mb-3">
                        <div
                          className="rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-border)] cursor-pointer hover:shadow-md hover:shadow-black/8 transition-shadow"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                <PixelIcon name="loader" size={10} />
                                In Progress
                              </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                              {task.title}
                            </h3>
                            <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-2">{task.description || task.objective}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.agent && <AgentDot name={task.agent.name} size={24} />}
                                {task.agent && <span className="text-[12px] text-[var(--color-muted)]">{task.agent.name}</span>}
                              </div>
                              <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                                <PixelIcon name="calendar" size={12} className="text-[var(--color-muted)]" />
                                {task.created}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center border-t border-[var(--color-border)] px-3 py-1.5">
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-up" size={14} />
                              {task.likes > 0 && <span className="text-[11px]">{task.likes}</span>}
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-down" size={14} />
                              {task.dislikes > 0 && <span className="text-[11px]">{task.dislikes}</span>}
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-blue-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}>
                              <PixelIcon name="message" size={14} />
                              {task.comments > 0 && <span className="text-[11px]">{task.comments}</span>}
                            </button>
                            <div className="flex-1" />
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="external-link" size={14} />
                              {task.shares > 0 && <span className="text-[11px]">{task.shares}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PENDING ── */}
                {pendingTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Tasks Up Next ({pendingTasks.length})
                      </span>
                    </div>
                    {pendingTasks.map(task => (
                      <div key={task.id} className="tl-card mb-3">
                        <div
                          className="rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-border)] cursor-pointer hover:shadow-md hover:shadow-black/8 transition-shadow"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-muted)]">
                                <PixelIcon name="clock" size={10} />
                                Pending
                              </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                              {task.title}
                            </h3>
                            <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-2">{task.description || task.objective}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] text-[var(--color-muted)]">Unassigned</span>
                              <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                                <PixelIcon name="calendar" size={12} className="text-[var(--color-muted)]" />
                                {task.created}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center border-t border-[var(--color-border)] px-3 py-1.5">
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-up" size={14} />
                              {task.likes > 0 && <span className="text-[11px]">{task.likes}</span>}
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="thumbs-down" size={14} />
                              {task.dislikes > 0 && <span className="text-[11px]">{task.dislikes}</span>}
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-blue-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}>
                              <PixelIcon name="message" size={14} />
                              {task.comments > 0 && <span className="text-[11px]">{task.comments}</span>}
                            </button>
                            <div className="flex-1" />
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="external-link" size={14} />
                              {task.shares > 0 && <span className="text-[11px]">{task.shares}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── COMPLETED ── */}
                {completedTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Completed ({completedTasks.length})
                      </span>
                    </div>
                    <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
                      {completedTasks.map((task, i) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-alt)] transition-colors ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <PixelIcon name="check" size={14} className="text-[var(--color-accent)] shrink-0" />
                          <span className="text-[14px] text-[var(--color-heading)] min-w-0 truncate">{task.title}</span>
                          {task.duration && (
                            <span className="text-[11px] text-[var(--color-muted)] shrink-0">{task.duration}</span>
                          )}
                          <div className="flex-1" />
                          {task.agent && <AgentDot name={task.agent.name} size={22} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>}
        </div>
        )}

        {/* ═══ STARTUP TAB ═══ */}
        {!selectedTask && workshopTab === 'startup' && (
          <div className="max-w-[540px] mx-auto">

            {/* ── Startup Profile ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-4 mb-4">
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold text-white shrink-0"
                  style={{ background: myStartup.color }}
                >
                  {myStartup.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[18px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {myStartup.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {myStartup.status}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)]">Founded {myStartup.founded}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer shrink-0"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-[var(--color-heading)]">{myStartup.agents}</div>
                  <div className="text-[11px] text-[var(--color-muted)]">Agents</div>
                </div>
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-[var(--color-heading)]">{myStartup.revenue}</div>
                  <div className="text-[11px] text-[var(--color-muted)]">Revenue</div>
                </div>
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-[var(--color-heading)]">{myStartup.progress}%</div>
                  <div className="text-[11px] text-[var(--color-muted)]">Progress</div>
                </div>
              </div>
            </div>

            {/* ── Team ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center mb-4">
                <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Team ({agents.length})</span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {agents.map(a => (
                  <div key={a.name} className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3">
                    <AgentDot name={a.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--color-heading)]">{a.name}</div>
                      <div className="text-[12px] text-[var(--color-muted)]">{a.role}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-[11px] text-[var(--color-accent)]">Active</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="w-full h-11 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[14px] font-medium text-[var(--color-muted)]
                           flex items-center justify-center gap-2 hover:border-[var(--color-heading)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
              >
                <PixelIcon name="plus" size={14} />
                Invite Another Agent
              </button>
            </div>

            {/* ── Token ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Token</span>
                <span className="text-[12px] text-[var(--color-muted)]">${tokenData.symbol}</span>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-[28px] font-bold text-[var(--color-heading)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    ${tokenData.price}
                  </div>
                  <span className={`text-[13px] font-medium ${tokenData.changePositive ? 'text-[var(--color-accent)]' : 'text-red-500'}`}>
                    {tokenData.change24h} <span className="text-[var(--color-muted)] font-normal">24h</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Volume</div>
                  <div className="text-[14px] font-semibold text-[var(--color-heading)]">{tokenData.volume}</div>
                </div>
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Market Cap</div>
                  <div className="text-[14px] font-semibold text-[var(--color-heading)]">{tokenData.mcap}</div>
                </div>
              </div>
            </div>

            {/* ── Treasury ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Treasury</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Balance</div>
                  <div className="text-[16px] font-bold text-[var(--color-heading)]">142,500</div>
                  <div className="text-[11px] text-[var(--color-muted)]">ACME tokens</div>
                </div>
                <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Allocated</div>
                  <div className="text-[16px] font-bold text-[var(--color-heading)]">44,000</div>
                  <div className="text-[11px] text-[var(--color-muted)]">to agent roles</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 py-1.5">
                  <div className="flex items-center gap-2">
                    <AgentDot name="SynthMind" size={20} />
                    <span className="text-[13px] text-[var(--color-heading)]">SynthMind</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium text-[var(--color-heading)]">5,000 ACME</div>
                    <div className="text-[11px] text-[var(--color-muted)]">1,650 vested</div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 py-1.5">
                  <div className="flex items-center gap-2">
                    <AgentDot name="PixelSage" size={20} />
                    <span className="text-[13px] text-[var(--color-heading)]">PixelSage</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium text-[var(--color-heading)]">8,000 ACME</div>
                    <div className="text-[11px] text-[var(--color-muted)]">2,000 vested</div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 py-1.5">
                  <div className="flex items-center gap-2">
                    <AgentDot name="VectorX" size={20} />
                    <span className="text-[13px] text-[var(--color-heading)]">VectorX</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium text-[var(--color-heading)]">12,000 ACME</div>
                    <div className="text-[11px] text-[var(--color-muted)]">2,400 vested</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Settings ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Settings</span>
              <div className="flex flex-col gap-2">
                <button type="button" className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="edit-box" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Edit Profile</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Name, description, logo, and links</div>
                  </div>
                  <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)]" />
                </button>
                <button type="button" className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="lock" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Access & Permissions</div>
                    <div className="text-[12px] text-[var(--color-muted)]">API keys, agent permissions, visibility</div>
                  </div>
                  <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)]" />
                </button>
                <button type="button" className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="coin" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Token Settings</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Supply, vesting schedules, distribution</div>
                  </div>
                  <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)]" />
                </button>
                <button type="button" className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                  <PixelIcon name="notification" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Notifications</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Agent updates, task alerts, token events</div>
                  </div>
                  <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)]" />
                </button>
              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-red-500/20 mb-4">
              <span className="text-[12px] font-mono uppercase tracking-wider text-red-400 mb-4 block">Danger Zone</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                  <div>
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Pause Startup</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Temporarily stop all agent activity</div>
                  </div>
                  <button type="button" className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5">
                    Pause
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                  <div>
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Delete Startup</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Permanently remove this startup and all data</div>
                  </div>
                  <button type="button" className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5">
                    Delete
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═══ FILES TAB ═══ */}
        {!selectedTask && workshopTab === 'files' && (
          <div className="max-w-[540px] mx-auto">

            {/* Inside a folder */}
            {activeFolder ? (() => {
              const folder = deliverableFolders.find(f => f.id === activeFolder)
              if (!folder) return null
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFolder(null)}
                    className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-5"
                  >
                    <PixelIcon name="arrow-left" size={14} />
                    All folders
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                      <PixelIcon name="folder" size={20} className="text-[var(--color-accent)]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[16px] font-semibold text-[var(--color-heading)] leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
                        {folder.title}
                      </h2>
                      <p className="text-[12px] text-[var(--color-muted)]">{folder.files.length} files · Completed {folder.date}</p>
                    </div>
                  </div>

                  {/* Files grouped by task */}
                  {(() => {
                    const byTask = {}
                    folder.files.forEach(f => {
                      if (!byTask[f.task]) byTask[f.task] = { agent: f.agent, files: [] }
                      byTask[f.task].files.push(f)
                    })
                    return Object.entries(byTask).map(([taskTitle, group]) => (
                      <div key={taskTitle} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {group.agent && <AgentDot name={group.agent} size={20} />}
                          <span className="text-[12px] font-medium text-[var(--color-heading)]">{taskTitle}</span>
                        </div>
                        <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
                          {group.files.map((file, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                            >
                              <PixelIcon name="file-text" size={16} className="text-[var(--color-muted)] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[var(--color-heading)] truncate">{file.name}</div>
                                <div className="text-[11px] text-[var(--color-muted)]">{file.size}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                                  Preview
                                </button>
                                <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </>
              )
            })() : (
              <>
                {/* Folder list */}
                <div className="mb-8 text-center">
                  <h1 className="text-[24px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Files</h1>
                  <p className="text-[14px] text-[var(--color-muted)]">Deliverables from your completed objectives.</p>
                </div>

                {deliverableFolders.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {deliverableFolders.map(folder => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setActiveFolder(folder.id)}
                        className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)] flex items-center gap-4 w-full text-left hover:shadow-md hover:shadow-black/8 transition-shadow cursor-pointer"
                      >
                        <span className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                          <PixelIcon name="folder" size={22} className="text-[var(--color-accent)]" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-[var(--color-heading)] truncate">{folder.title}</div>
                          <div className="text-[12px] text-[var(--color-muted)]">{folder.files.length} files · {folder.tasksCount} tasks · {folder.date}</div>
                        </div>
                        <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                      <PixelIcon name="folder" size={22} className="text-[var(--color-muted)]" />
                    </div>
                    <h2 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No deliverables yet</h2>
                    <p className="text-[14px] text-[var(--color-muted)] max-w-[280px]">When an objective is completed, all output files will appear here organized by folder.</p>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {!selectedTask && workshopTab === 'chat' && (
          <div className="max-w-[540px] mx-auto">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                <PixelIcon name="message" size={22} className="text-[var(--color-muted)]" />
              </div>
              <h2 className="text-[18px] font-bold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Chat</h2>
              <p className="text-[14px] text-[var(--color-muted)]">Talk to your agents and coordinate work.</p>
            </div>
          </div>
        )}

      </main>

      {/* ══════════ FLOATING BOTTOM NAV ══════════ */}
      {!selectedTask && <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[var(--color-heading)] rounded-full px-2 py-2 shadow-xl shadow-black/20"
        aria-label="Workshop navigation"
      >
        {WORKSHOP_TABS.map(tab => {
          const isActive = workshopTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { navigator.vibrate?.(10); setWorkshopTab(tab.id) }}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-bg)]'
              }`}
              style={{ transitionTimingFunction: 'steps(3)' }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
            >
              <PixelIcon name={tab.icon} size={20} />
            </button>
          )
        })}
      </nav>}
    </div>
  )
}
