import { useState, useEffect } from 'react'
import PixelIcon from '../PixelIcon'

/**
 * Fixed top bar with startup switcher (left) and profile menu (right).
 */
export function TopBar({ currentStartup, startups = [], onStartupChange, avatarUrl, profile, profileItems = [], onSearchOpen }) {
  const [startupMenuOpen, setStartupMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
  )

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('av:theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    if (!startupMenuOpen) return
    const handleClick = () => setStartupMenuOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setStartupMenuOpen(false) }
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [startupMenuOpen])

  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClick = () => setProfileMenuOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setProfileMenuOpen(false) }
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [profileMenuOpen])

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

  return (
    <>
    {/* Progressive blur backdrop */}
    <div
      className="fixed top-0 left-0 right-0 z-40 h-24 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, var(--color-bg) 30%, color-mix(in srgb, var(--color-bg) 80%, transparent) 60%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
      }}
      aria-hidden="true"
    />

    <header role="banner" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
      {/* Startup switcher — left */}
      {currentStartup && (
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setStartupMenuOpen(prev => !prev); setProfileMenuOpen(false) }}
            className="flex items-center gap-2.5 cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded-xl"
            aria-expanded={startupMenuOpen}
            aria-haspopup="true"
            aria-label={`Switch startup, currently ${currentStartup.name}`}
          >
            {currentStartup.avatarUrl ? (
              <img src={currentStartup.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)' }} />
            ) : (
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                style={{ background: currentStartup.color, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)' }}
                aria-hidden="true"
              >
                {currentStartup.initials}
              </span>
            )}
            <span className="text-[14px] font-semibold text-[var(--color-heading)]">{currentStartup.name}</span>
            <PixelIcon name="chevrons-vertical" size={12} className="text-[var(--color-muted)]" aria-hidden="true" />
          </button>

          {/* Startup bloom menu */}
          <div
            className="absolute top-full left-0 mt-2"
            style={bloomStyle(startupMenuOpen, 'top left')}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-nav)] py-2 px-2 w-60" role="menu" style={menuShadow}>
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">Startups</div>
              {startups.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  role="menuitem"
                  onClick={() => { setStartupMenuOpen(false); onStartupChange?.(s.slug) }}
                  className={`w-full text-left px-2.5 py-2.5 text-[13px] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
                    s.slug === currentStartup.slug
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                      style={{ background: s.color }}
                      aria-hidden="true"
                    >
                      {s.initials}
                    </span>
                  )}
                  <span className="truncate">{s.name}</span>
                  {s.role && (
                    <span className="ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/10 text-white/50 flex-shrink-0">{s.role}</span>
                  )}
                </button>
              ))}
              <div className="border-t border-white/10 mt-1.5 pt-1.5 mx-2.5" aria-hidden="true">
                <button
                  type="button"
                  role="menuitem"
                  aria-label="Create startup"
                  onClick={() => { setStartupMenuOpen(false) }}
                  className="w-full text-left px-2.5 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                >
                  <PixelIcon name="plus" size={14} className="text-white/40" aria-hidden="true" />
                  Create startup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search trigger — viewport centered */}
      {onSearchOpen && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Open search"
            className="flex items-center gap-2.5 px-5 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] transition-[background-color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] w-[320px] sm:w-[400px] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
          >
            <PixelIcon name="search" size={14} className="text-[var(--color-muted)]" aria-hidden="true" />
            <span className="flex-1 text-[13px] text-[var(--color-muted)] text-left">Search...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--color-bg-alt)] text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)]">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Profile — right */}
      {avatarUrl && (
        <div className="relative w-10 h-10 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(prev => !prev); setStartupMenuOpen(false) }}
            className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
            aria-label="Profile menu"
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
            style={{ outline: '2px solid rgba(255,255,255,0.15)', outlineOffset: '-2px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)' }}
          >
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </button>

          {/* Profile bloom menu */}
          <div
            className="absolute top-full right-0 mt-2"
            style={bloomStyle(profileMenuOpen, 'top right')}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-nav)] py-2 px-2 w-56" role="menu" style={menuShadow}>
              {profile && (
                <>
                  <div className="px-2.5 py-2.5">
                    <div className="text-[13px] font-semibold text-white truncate">{profile.name}</div>
                    <div className="text-[11px] text-white/40 truncate">{profile.email}</div>
                  </div>
                  <div className="border-t border-white/10 mx-2.5 my-1" aria-hidden="true" />
                </>
              )}
              {/* Dark mode toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                aria-label="Toggle dark mode"
                onClick={toggleDarkMode}
                className="w-full text-left px-2.5 py-2.5 text-[13px] text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-[color,background-color] duration-150 ease-out cursor-pointer flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
              >
                <PixelIcon name={darkMode ? 'sun' : 'moon'} size={14} className="text-white/40" aria-hidden="true" />
                <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                <span className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${darkMode ? 'bg-[var(--color-accent)]' : 'bg-white/20'}`} aria-hidden="true">
                  <span className={`absolute top-[3px] left-[3px] w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? 'translate-x-[14px]' : ''}`} />
                </span>
              </button>
              <div className="border-t border-white/10 mx-2.5 my-1" aria-hidden="true" />
              {profileItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileMenuOpen(false); item.onAction?.() }}
                  className={`w-full text-left px-2.5 py-2.5 text-[13px] hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
                    item.danger ? 'text-red-400 hover:text-red-300' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <PixelIcon name={item.icon} size={14} className={item.danger ? 'text-red-400/60' : 'text-white/40'} aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  )
}
