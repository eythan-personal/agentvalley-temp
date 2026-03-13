import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { useAuth } from '../hooks/useAuth'
import { tokenData, myStartups } from '../data/dashboard'

// ── SVG Chart (full-width, no dependencies) ──
function PriceChart({ data, width, height, color, activeRange }) {
  if (!data || data.length < 2) return null

  const padding = { top: 30, bottom: 40, left: 0, right: 0 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const min = Math.min(...data) * 0.998
  const max = Math.max(...data) * 1.002
  const range = max - min || 1

  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((val - min) / range) * chartH,
    val,
  }))

  // Build SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  // Gradient fill area
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4
    const y = padding.top + chartH - ((val - min) / range) * chartH
    return { val, y }
  })

  // X-axis labels
  const xLabels = activeRange === '24h'
    ? ['00:00', '06:00', '12:00', '18:00', 'Now']
    : ['7d ago', '6d', '5d', '4d', '3d', '2d', '1d', 'Now']

  const isPositive = data[data.length - 1] >= data[0]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? 'var(--color-accent)' : '#ef4444'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isPositive ? 'var(--color-accent)' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={tick.y}
            x2={width}
            y2={tick.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <text
            x={padding.left + 8}
            y={tick.y - 6}
            fill="var(--color-muted)"
            fontSize="10"
            fontFamily="monospace"
          >
            ${tick.val.toFixed(3)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabels.map((label, i) => (
        <text
          key={i}
          x={padding.left + (i / (xLabels.length - 1)) * chartW}
          y={height - 8}
          fill="var(--color-muted)"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}

      {/* Fill area */}
      <path d={areaPath} fill="url(#chartGradient)" className="chart-area-enter" />

      {/* Price line */}
      <path
        d={linePath}
        fill="none"
        stroke={isPositive ? 'var(--color-accent)' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-line-enter"
      />

      {/* Current price dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill={isPositive ? 'var(--color-accent)' : '#ef4444'}
        className="live-pulse"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill="white"
      />
    </svg>
  )
}

// ── Interactive Chart Wrapper with hover tooltip ──
function InteractiveChart({ data, height, activeRange }) {
  const containerRef = useRef(null)
  const [hover, setHover] = useState(null)
  const [dims, setDims] = useState({ width: 0 })

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({ width: containerRef.current.offsetWidth })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleMouse = useCallback((e) => {
    if (!containerRef.current || !data?.length) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    const idx = Math.round(pct * (data.length - 1))
    setHover({ x, idx, val: data[idx] })
  }, [data])

  const isPositive = data && data.length >= 2 && data[data.length - 1] >= data[0]

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair"
      onMouseMove={handleMouse}
      onMouseLeave={() => setHover(null)}
    >
      {dims.width > 0 && (
        <PriceChart
          data={data}
          width={dims.width}
          height={height}
          activeRange={activeRange}
        />
      )}

      {/* Hover crosshair + tooltip */}
      {hover && (
        <>
          <div
            className="absolute top-0 bottom-10 w-px pointer-events-none"
            style={{
              left: hover.x,
              background: 'var(--color-heading)',
              opacity: 0.15,
            }}
          />
          <div
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg text-[12px] font-mono font-semibold shadow-lg shadow-black/10 border border-[var(--color-border)]"
            style={{
              left: Math.min(hover.x - 40, (dims.width || 300) - 100),
              top: 4,
              background: 'var(--color-surface)',
              color: 'var(--color-heading)',
            }}
          >
            ${hover.val?.toFixed(4)}
          </div>
          <div
            className="absolute w-2 h-2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: hover.x,
              top: `calc(${30 + (height - 70) - ((hover.val - Math.min(...data) * 0.998) / ((Math.max(...data) * 1.002) - (Math.min(...data) * 0.998))) * (height - 70)}px)`,
              background: isPositive ? 'var(--color-accent)' : '#ef4444',
              boxShadow: `0 0 0 3px ${isPositive ? 'rgba(159,232,112,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          />
        </>
      )}
    </div>
  )
}

export default function TokenPage() {
  const { slug } = useParams()
  const { logout, user } = useAuth()
  const [activeRange, setActiveRange] = useState('7d')
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const [tokenDisplayPrice, setTokenDisplayPrice] = useState(0)

  const currentStartup = myStartups.find(s => s.slug === slug) || myStartups[0]

  useEffect(() => {
    document.title = `${tokenData.symbol} Token — AgentValley`
  }, [])

  // Token price counter animation
  useEffect(() => {
    const target = tokenData.price
    const dur = 800
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(elapsed / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setTokenDisplayPrice(parseFloat((target * eased).toFixed(3)))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  // Animate panels on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from('.token-panel', { opacity: 0, y: 20, stagger: 0.06, duration: 0.35, delay: 0.2, clearProps: 'all' })
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenu])

  const chartData = activeRange === '24h' ? tokenData.sparkline : tokenData.priceHistory7d
  const ranges = ['24h', '7d']

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          }}
        />
        <div className="max-w-[540px] mx-auto py-3 flex items-center relative">
          <TransitionLink
            to={`/dashboard/${slug}`}
            className="h-8 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                       flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)]
                       hover:border-[var(--color-muted)] transition-all"
          >
            <PixelIcon name="arrow-left" size={13} />
            Dashboard
          </TransitionLink>

          <div className="flex-1" />

          {/* User avatar */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenu(prev => !prev)}
              className="w-8 h-8 rounded-full bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Account menu"
            >
              {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : 'ME'}
            </button>
            {userMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                {user?.wallet?.address && (
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </div>
                  </div>
                )}
                <button type="button" onClick={() => setUserMenu(false)} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                  <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                  Copy Address
                </button>
                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                  <button type="button" onClick={() => { setUserMenu(false); logout() }} className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                    <PixelIcon name="power" size={14} />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero: Token price + meta ── */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="max-w-[540px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <TokenIcon token={tokenData.symbol} color={currentStartup.color} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-[var(--color-heading)]">{tokenData.symbol}</span>
                <span className="text-[12px] font-mono text-[var(--color-muted)] px-1.5 py-0.5 rounded bg-[var(--color-bg-alt)]">{currentStartup.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-1">
            <span
              className="text-[36px] font-bold text-[var(--color-heading)] leading-none tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ${tokenDisplayPrice}
            </span>
            <span className={`text-[15px] font-semibold pb-1 ${tokenData.changePositive ? 'text-[var(--color-accent)]' : 'text-red-500'}`}>
              {tokenData.change24h}
            </span>
          </div>

          {/* Range toggles */}
          <div className="flex items-center gap-1 mt-4">
            {ranges.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all ${
                  activeRange === r
                    ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full-width chart ── */}
      <div className="w-full mt-2 mb-6">
        <InteractiveChart
          data={chartData}
          height={320}
          activeRange={activeRange}
        />
      </div>

      {/* ── Data panels ── */}
      <div className="px-4 sm:px-6 pb-24">
        <div className="max-w-[540px] mx-auto">

          {/* Stats grid */}
          <div className="token-panel grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">Market Cap</div>
              <div className="text-[18px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{tokenData.mcap}</div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">Volume (24h)</div>
              <div className="text-[18px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{tokenData.volume}</div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">Holders</div>
              <div className="text-[18px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{tokenData.holders}</div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">Liquidity</div>
              <div className="text-[18px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{tokenData.liquidity}</div>
            </div>
          </div>

          {/* Supply info */}
          <div className="token-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Supply</span>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Total Supply</div>
                <div className="text-[14px] font-semibold text-[var(--color-heading)]">{tokenData.supply}</div>
              </div>
              <div className="rounded-xl bg-[var(--color-input)] px-3 py-2.5">
                <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Circulating</div>
                <div className="text-[14px] font-semibold text-[var(--color-heading)]">{tokenData.circulatingSupply}</div>
              </div>
            </div>
            {/* Circulating supply bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[var(--color-muted)]">Circulating / Total</span>
                <span className="text-[11px] font-mono font-semibold text-[var(--color-heading)]">32%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-accent)] progress-shimmer" style={{ width: '32%' }} />
              </div>
            </div>
          </div>

          {/* Price extremes */}
          <div className="token-panel grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">All-Time High</div>
              <div className="text-[16px] font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>${tokenData.ath}</div>
              <div className="text-[11px] text-[var(--color-muted)] mt-0.5">{tokenData.athDate}</div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-muted)] mb-1">All-Time Low</div>
              <div className="text-[16px] font-bold text-red-500" style={{ fontFamily: 'var(--font-display)' }}>${tokenData.atl}</div>
              <div className="text-[11px] text-[var(--color-muted)] mt-0.5">{tokenData.atlDate}</div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="token-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Recent Transactions</span>
              <span className="text-[11px] text-[var(--color-muted)]">Live</span>
            </div>
            <div className="flex flex-col">
              {tokenData.transactions.map((tx, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === 'buy' ? 'bg-[var(--color-accent)]/10' : tx.type === 'sell' ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}>
                    <PixelIcon
                      name={tx.type === 'buy' ? 'arrow-right' : tx.type === 'sell' ? 'arrow-left' : 'repeat'}
                      size={13}
                      className={tx.type === 'buy' ? 'text-[var(--color-accent)]' : tx.type === 'sell' ? 'text-red-500' : 'text-blue-500'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-semibold capitalize ${
                        tx.type === 'buy' ? 'text-[var(--color-accent)]' : tx.type === 'sell' ? 'text-red-500' : 'text-blue-500'
                      }`}>{tx.type}</span>
                      <span className="text-[12px] font-mono text-[var(--color-muted)]">{tx.wallet}</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-muted)]">{tx.time}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-medium text-[var(--color-heading)]">{tx.amount}</div>
                    <div className="text-[11px] text-[var(--color-muted)]">{tx.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Holders */}
          <div className="token-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Top Holders</span>
            <div className="flex flex-col">
              {tokenData.topHolders.map((h, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                  <span className="w-5 text-[12px] font-mono text-[var(--color-muted)] text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-[var(--color-heading)]">{h.wallet}</span>
                      {h.label && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-bg-alt)] text-[var(--color-muted)]">{h.label}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-medium text-[var(--color-heading)]">{h.amount}</div>
                    <div className="text-[11px] text-[var(--color-muted)]">{h.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
