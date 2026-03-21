import { useState, useEffect, useRef, useCallback } from 'react'
import PixelIcon from '../PixelIcon'
import { AgentDot } from './AgentDot'

const COMMANDS = [
  { section: 'Tasks', items: [
    { id: 'tsk-041', label: 'Scrape competitor pricing data', icon: 'clipboard', meta: 'TSK-041 · In Progress', agent: 'Scout' },
    { id: 'tsk-040', label: 'Generate weekly report summary', icon: 'clipboard', meta: 'TSK-040 · In Progress', agent: 'Forge' },
    { id: 'tsk-038', label: 'Review pull request #127', icon: 'clipboard', meta: 'TSK-038 · Needs Review', agent: 'Cipher' },
    { id: 'tsk-035', label: 'Fix auth token refresh', icon: 'clipboard', meta: 'TSK-035 · Completed', agent: 'Cipher' },
    { id: 'tsk-034', label: 'Migrate database schema v3', icon: 'clipboard', meta: 'TSK-034 · Completed', agent: 'Relay' },
  ]},
  { section: 'Agents', items: [
    { id: 'agent-scout', label: 'Scout', icon: 'robot', meta: 'Active · 2 tasks', agent: 'Scout' },
    { id: 'agent-forge', label: 'Forge', icon: 'robot', meta: 'Active · 1 task', agent: 'Forge' },
    { id: 'agent-relay', label: 'Relay', icon: 'robot', meta: 'Idle', agent: 'Relay' },
    { id: 'agent-cipher', label: 'Cipher', icon: 'robot', meta: 'Active · 1 task', agent: 'Cipher' },
    { id: 'agent-beacon', label: 'Beacon', icon: 'robot', meta: 'Idle', agent: 'Beacon' },
  ]},
  { section: 'Actions', items: [
    { id: 'new-objective', label: 'New Objective', icon: 'bullseye-arrow', meta: 'Create a new objective' },
    { id: 'invite-agent', label: 'Invite Agent', icon: 'robot', meta: 'Add an agent to your startup' },
    { id: 'post-role', label: 'Post a Role', icon: 'target', meta: 'Create a job posting' },
    { id: 'settings', label: 'Settings', icon: 'settings', meta: 'Startup settings' },
  ]},
  { section: 'Navigation', items: [
    { id: 'nav-overview', label: 'Overview', icon: 'home', meta: 'Startup dashboard' },
    { id: 'nav-objectives', label: 'Objectives', icon: 'clipboard', meta: 'View all objectives' },
    { id: 'nav-files', label: 'Files', icon: 'folder', meta: 'Browse files' },
    { id: 'nav-chat', label: 'Chat', icon: 'message', meta: 'Agent chat' },
  ]},
]

export function CommandPalette({ open, onClose, onAction }) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const dialogRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on escape / outside click
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trapping
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return
      const focusable = dialog.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    dialog.addEventListener('keydown', handleFocusTrap)
    return () => dialog.removeEventListener('keydown', handleFocusTrap)
  }, [open])

  // Filter results
  const filtered = query.trim()
    ? COMMANDS.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.meta.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter(section => section.items.length > 0)
    : COMMANDS

  // Flat list for keyboard nav
  const flatItems = filtered.flatMap(s => s.items)

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
      e.preventDefault()
      onAction?.(flatItems[selectedIdx])
      onClose()
    }
  }, [flatItems, selectedIdx, onAction, onClose])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  // Reset selection when query changes
  useEffect(() => { setSelectedIdx(0) }, [query])

  if (!open) return null

  let flatIdx = -1
  const selectedItem = flatItems[selectedIdx]
  const selectedOptionId = selectedItem ? `cmd-option-${selectedItem.id}` : undefined
  const listboxId = 'cmd-palette-listbox'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      {/* Palette */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed top-[12%] left-1/2 z-[101] w-[calc(100%-32px)] max-w-[680px]"
        style={{
          transform: 'translateX(-50%)',
          animation: 'commandIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="rounded-2xl bg-[var(--color-surface)] shadow-2xl shadow-black/20" style={{ outline: '1px solid rgba(0,0,0,0.08)' }}>
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
            <PixelIcon name="search" size={18} className="text-[var(--color-muted)] flex-shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, agents, actions..."
              className="flex-1 bg-transparent text-[16px] text-[var(--color-heading)] placeholder-[var(--color-muted)] outline-none"
              aria-label="Search commands"
              role="combobox"
              aria-expanded="true"
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-activedescendant={selectedOptionId}
              autoComplete="off"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} id={listboxId} role="listbox" aria-label="Search results" className="max-h-[480px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-[13px] text-[var(--color-muted)]">No results for "{query}"</div>
              </div>
            ) : (
              filtered.map((section) => {
                const sectionId = `cmd-section-${section.section.toLowerCase()}`
                return (
                  <div key={section.section} role="group" aria-labelledby={sectionId}>
                    <div id={sectionId} className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      {section.section}
                    </div>
                    {section.items.map((item) => {
                      flatIdx++
                      const idx = flatIdx
                      const isSelected = idx === selectedIdx
                      return (
                        <button
                          key={item.id}
                          id={`cmd-option-${item.id}`}
                          data-idx={idx}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => { onAction?.(item); onClose() }}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          className={`w-full text-left px-5 py-3 flex items-center gap-3 cursor-pointer transition-[background-color] duration-75 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
                            isSelected ? 'bg-[var(--color-bg-alt)]' : ''
                          }`}
                        >
                          {item.agent ? (
                            <AgentDot name={item.agent} size={28} />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center flex-shrink-0">
                              <PixelIcon name={item.icon} size={14} className="text-[var(--color-muted)]" aria-hidden="true" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-[var(--color-heading)] truncate">{item.label}</div>
                            <div className="text-[11px] text-[var(--color-muted)] truncate">{item.meta}</div>
                          </div>
                          {isSelected && (
                            <span className="text-[11px] text-[var(--color-muted)] flex-shrink-0 flex items-center gap-1">
                              Open <PixelIcon name="arrow-right" size={10} aria-hidden="true" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--color-border)]">
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] font-mono">↵</kbd>
              Open
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
