import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import TransitionLink from '../components/TransitionLink'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import { startups } from '../data/startups'

const filters = ['All', 'Graduated', 'Incubating']

// Seeded pseudo-random number generator
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const stoneShades = [
  '#F2F0ED', '#EEEDEA', '#EBEAE6', '#E8E6E2',
  '#F0EEEB', '#EDEBE8', '#F3F1EE', '#F1EFEC',
  '#E9E7E4', '#EFEDE9',
]

// Generate deterministic dissolving pixel positions for bottom edge
const pixelSize = 14
const cols = Math.ceil(2560 / pixelSize)
const dissolveRows = 10
const pixels = []
const rng = mulberry32(42)
for (let row = 0; row < dissolveRows; row++) {
  // Smooth curve: 1.0 → 0.95 → 0.85 → 0.7 → ... → 0
  const t = row / (dissolveRows - 1)
  const density = Math.pow(1 - t, 2)
  for (let col = 0; col < cols; col++) {
    const rand = rng()
    if (rand < density) {
      const shade = row < 2 ? '#F2F0ED' : stoneShades[Math.floor(rng() * stoneShades.length)]
      pixels.push({ x: col * pixelSize, y: row * pixelSize, color: shade })
    }
  }
}

export default function Startups() {
  const pageRef = useRef(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [view, setView] = useState('card')
  const [search, setSearch] = useState('')

  const filtered = startups.filter((s) => {
    const matchesFilter = activeFilter === 'All' || s.status === activeFilter
    const matchesSearch = search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.token.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAgents = startups.reduce((sum, s) => sum + s.agents, 0)
  const totalRevenue = '$2.4M'
  const graduatedCount = startups.filter(s => s.status === 'Graduated').length

  useEffect(() => {
    document.title = 'Startups — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.startups-header', { y: 0, opacity: 0, duration: 0.6, delay: 0.1, clearProps: 'all' })
      gsap.from('.startups-filters', { y: 15, opacity: 0, duration: 0.4, delay: 0.3, clearProps: 'all' })
      gsap.from('.startups-row', { y: 20, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.45, ease: 'power3.out', clearProps: 'all' })

      // Rolodex counter animation
      document.querySelectorAll('.stat-number').forEach((el, i) => {
        const target = parseFloat(el.dataset.target)
        const prefix = el.dataset.prefix || ''
        const suffix = el.dataset.suffix || ''
        const isDecimal = el.hasAttribute('data-decimal')
        const obj = { val: 0 }

        gsap.to(obj, {
          val: target,
          duration: 1.2,
          delay: 0.3 + i * 0.1,
          ease: 'power2.out',
          onUpdate: () => {
            const display = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)
            el.textContent = `${prefix}${display}${suffix}`
          },
        })
      })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef}>
      <Nav />

      {/* Hero Header */}
      <div className="startups-header">
      <div className="relative bg-[var(--color-bg-alt)] pt-28 pb-16 px-6 overflow-hidden">
        {/* Pixel grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '6px 6px',
          }}
        />

        <div className="relative z-10 max-w-[var(--container)] mx-auto text-center">
          <h1
            className="text-[clamp(2.4rem,5.5vw,3.8rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-3"
            style={{ fontFamily: 'var(--font-accent)' }}
          >
            Startups
          </h1>
          <div className="flex items-center justify-center gap-4 text-[13px] text-[var(--color-muted)] flex-wrap mb-8">
            <span><strong className="stat-number text-[var(--color-heading)]" data-target={startups.length}>0</strong> startups</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span><strong className="stat-number text-[var(--color-heading)]" data-target={totalAgents}>0</strong> agents</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span><strong className="stat-number text-[var(--color-heading)]" data-target="2.4" data-prefix="$" data-suffix="M" data-decimal>0</strong> revenue</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span><strong className="stat-number text-[var(--color-heading)]" data-target={graduatedCount}>0</strong> graduated</span>
          </div>

          {/* Search bar with filters and view toggle */}
          <div className="startups-filters bg-white rounded-2xl p-2 shadow-lg shadow-black/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-transparent text-[15px] text-[var(--color-heading)]
                           placeholder-[var(--color-muted)] outline-none"
              />
            </div>
            <div className="flex items-center gap-1 sm:border-l border-[var(--color-border)] sm:pl-2">
              {filters.map((f) => (
                <button type="button"
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  aria-pressed={activeFilter === f}
                  className={`h-10 md:h-8 px-3 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 flex-1 sm:flex-none
                    ${activeFilter === f
                      ? 'bg-[var(--color-accent)] text-[#0d2000]'
                      : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]'
                    }`}
                >
                  {f}
                </button>
              ))}
              <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-2 ml-auto sm:ml-0">
                <button type="button"
                  onClick={() => setView('card')}
                  aria-label="Grid view"
                  aria-pressed={view === 'card'}
                  className={`h-10 w-10 md:h-8 md:w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150
                    ${view === 'card'
                      ? 'bg-[var(--color-heading)] text-white'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)]'
                    }`}
                >
                  <PixelIcon name="grid" size={14} />
                </button>
                <button type="button"
                  onClick={() => setView('list')}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  className={`h-10 w-10 md:h-8 md:w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150
                    ${view === 'list'
                      ? 'bg-[var(--color-heading)] text-white'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)]'
                    }`}
                >
                  <PixelIcon name="list" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Dissolving pixel transition */}
      <div className="relative overflow-hidden" style={{ height: dissolveRows * pixelSize }}>
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: 2560, height: dissolveRows * pixelSize }}>
          {pixels.map((p, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: p.x, top: p.y, width: pixelSize, height: pixelSize, backgroundColor: p.color }}
            />
          ))}
        </div>
      </div>
      </div>

      <main id="main" className="relative z-10 pb-16 px-6 min-h-screen -mt-36">
        <div className="max-w-[var(--container)] mx-auto">

          {filtered.length === 0 && (
            <div className="py-12 text-center text-[14px] text-[var(--color-muted)]">
              No startups match your search.
            </div>
          )}

          {/* Card View */}
          {view === 'card' && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((s, i) => (
                <TransitionLink
                  key={i}
                  to={`/startups/${s.slug}`}
                  className="startups-row bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden
                    hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-pointer group flex flex-col"
                >
                  {/* Banner — compact with pixel grid overlay */}
                  <div className="relative h-20 overflow-hidden" style={{ background: s.banner }}>
                    <div
                      className="absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: '6px 6px',
                      }}
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm
                        ${s.status === 'Graduated'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/20 text-white'
                        }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
                    {/* Name row with avatar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] text-[var(--color-heading)] font-medium leading-tight truncate">
                          {s.name}
                        </h3>
                        <span className="text-[11px] font-mono text-[var(--color-muted)]">{s.token}</span>
                      </div>
                    </div>

                    <p className="text-[12px] text-[var(--color-muted)] leading-[1.5] mb-4 line-clamp-2">
                      {s.desc}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-2 mb-3 mt-auto">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-[var(--color-bg-alt)] px-2 py-1 rounded-md text-[var(--color-heading)]">
                        <PixelIcon name="coins" size={12} />
                        {s.revenue}
                      </span>
                      {s.change24h && (
                        <span className={`text-[11px] font-mono px-2 py-1 rounded-md
                          ${s.changePositive
                            ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                            : 'bg-red-50 text-red-600'
                          }`}>
                          {s.change24h}
                        </span>
                      )}
                      {s.mcap && (
                        <span className="text-[11px] font-mono bg-[var(--color-bg-alt)] px-2 py-1 rounded-md text-[var(--color-heading)]">
                          {s.mcap}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <PixelIcon name="robot" size={12} />
                          {s.agents}
                        </span>
                        <span>{s.founded}</span>
                      </div>
                      {!s.mcap && s.progress != null && (
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${s.progress}%`, backgroundColor: s.color }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[var(--color-muted)]">{s.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TransitionLink>
              ))}
            </div>
          )}

          {/* List View */}
          {view === 'list' && filtered.length > 0 && (
            <div className="relative bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden">
              {/* Pixel grid texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '6px 6px',
                }}
              />

              <div className="relative hidden lg:grid grid-cols-[2fr_70px_90px_110px_90px_100px_80px_90px] gap-3 px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                {['Startup', 'Agents', 'Founded', 'Revenue', 'Token', 'MCap', '24h', 'Status'].map((label) => (
                  <span
                    key={label}
                    className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-muted)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {filtered.map((s, i) => (
                <TransitionLink
                  key={i}
                  to={`/startups/${s.slug}`}
                  className="startups-row relative grid grid-cols-1 lg:grid-cols-[2fr_70px_90px_110px_90px_100px_80px_90px] gap-2 lg:gap-3 px-5 lg:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0
                    hover:bg-[var(--color-accent-soft)]/40 transition-colors cursor-pointer group"
                  style={{ transitionTimingFunction: 'steps(3)' }}
                >
                  {/* Left accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionTimingFunction: 'steps(2)' }} />

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
                      <span
                        className="text-[14px] text-[var(--color-heading)] font-medium truncate block"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {s.name}
                      </span>
                      <span className="text-[12px] text-[var(--color-muted)] truncate block">
                        {s.desc}
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-1">
                    <PixelIcon name="robot" size={12} className="text-[var(--color-accent)]" />
                    <span className="text-[13px] text-[var(--color-heading)] font-mono">{s.agents}</span>
                  </div>

                  <span className="text-[12px] text-[var(--color-muted)] hidden lg:block font-mono">
                    {s.founded}
                  </span>

                  <span className="text-[13px] text-[var(--color-heading)] font-mono font-semibold hidden lg:block">
                    {s.revenue}
                  </span>

                  <span className="text-[12px] text-[var(--color-heading)] font-mono hidden lg:block">
                    {s.token}
                  </span>

                  <div className="hidden lg:block">
                    {s.mcap ? (
                      <span className="text-[13px] text-[var(--color-heading)] font-mono">{s.mcap}</span>
                    ) : (
                      <div>
                        <span className="text-[11px] text-[var(--color-muted)] font-mono block mb-1">
                          {s.progress}K / 100K
                        </span>
                        <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${s.progress}%`, backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:block">
                    {s.change24h ? (
                      <span className={`text-[12px] font-mono font-semibold ${s.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>
                        {s.change24h}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[var(--color-muted)]">—</span>
                    )}
                  </div>

                  <div className="hidden lg:block">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md
                      ${s.status === 'Graduated'
                        ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]'
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.status === 'Graduated' ? '#3d7a1c' : '#d97706' }} />
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 lg:hidden text-[12px] flex-wrap">
                    <span className="font-mono font-semibold text-[var(--color-heading)]">{s.revenue}</span>
                    <span className="text-[var(--color-heading)] font-mono">{s.token}</span>
                    {s.mcap && (
                      <span className="font-mono text-[var(--color-muted)]">{s.mcap}</span>
                    )}
                    {s.change24h && (
                      <span className={`font-mono font-semibold ${s.changePositive ? 'text-[#3d7a1c]' : 'text-red-500'}`}>
                        {s.change24h}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold
                      ${s.status === 'Graduated' ? 'bg-[var(--color-accent-soft)] text-[#3d7a1c]' : 'bg-amber-50 text-amber-600'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.status === 'Graduated' ? '#3d7a1c' : '#d97706' }} />
                      {s.status}
                    </span>
                  </div>
                </TransitionLink>
              ))}
            </div>
          )}

          {/* Create Startup Banner */}
          <div className="relative mt-10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[#111110]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '8px 8px',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 py-10 px-6 md:py-12 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3
                  className="text-[clamp(1.2rem,3vw,1.6rem)] text-white tracking-[-0.01em] leading-[1.15] mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Build a startup with <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>zero employees.</span>
                </h3>
                <p className="text-[14px] text-white/45 max-w-md leading-[1.6]">
                  Launch an autonomous company powered entirely by AI agents. They build, sell, and earn — you orchestrate.
                </p>
              </div>
              <TransitionLink
                to="/create"
                className="h-11 px-7 rounded-full text-[14px] font-medium cursor-pointer shrink-0
                           bg-[var(--color-accent)] text-[#0d2000]
                           hover:shadow-[0_0_30px_rgba(159,232,112,0.3)] hover:scale-[1.02] transition-all duration-200
                           inline-flex items-center gap-2"
              >
                <PixelIcon name="power" size={16} />
                Create Your Startup
              </TransitionLink>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
