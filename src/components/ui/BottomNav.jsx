import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import PixelIcon from '../PixelIcon'

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

/**
 * Floating bottom navigation bar with add menu, sliding indicators,
 * and chat input morph when the chat tab is active.
 */
export function BottomNav({ tabs = [], activeTab, onTabChange, addItems = [], notifications = {}, avatarUrl, profile, profileItems = [], chatTabId = 'chat', onSendMessage }) {
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [navWidth, setNavWidth] = useState(null)
  const barRef = useRef(null)
  const chatInputRef = useRef(null)
  const tabsContainerRef = useRef(null)
  const activeIndicatorRef = useRef(null)
  const hoverIndicatorRef = useRef(null)
  const [chatInputOpen, setChatInputOpen] = useState(false)
  const isMobile = useIsMobile()

  const isChatMode = activeTab === chatTabId && chatInputOpen

  // Open chat input when chat tab is selected
  useEffect(() => {
    if (activeTab === chatTabId) setChatInputOpen(true)
  }, [activeTab, chatTabId])

  // Measure nav's natural width
  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    const prevWidth = el.style.width
    const prevTransition = el.style.transition
    el.style.transition = 'none'
    el.style.width = 'auto'
    const w = el.offsetWidth
    el.style.width = prevWidth
    el.offsetHeight
    el.style.transition = prevTransition
    setNavWidth(w)
  }, [tabs.length, addItems.length, avatarUrl])

  // Auto-focus chat input
  useEffect(() => {
    if (isChatMode) {
      const t = setTimeout(() => chatInputRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [isChatMode])

  // Close menus when entering chat mode
  useEffect(() => {
    if (isChatMode) { setAddMenuOpen(false); setProfileMenuOpen(false) }
  }, [isChatMode])

  // Close on outside click / escape — add menu
  useEffect(() => {
    if (!addMenuOpen) return
    const handleClick = () => setAddMenuOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setAddMenuOpen(false) }
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [addMenuOpen])

  // Close on outside click / escape — profile menu
  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClick = () => setProfileMenuOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setProfileMenuOpen(false) }
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [profileMenuOpen])

  const getTabOffset = useCallback((idx) => idx * 48, [])

  // Animate active indicator
  useEffect(() => {
    const el = activeIndicatorRef.current
    if (!el) return
    const idx = tabs.findIndex(t => t.id === activeTab)
    if (idx < 0) return
    el.style.transform = `translateX(${getTabOffset(idx)}px)`
    el.style.opacity = '1'
  }, [activeTab, tabs, getTabOffset])

  // Animate hover indicator
  useEffect(() => {
    const el = hoverIndicatorRef.current
    if (!el) return
    if (hoveredIdx === null) { el.style.opacity = '0'; return }
    el.style.transform = `translateX(${getTabOffset(hoveredIdx)}px)`
    el.style.opacity = '1'
  }, [hoveredIdx, getTabOffset])

  const handleSend = () => {
    const msg = chatInput.trim()
    if (!msg) return
    onSendMessage?.(msg)
    setChatInput('')
  }

  const chatWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth - 40 : 500, 540)

  // Bloom animation helpers
  const bloomOpen = 'scale 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease-out, filter 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)'
  const bloomClose = 'scale 0.15s cubic-bezier(0.4, 0, 1, 1), opacity 0.12s ease-in, filter 0.15s cubic-bezier(0.4, 0, 1, 1)'
  const bloomStyle = (isOpen, origin) => ({
    transformOrigin: origin,
    scale: isOpen ? '1' : '0.85',
    opacity: isOpen ? 1 : 0,
    filter: isOpen ? 'blur(0px)' : 'blur(8px)',
    transition: isOpen ? bloomOpen : bloomClose,
    pointerEvents: isOpen ? 'auto' : 'none',
  })
  const menuShadow = { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }

  // Shared menu item classes
  const menuItemClass = (danger) =>
    `w-full text-left px-2.5 py-2.5 text-[13px] hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] ${
      danger ? 'text-red-400 hover:text-red-300' : 'text-white/80 hover:text-white'
    }`

  // Menu content renderers (shared between desktop & mobile)
  const renderAddMenuContent = () => (
    <>
      <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">Create</div>
      {addItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { setAddMenuOpen(false); item.onAction?.() }}
          className="w-full text-left px-2.5 py-2.5 text-[13px] text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96]"
        >
          <PixelIcon name={item.icon} size={14} className={item.iconColor || 'text-white/40'} />
          {item.label}
        </button>
      ))}
    </>
  )

  const renderProfileMenuContent = () => (
    <>
      {profile && (
        <>
          <div className="px-2.5 py-2.5">
            <div className="text-[13px] font-semibold text-white truncate">{profile.name}</div>
            <div className="text-[11px] text-white/40 truncate">{profile.email}</div>
          </div>
          <div className="border-t border-white/10 mx-2.5 my-1" />
        </>
      )}
      {profileItems.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { setProfileMenuOpen(false); item.onAction?.() }}
          className={menuItemClass(item.danger)}
        >
          <PixelIcon name={item.icon} size={14} className={item.danger ? 'text-red-400/60' : 'text-white/40'} />
          {item.label}
        </button>
      ))}
    </>
  )

  return (
    <>
      {/* Progressive blur backdrop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--color-bg) 30%, color-mix(in srgb, var(--color-bg) 80%, transparent) 60%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Mobile bottom sheet menus — full width, attached to nav */}
      {isMobile && (
        <>
          {/* Add menu sheet */}
          <div
            className="fixed bottom-[76px] left-1/2 z-50"
            style={{
              width: navWidth || 'auto',
              transform: 'translateX(-50%)',
              ...bloomStyle(addMenuOpen, 'bottom center'),
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2" style={menuShadow}>
              {renderAddMenuContent()}
            </div>
          </div>

          {/* Profile menu sheet */}
          <div
            className="fixed bottom-[76px] left-1/2 z-50"
            style={{
              width: navWidth || 'auto',
              transform: 'translateX(-50%)',
              ...bloomStyle(profileMenuOpen, 'bottom center'),
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2" style={menuShadow}>
              {renderProfileMenuContent()}
            </div>
          </div>
        </>
      )}

      {/* Single morphing bar */}
      <nav
        ref={barRef}
        className="fixed bottom-5 left-1/2 z-50 bg-[var(--color-heading)] rounded-[20px] shadow-xl shadow-black/20"
        style={{
          transform: 'translateX(-50%)',
          width: navWidth ? (isChatMode ? chatWidth : navWidth) : undefined,
          transition: navWidth ? 'width 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)' : undefined,
        }}
        aria-label="Navigation"
      >
        {/* Nav content — relative, drives the bar's natural width */}
        <div
          className="flex items-center gap-1 px-2 py-2"
          style={{
            opacity: isChatMode ? 0 : 1,
            scale: isChatMode ? '0.85' : '1',
            filter: isChatMode ? 'blur(6px)' : 'blur(0px)',
            transition: isChatMode
              ? 'opacity 0.12s cubic-bezier(0.4, 0, 1, 1), scale 0.12s cubic-bezier(0.4, 0, 1, 1), filter 0.12s cubic-bezier(0.4, 0, 1, 1)'
              : 'opacity 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, scale 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, filter 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s',
            pointerEvents: isChatMode ? 'none' : 'auto',
          }}
          aria-hidden={isChatMode}
        >
          {/* Add button */}
          {addItems.length > 0 && (
            <>
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setAddMenuOpen(prev => !prev); setProfileMenuOpen(false) }}
                  className={`flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-[background-color,color,scale] duration-200 ease-out active:scale-[0.96] ${
                    addMenuOpen
                      ? 'bg-[var(--color-accent)] text-[#0d2000]'
                      : 'bg-white text-[var(--color-heading)] hover:bg-[var(--color-accent)] hover:text-[#0d2000]'
                  }`}
                  aria-label={addMenuOpen ? 'Close menu' : 'Add new'}
                  aria-expanded={addMenuOpen}
                >
                  <span className="relative flex items-center justify-center w-[18px] h-[18px]">
                    <span
                      className="absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 0 : 1, scale: addMenuOpen ? '0.25' : '1', filter: addMenuOpen ? 'blur(4px)' : 'blur(0px)' }}
                    >
                      <PixelIcon name="plus" size={18} />
                    </span>
                    <span
                      className="transition-[opacity,filter,scale] duration-300"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)', opacity: addMenuOpen ? 1 : 0, scale: addMenuOpen ? '1' : '0.25', filter: addMenuOpen ? 'blur(0px)' : 'blur(4px)' }}
                    >
                      <PixelIcon name="close" size={18} />
                    </span>
                  </span>
                </button>

                {/* Desktop bloom menu */}
                {!isMobile && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3"
                    style={bloomStyle(addMenuOpen, 'bottom center')}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2 w-52" style={menuShadow}>
                      {renderAddMenuContent()}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-white/10 mx-0.5" />
            </>
          )}

          {/* Tabs */}
          <div
            ref={tabsContainerRef}
            className="relative flex items-center gap-1"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              ref={activeIndicatorRef}
              className="absolute top-0 left-0 w-11 h-11 rounded-xl bg-[var(--color-accent)]/15 pointer-events-none"
              style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
              aria-hidden="true"
            />
            <div
              ref={hoverIndicatorRef}
              className="absolute top-0 left-0 w-11 h-11 rounded-xl bg-white/10 pointer-events-none"
              style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s', opacity: 0 }}
              aria-hidden="true"
            />
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id
              const notifCount = notifications[tab.id] || 0
              return (
                <div key={tab.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => { navigator.vibrate?.(10); onTabChange?.(tab.id); setAddMenuOpen(false) }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-[color,scale] duration-150 ease-out active:scale-[0.96] ${
                      isActive ? 'text-[var(--color-accent)]' : 'text-white/65 hover:text-white'
                    }`}
                    aria-label={`${tab.label}${notifCount > 0 ? ` (${notifCount} new)` : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <PixelIcon name={tab.icon} size={20} />
                    {notifCount > 0 && !isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-heading)]" />
                    )}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-2.5 py-1 rounded-lg bg-[var(--color-heading)] text-white text-[11px] font-medium whitespace-nowrap
                                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg">
                    {tab.label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--color-heading)]" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Avatar + profile menu */}
          {avatarUrl && (
            <>
              <div className="w-px h-6 bg-white/10 mx-0.5" />
              <div className="relative w-11 h-11 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { navigator.vibrate?.(10); setProfileMenuOpen(prev => !prev); setAddMenuOpen(false) }}
                  className="w-11 h-11 rounded-xl overflow-hidden cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-90"
                  aria-label="Profile menu"
                  aria-expanded={profileMenuOpen}
                  style={{ outline: '2px solid rgba(255,255,255,0.15)', outlineOffset: '-2px' }}
                >
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                </button>

                {/* Desktop bloom menu */}
                {!isMobile && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3"
                    style={bloomStyle(profileMenuOpen, 'bottom center')}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2 w-56" style={menuShadow}>
                      {renderProfileMenuContent()}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chat input layer — absolute overlay */}
        <div
          className="absolute inset-0 flex items-center gap-2 px-2 py-2"
          style={{
            opacity: isChatMode ? 1 : 0,
            scale: isChatMode ? '1' : '0.85',
            filter: isChatMode ? 'blur(0px)' : 'blur(6px)',
            transition: isChatMode
              ? 'opacity 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, scale 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s, filter 0.2s cubic-bezier(0.2, 0, 0, 1) 0.08s'
              : 'opacity 0.12s cubic-bezier(0.4, 0, 1, 1), scale 0.12s cubic-bezier(0.4, 0, 1, 1), filter 0.12s cubic-bezier(0.4, 0, 1, 1)',
            pointerEvents: isChatMode ? 'auto' : 'none',
          }}
          aria-hidden={!isChatMode}
        >
          <button
            type="button"
            onClick={() => { navigator.vibrate?.(10); setChatInputOpen(false) }}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-[color,background-color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex-shrink-0"
            aria-label="Collapse chat input"
          >
            <PixelIcon name="arrow-left" size={18} />
          </button>

          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="Message your agents..."
            className="flex-1 bg-white/10 rounded-xl px-4 h-11 text-[13px] text-white placeholder-white/30 outline-none focus:bg-white/15 transition-[background-color] duration-150 min-w-0"
          />

          <button
            type="button"
            onClick={handleSend}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-[background-color,color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex-shrink-0 ${
              chatInput.trim()
                ? 'bg-[var(--color-accent)] text-[#0d2000]'
                : 'bg-white/10 text-white/30'
            }`}
            aria-label="Send message"
          >
            <PixelIcon name="arrow-right" size={18} />
          </button>
        </div>
      </nav>
    </>
  )
}
