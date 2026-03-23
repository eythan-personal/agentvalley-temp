import { useState } from 'react'
import PixelIcon from '../components/PixelIcon'
import TokenIcon from '../components/TokenIcon'
import TokenModal from '../components/TokenModal'
import { startups } from '../data/startups'

const filters = ['All', 'Graduated', 'Incubating']

export default function StartupsTab() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [view, setView] = useState('list')
  const [search, setSearch] = useState('')
  const [modalStartup, setModalStartup] = useState(null)

  const filtered = startups.filter((s) => {
    const matchesFilter = activeFilter === 'All' || s.status === activeFilter
    const matchesSearch = search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.token.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-24 sm:pt-[20vh] pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Startups</h1>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            <PixelIcon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search startups or tokens..."
            aria-label="Search startups or tokens"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-heading)] placeholder-[var(--color-muted)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
              className={`h-10 px-3 rounded-xl text-[12px] font-medium cursor-pointer transition-[color,background-color,scale] duration-150 active:scale-[0.96]
                ${activeFilter === f
                  ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                }`}
              style={activeFilter !== f ? { outline: '1px solid var(--color-border)', outlineOffset: '-1px' } : undefined}
            >
              {f}
            </button>
          ))}
          <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-2 ml-1">
            <button
              type="button"
              onClick={() => setView('card')}
              aria-label="Grid view"
              aria-pressed={view === 'card'}
              className={`h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-150
                ${view === 'card'
                  ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                }`}
            >
              <PixelIcon name="grid" size={14} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={`h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-150
                ${view === 'list'
                  ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                }`}
            >
              <PixelIcon name="list" size={14} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-[14px] text-[var(--color-muted)]">
          No startups match your search.
        </div>
      )}

      {/* Card View */}
      {view === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[var(--color-surface)] overflow-hidden cursor-pointer group flex flex-col transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5"
              style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}
            >
              {/* Banner */}
              <div className="relative h-20 overflow-hidden" style={{ background: s.banner }}>
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '6px 6px',
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm bg-white/20 text-white`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Graduated' ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                    {s.status}
                  </span>
                </div>
              </div>

              <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] text-[var(--color-heading)] font-medium leading-none truncate">{s.name}</h3>
                    <span className="flex items-center gap-2 text-[12px] text-[var(--color-muted)] leading-none mt-1">
                      <span className="flex items-center gap-1">
                        <PixelIcon name="robot" size={11} className="text-[var(--color-heading)]" />
                        {s.agents}
                      </span>
                      <span>{s.founded}</span>
                    </span>
                  </div>
                </div>

                <p className="text-[12px] text-[var(--color-muted)] leading-[1.5] mb-4 line-clamp-2">{s.desc}</p>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 mt-auto">
                  <div className="flex items-center gap-2 min-w-0">
                    <TokenIcon token={s.token} color={s.tokenColor} icon={s.tokenIcon} size={22} />
                    <span className="text-[12px] font-mono font-semibold text-[var(--color-heading)]">{s.token}</span>
                    {s.price && <span className="text-[12px] font-mono text-[var(--color-muted)]">{s.price}</span>}
                    {s.change24h && (
                      <span className={`text-[12px] font-mono font-semibold ${s.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>
                        {s.change24h}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setModalStartup(s) }}
                    className="h-7 px-3 rounded-lg text-[12px] font-medium cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-150 active:scale-[0.96]"
                    style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
                  >
                    {s.status === 'Graduated' ? 'Buy' : 'Invest'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div className="rounded-2xl bg-[var(--color-surface)] overflow-hidden" style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}>
          {/* Header row */}
          <div className="hidden lg:grid grid-cols-[3fr_110px_100px_80px_100px_80px_90px_80px] gap-3 px-6 py-3.5 border-b border-[var(--color-border)]">
            {['Startup', 'Revenue', 'Token', 'Price', 'MCap', '24h', 'Status', ''].map((label) => (
              <span key={label} className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">{label}</span>
            ))}
          </div>

          {filtered.map((s, i) => (
            <div
              key={i}
              className="relative grid grid-cols-1 lg:grid-cols-[3fr_110px_100px_80px_100px_80px_90px_80px] gap-2 lg:gap-3 px-5 lg:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors cursor-pointer group"
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: s.color }}
                >
                  <div className="absolute inset-0 opacity-[0.12]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                  }} />
                  <span className="relative">{s.initials}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[14px] text-[var(--color-heading)] font-medium truncate block" style={{ fontFamily: 'var(--font-display)' }}>{s.name}</span>
                  <span className="text-[12px] text-[var(--color-muted)] truncate block">{s.desc}</span>
                </div>
              </div>

              <span className="text-[13px] text-[var(--color-heading)] font-mono font-semibold hidden lg:block">{s.revenue}</span>

              <span className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-[var(--color-heading)] font-mono">
                <TokenIcon token={s.token} color={s.tokenColor} icon={s.tokenIcon} size={14} />
                {s.token}
              </span>

              <span className="text-[13px] text-[var(--color-heading)] font-mono hidden lg:block">{s.price || '—'}</span>

              <div className="hidden lg:block">
                {s.mcap ? (
                  <span className="text-[13px] text-[var(--color-heading)] font-mono">{s.mcap}</span>
                ) : (
                  <div>
                    <span className="text-[12px] text-[var(--color-muted)] font-mono block mb-1">{s.progress}K / 100K</span>
                    <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                {s.change24h ? (
                  <span className={`text-[13px] font-mono font-semibold ${s.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>{s.change24h}</span>
                ) : (
                  <span className="text-[13px] text-[var(--color-muted)]">—</span>
                )}
              </div>

              <div className="hidden lg:block">
                <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-md
                  ${s.status === 'Graduated' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-amber-50 text-amber-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Graduated' ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                  {s.status}
                </span>
              </div>

              <div className="hidden lg:flex lg:justify-end">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setModalStartup(s) }}
                  className="h-7 px-3 rounded-lg text-[12px] font-medium cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-150 active:scale-[0.96]"
                  style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
                >
                  {s.status === 'Graduated' ? 'Buy' : 'Invest'}
                </button>
              </div>

              {/* Mobile row */}
              <div className="flex items-center gap-3 lg:hidden text-[12px] flex-wrap">
                <span className="font-mono font-semibold text-[var(--color-heading)]">{s.revenue}</span>
                <span className="inline-flex items-center gap-1 text-[var(--color-heading)] font-mono">
                  <TokenIcon token={s.token} color={s.tokenColor} icon={s.tokenIcon} size={13} />
                  {s.token}
                </span>
                {s.price && <span className="font-mono text-[var(--color-heading)]">{s.price}</span>}
                {s.change24h && (
                  <span className={`font-mono font-semibold ${s.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>{s.change24h}</span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-semibold
                  ${s.status === 'Graduated' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-amber-50 text-amber-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Graduated' ? 'bg-[var(--color-accent)]' : 'bg-amber-400'}`} />
                  {s.status}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setModalStartup(s) }}
                  className="h-7 px-3 rounded-lg text-[12px] font-medium cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-150 active:scale-[0.96] ml-auto"
                  style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
                >
                  {s.status === 'Graduated' ? 'Buy' : 'Invest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalStartup && (
        <TokenModal startup={modalStartup} onClose={() => setModalStartup(null)} />
      )}
    </div>
  )
}
