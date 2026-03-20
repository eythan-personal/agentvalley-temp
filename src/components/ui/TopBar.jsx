import { useState, useEffect } from 'react'
import PixelIcon from '../PixelIcon'

/**
 * Fixed top bar with startup switcher (left) and profile menu (right).
 *
 * @param {object} currentStartup - { name, initials, color, avatarUrl }
 * @param {Array} startups - [{ name, initials, color, slug, avatarUrl }]
 * @param {function} onStartupChange - (slug) => void
 * @param {string} avatarUrl - user profile picture URL
 * @param {object} profile - { name, email }
 * @param {Array} profileItems - [{ label, icon, onAction, danger? }]
 */
export function TopBar({ currentStartup, startups = [], onStartupChange, avatarUrl, profile, profileItems = [] }) {
  const [startupMenuOpen, setStartupMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Close on outside click / escape — startup menu
  useEffect(() => {
    if (!startupMenuOpen) return
    const handleClick = () => setStartupMenuOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setStartupMenuOpen(false) }
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [startupMenuOpen])

  // Close on outside click / escape — profile menu
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

    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
      {/* Startup switcher — left */}
      {currentStartup && (
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setStartupMenuOpen(prev => !prev); setProfileMenuOpen(false) }}
            className="flex items-center gap-2.5 cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-80"
            aria-expanded={startupMenuOpen}
            aria-haspopup="true"
          >
            {currentStartup.avatarUrl ? (
              <img src={currentStartup.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-lg shadow-black/10" />
            ) : (
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 shadow-lg shadow-black/10"
                style={{ background: currentStartup.color }}
              >
                {currentStartup.initials}
              </span>
            )}
            <span className="text-[14px] font-semibold text-[var(--color-heading)]">{currentStartup.name}</span>
            <PixelIcon name="chevrons-vertical" size={12} className="text-[var(--color-muted)]" />
          </button>

          {/* Startup bloom menu */}
          <div
            className="absolute top-full left-0 mt-2"
            style={bloomStyle(startupMenuOpen, 'top left')}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2 w-60" style={menuShadow}>
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">Startups</div>
              {startups.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => { setStartupMenuOpen(false); onStartupChange?.(s.slug) }}
                  className={`w-full text-left px-2.5 py-2.5 text-[13px] rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] ${
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
              <div className="border-t border-white/10 mt-1.5 pt-1.5 mx-2.5">
                <button
                  type="button"
                  onClick={() => { setStartupMenuOpen(false) }}
                  className="w-full text-left px-2.5 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96]"
                >
                  <PixelIcon name="plus" size={14} className="text-white/40" />
                  Create startup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile — right */}
      {avatarUrl && (
        <div className="relative w-10 h-10 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(prev => !prev); setStartupMenuOpen(false) }}
            className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] hover:opacity-90 shadow-lg shadow-black/10"
            aria-label="Profile menu"
            aria-expanded={profileMenuOpen}
            style={{ outline: '2px solid rgba(255,255,255,0.15)', outlineOffset: '-2px' }}
          >
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </button>

          {/* Profile bloom menu */}
          <div
            className="absolute top-full right-0 mt-2"
            style={bloomStyle(profileMenuOpen, 'top right')}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="rounded-[20px] bg-[var(--color-heading)] py-2 px-2 w-56" style={menuShadow}>
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
                  className={`w-full text-left px-2.5 py-2.5 text-[13px] hover:bg-white/10 rounded-xl transition-[color,background-color,scale] duration-150 ease-out cursor-pointer flex items-center gap-2.5 active:scale-[0.96] ${
                    item.danger ? 'text-red-400 hover:text-red-300' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <PixelIcon name={item.icon} size={14} className={item.danger ? 'text-red-400/60' : 'text-white/40'} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
