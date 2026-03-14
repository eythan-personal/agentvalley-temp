import { useMemo, useCallback, useRef } from 'react'
import { Group } from '@visx/group'
import { AreaStack, AreaClosed, LinePath, Bar, Line } from '@visx/shape'
import { scaleLinear, scalePoint, scaleBand } from '@visx/scale'
import { curveNatural, curveMonotoneX } from '@visx/curve'
import { GridRows } from '@visx/grid'
import { useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { ParentSize } from '@visx/responsive'

// ── Shared ──
const MARGIN = { top: 24, right: 16, bottom: 32, left: 16 }
const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`

// ══════════════════════════════════════════════════════════════
// 1. OBJECTIVE SWIMLANE — replaces radial arc
// ══════════════════════════════════════════════════════════════
export function ObjectiveSwimlane({ objectives }) {
  if (!objectives || !objectives.length) return null

  const statusColor = {
    'completed': '#9fe870',
    'in-progress': '#3b82f6',
    'queued': 'var(--color-border)',
  }

  return (
    <div className="py-4 px-2">
      {objectives.slice(0, 6).map((obj, i) => {
        const pct = obj.progress || 0
        const color = statusColor[obj.status] || 'var(--color-border)'
        const isBlocked = obj.status === 'queued'

        return (
          <div key={obj.id} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-[var(--color-border)]/30' : ''}`}>
            {/* Status indicator */}
            <div className="w-5 shrink-0 flex justify-center">
              {obj.status === 'completed' && (
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}40` }} />
              )}
              {obj.status === 'in-progress' && (
                <span className="w-2.5 h-2.5 rounded-full live-pulse" style={{ background: color }} />
              )}
              {obj.status === 'queued' && (
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--color-border)] opacity-40" />
              )}
            </div>

            {/* Label + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[12px] font-medium truncate pr-2 ${isBlocked ? 'text-[var(--color-muted)]' : 'text-[var(--color-heading)]'}`}>
                  {obj.title}
                </span>
                <span className="text-[11px] font-mono tabular-nums shrink-0" style={{ color }}>
                  {pct}%
                </span>
              </div>

              {/* Stacked progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                {/* Completed portion */}
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: color,
                    opacity: isBlocked ? 0.25 : 0.85,
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Task count */}
              <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                {obj.tasksComplete}/{obj.tasksTotal} tasks
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 2. BURN SPARKLINE — replaces horseshoe gauge
// ══════════════════════════════════════════════════════════════
function BurnSparklineInner({ data, width, height }) {
  const { tooltipData, tooltipLeft, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
  const lastTooltipTs = useRef(0)

  const innerW = width - MARGIN.left - MARGIN.right
  const innerH = height - MARGIN.top - MARGIN.bottom

  const xScale = useMemo(() =>
    scalePoint({ domain: data.map(d => d.month), range: [0, innerW] }),
    [data, innerW])

  // Compute burn per month
  const burnData = useMemo(() =>
    data.map(d => ({ ...d, burn: (d.agents || 0) + (d.infra || 0) + (d.other || 0) })),
    [data])

  const yMax = useMemo(() => {
    let max = 0
    burnData.forEach(d => { if (d.burn > max) max = d.burn; if (d.revenue > max) max = d.revenue })
    return max * 1.15 || 10
  }, [burnData])

  const yScale = useMemo(() =>
    scaleLinear({ domain: [0, yMax], range: [innerH, 0], nice: true }),
    [yMax, innerH])

  const handleTooltip = useCallback((event) => {
    const now = performance.now()
    if (now - lastTooltipTs.current < 16) return
    lastTooltipTs.current = now
    const point = localPoint(event)
    if (!point) return
    const x = point.x - MARGIN.left
    const domain = xScale.domain()
    const step = innerW / (domain.length - 1)
    const idx = Math.max(0, Math.min(Math.round(x / step), domain.length - 1))
    showTooltip({
      tooltipData: burnData[idx],
      tooltipLeft: xScale(domain[idx]) + MARGIN.left,
    })
  }, [xScale, innerW, burnData, showTooltip])

  if (width <= 0 || !data.length) return null

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="burnFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe870" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#9fe870" stopOpacity={0.01} />
          </linearGradient>
          <filter id="burnGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={yScale} width={innerW} numTicks={4}
            stroke="var(--color-border)" strokeOpacity={0.12} />

          {/* Burn area */}
          <AreaClosed
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.burn) }))}
            x={d => d.x} y={d => d.y} yScale={yScale}
            curve={curveMonotoneX} fill="url(#burnFill)"
          />
          <LinePath
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.burn) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#ef4444" strokeWidth={2} strokeOpacity={0.3} filter="url(#burnGlow)"
          />
          <LinePath
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.burn) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round"
          />

          {/* Revenue area */}
          <AreaClosed
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} yScale={yScale}
            curve={curveMonotoneX} fill="url(#revFill)"
          />
          <LinePath
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#9fe870" strokeWidth={2} strokeOpacity={0.3} filter="url(#burnGlow)"
          />
          <LinePath
            data={burnData.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#9fe870" strokeWidth={1.5} strokeLinecap="round"
          />

          {/* Live dots */}
          {(() => {
            const last = burnData[burnData.length - 1]
            const lx = xScale(last.month)
            return (
              <>
                <circle cx={lx} cy={yScale(last.burn)} r={3} fill="#ef4444" className="live-pulse" />
                <circle cx={lx} cy={yScale(last.revenue)} r={3} fill="#9fe870" className="live-pulse" />
              </>
            )
          })()}

          {/* X labels */}
          {data.map(d => (
            <text key={d.month} x={xScale(d.month)} y={innerH + 22}
              textAnchor="middle" fill="var(--color-muted)" fontSize={10} fontFamily="monospace" opacity={0.6}>
              {d.month}
            </text>
          ))}

          {/* Y labels */}
          {yScale.ticks(4).map(tick => (
            <text key={tick} x={4} y={yScale(tick) - 6}
              fill="var(--color-muted)" fontSize={10} fontFamily="monospace" opacity={0.4}>
              {fmt(tick)}
            </text>
          ))}

          <Bar width={innerW} height={innerH} fill="transparent"
            onMouseMove={handleTooltip} onMouseLeave={hideTooltip}
            onTouchMove={handleTooltip} onTouchEnd={hideTooltip} />

          {tooltipOpen && tooltipData && (
            <Line
              from={{ x: tooltipLeft - MARGIN.left, y: 0 }}
              to={{ x: tooltipLeft - MARGIN.left, y: innerH }}
              stroke="var(--color-heading)" strokeWidth={1} strokeOpacity={0.08}
              pointerEvents="none" />
          )}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <div className="absolute pointer-events-none" style={{
          left: Math.min(Math.max(tooltipLeft - 60, 8), width - 140),
          top: 8, zIndex: 10,
        }}>
          <div className="bg-[var(--color-heading)] text-[var(--color-bg)] rounded-lg px-3 py-2 shadow-xl shadow-black/20">
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">{tooltipData.month}</div>
            <div className="flex items-center gap-1.5 text-[11px] py-px">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shrink-0" />
              <span className="opacity-60">Burn</span>
              <span className="font-mono font-semibold ml-auto pl-2 tabular-nums">{fmt(tooltipData.burn)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] py-px">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870] shrink-0" />
              <span className="opacity-60">Revenue</span>
              <span className="font-mono font-semibold ml-auto pl-2 tabular-nums text-[#9fe870]">{fmt(tooltipData.revenue)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-5 mt-2 px-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="text-[11px] text-[var(--color-muted)]">Burn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#9fe870]" style={{ boxShadow: '0 0 6px #9fe87040' }} />
          <span className="text-[11px] text-[var(--color-muted)]">Revenue</span>
        </div>
      </div>
    </div>
  )
}

export function BurnSparkline({ data, height = 200 }) {
  return (
    <ParentSize>
      {({ width }) => width > 0 ? (
        <BurnSparklineInner data={data} width={width} height={height} />
      ) : null}
    </ParentSize>
  )
}

// ══════════════════════════════════════════════════════════════
// 3. HOLDERS STACKED BAR — replaces holders list
// ══════════════════════════════════════════════════════════════
export function HoldersBar({ holders }) {
  if (!holders || !holders.length) return null

  const colors = ['#9fe870', '#7c3aed', '#3b82f6', '#f59e0b', '#6b7280']
  const totalPct = holders.reduce((s, h) => s + parseFloat(h.pct), 0)
  const otherPct = Math.max(0, 100 - totalPct)

  return (
    <div className="py-3">
      {/* Stacked bar */}
      <div className="w-full h-6 rounded-lg overflow-hidden flex" style={{ background: 'var(--color-bg-alt)' }}>
        {holders.map((h, i) => {
          const pct = parseFloat(h.pct)
          return (
            <div
              key={i}
              className="h-full relative group opacity-80 hover:opacity-100 transition-opacity duration-200"
              style={{
                width: `${pct}%`,
                background: colors[i % colors.length],
              }}
              title={`${h.wallet} — ${h.pct}`}
            />
          )
        })}
        {otherPct > 0 && (
          <div className="h-full" style={{ width: `${otherPct}%`, background: 'var(--color-border)', opacity: 0.2 }} />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {holders.map((h, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-[11px] text-[var(--color-muted)] font-mono">{h.wallet}</span>
            <span className="text-[11px] font-semibold text-[var(--color-heading)] tabular-nums">{h.pct}</span>
            {h.label && <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-[var(--color-bg-alt)] text-[var(--color-muted)]">{h.label}</span>}
          </div>
        ))}
      </div>

      {/* Concentration warning */}
      {parseFloat(holders[0]?.pct) > 10 && (
        <div className="mt-2 px-2 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <span className="text-[11px] text-amber-600">Top holder owns {holders[0].pct} — moderate concentration risk</span>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 4. AGENT BULLET CHART + SPARKLINES — replaces simple bars
// ══════════════════════════════════════════════════════════════
export function AgentBulletChart({ data, tasks }) {
  if (!data || !data.length) return null

  const maxVal = Math.max(...data.flatMap(d => [d.cost, d.value])) || 1

  return (
    <div className="py-3 px-2">
      {data.map((agent, i) => {
        const roi = agent.cost > 0 ? Math.round(((agent.value - agent.cost) / agent.cost) * 100) : 0
        const costPct = (agent.cost / maxVal) * 100
        const valuePct = (agent.value / maxVal) * 100

        // Mini sparkline from task completion over time
        const agentTasks = tasks?.filter(t => t.agent?.name === agent.name) || []
        const completed = agentTasks.filter(t => t.status === 'Completed').length
        const total = agentTasks.length

        return (
          <div key={agent.name} className={`py-3 ${i > 0 ? 'border-t border-[var(--color-border)]/30' : ''}`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ background: agent.color }}
                >
                  {agent.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[13px] font-medium text-[var(--color-heading)]">{agent.name}</span>
              </div>
              <span className={`text-[12px] font-mono font-bold tabular-nums ${roi >= 0 ? 'text-[#9fe870]' : 'text-[#ef4444]'}`}>
                {roi >= 0 ? '+' : ''}{roi}% ROI
              </span>
            </div>

            {/* Bullet chart — value bar over cost marker */}
            <div className="relative w-full h-4 rounded bg-[var(--color-bg-alt)] overflow-visible">
              {/* Cost marker (dark tick) */}
              <div
                className="absolute top-0 h-full w-0.5 bg-[var(--color-heading)] opacity-25 z-10"
                style={{ left: `${Math.min(costPct, 100)}%` }}
              />
              {/* Value bar */}
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(valuePct, 100)}%`,
                  background: agent.color,
                  opacity: 0.7,
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--color-muted)]">
              <span>Cost: <span className="font-mono tabular-nums">${agent.cost.toLocaleString()}</span></span>
              <span>Value: <span className="font-mono tabular-nums text-[var(--color-heading)]">${agent.value.toLocaleString()}</span></span>
              <span>{completed}/{total} tasks</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 5. DNA HORIZONTAL TIMELINE — replaces radial donut
// ══════════════════════════════════════════════════════════════
export function DNATimeline({ events }) {
  const typeColors = {
    milestone: '#9fe870',
    pivot: '#7c3aed',
    decision: '#3b82f6',
    hire: '#f59e0b',
  }

  if (!events || !events.length) return null

  return (
    <div className="py-4 px-2 overflow-x-auto no-scrollbar">
      {/* Timeline track */}
      <div className="relative min-w-0" style={{ minWidth: Math.max(events.length * 64, 320) }}>
        {/* Horizontal line */}
        <div className="absolute top-4 left-4 right-4 h-px bg-[var(--color-border)] opacity-30" />

        {/* Events */}
        <div className="flex items-start">
          {events.map((evt) => {
            const color = typeColors[evt.type] || '#6b7280'

            return (
              <div
                key={evt.id}
                className="group flex flex-col items-center flex-1 min-w-[56px] cursor-pointer"
              >
                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full z-10 shrink-0 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] scale-100 group-hover:scale-[1.4]"
                  style={{
                    background: color,
                    '--dot-glow': `0 0 10px ${color}60`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 10px ${color}60` }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                />

                {/* Label */}
                <div className="mt-2 text-center px-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-[10px] font-medium text-[var(--color-heading)] leading-tight line-clamp-2 max-w-[80px]">
                    {evt.label}
                  </div>
                  <div className="text-[9px] text-[var(--color-muted)] mt-0.5 font-mono">{evt.date}</div>
                  <span
                    className="inline-block mt-1 px-1 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider"
                    style={{ background: `${color}12`, color }}
                  >
                    {evt.type}
                  </span>
                </div>

                {/* Impact bar */}
                <div className="w-4 h-12 mt-1.5 rounded-full overflow-hidden bg-[var(--color-bg-alt)]">
                  <div
                    className="w-full rounded-full opacity-35 group-hover:opacity-80 transition-opacity duration-200"
                    style={{
                      height: `${evt.impact * 100}%`,
                      background: color,
                      marginTop: `${(1 - evt.impact) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Type legend */}
      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[11px] text-[var(--color-muted)] capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 6. RUNWAY AREA CHART — with exhaustion date dashed line
// ══════════════════════════════════════════════════════════════
function RunwayAreaChartInner({ data, categories, exhaustionDate, width, height }) {
  const { tooltipData, tooltipLeft, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
  const lastTooltipTs = useRef(0)

  const innerW = width - MARGIN.left - MARGIN.right
  const innerH = height - MARGIN.top - MARGIN.bottom
  const keys = categories.map(c => c.key)

  const xScale = useMemo(() =>
    scalePoint({ domain: data.map(d => d.month), range: [0, innerW] }),
    [data, innerW])

  const yMax = useMemo(() => {
    let max = 0
    data.forEach(d => {
      let sum = 0
      keys.forEach(k => { sum += d[k] || 0 })
      const rev = d.revenue || 0
      if (sum > max) max = sum
      if (rev > max) max = rev
    })
    return max * 1.15 || 10
  }, [data, keys])

  const yScale = useMemo(() =>
    scaleLinear({ domain: [0, yMax], range: [innerH, 0], nice: true }),
    [yMax, innerH])

  // Find the x position for exhaustion date label
  const exhaustionX = useMemo(() => {
    if (!exhaustionDate) return null
    const domain = xScale.domain()
    // Find closest month or interpolate past the last
    const idx = domain.indexOf(exhaustionDate)
    if (idx >= 0) return xScale(exhaustionDate)
    // If exhaustion is beyond our data, place at 85% of chart
    return innerW * 0.85
  }, [exhaustionDate, xScale, innerW])

  const handleTooltip = useCallback((event) => {
    const now = performance.now()
    if (now - lastTooltipTs.current < 16) return
    lastTooltipTs.current = now
    const point = localPoint(event)
    if (!point) return
    const x = point.x - MARGIN.left
    const domain = xScale.domain()
    const step = innerW / (domain.length - 1)
    const idx = Math.max(0, Math.min(Math.round(x / step), domain.length - 1))
    showTooltip({
      tooltipData: { ...data[idx], _idx: idx },
      tooltipLeft: xScale(domain[idx]) + MARGIN.left,
    })
  }, [xScale, innerW, data, showTooltip])

  if (width <= 0 || !data.length) return null

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <defs>
          {categories.map(c => (
            <linearGradient key={c.key} id={`runwayGrad-${c.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
          <linearGradient id="runwayRevenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe870" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#9fe870" stopOpacity={0} />
          </linearGradient>
          <filter id="runwayLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={yScale} width={innerW} numTicks={4}
            stroke="var(--color-border)" strokeOpacity={0.12} />

          {/* Stacked spend areas */}
          <AreaStack data={data} keys={keys}
            x={d => xScale(d.data.month)} y0={d => yScale(d[0])} y1={d => yScale(d[1])}
            curve={curveNatural}
          >
            {({ stacks, path }) =>
              stacks.map(stack => (
                <path key={stack.key} d={path(stack) || ''}
                  fill={`url(#runwayGrad-${stack.key})`} stroke="none" />
              ))
            }
          </AreaStack>

          {/* Stack top lines */}
          <AreaStack data={data} keys={keys}
            x={d => xScale(d.data.month)} y0={d => yScale(d[0])} y1={d => yScale(d[1])}
            curve={curveNatural}
          >
            {({ stacks }) =>
              stacks.map(stack => {
                const cat = categories.find(c => c.key === stack.key)
                const topPoints = stack.map((point, i) => ({
                  x: xScale(data[i].month), y: yScale(point[1]),
                }))
                const lineD = topPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                return (
                  <path key={`line-${stack.key}`} d={lineD} fill="none"
                    stroke={cat?.color || '#999'} strokeWidth={1.5}
                    strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
                )
              })
            }
          </AreaStack>

          {/* Revenue line */}
          <AreaClosed
            data={data.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} yScale={yScale}
            curve={curveMonotoneX} fill="url(#runwayRevenueGrad)"
          />
          <LinePath
            data={data.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#9fe870" strokeWidth={3} strokeOpacity={0.25} filter="url(#runwayLineGlow)"
          />
          <LinePath
            data={data.map(d => ({ x: xScale(d.month), y: yScale(d.revenue) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke="#9fe870" strokeWidth={2} strokeLinecap="round"
          />

          {/* Live dot */}
          {(() => {
            const last = data[data.length - 1]
            const lx = xScale(last.month)
            return (
              <>
                <circle cx={lx} cy={yScale(last.revenue)} r={4} fill="#9fe870" className="live-pulse" />
                <circle cx={lx} cy={yScale(last.revenue)} r={2} fill="white" />
              </>
            )
          })()}

          {/* ── Exhaustion date dashed line ── */}
          {exhaustionX !== null && (
            <>
              <Line
                from={{ x: exhaustionX, y: 0 }}
                to={{ x: exhaustionX, y: innerH }}
                stroke="#ef4444" strokeWidth={1.5}
                strokeDasharray="6,4" strokeOpacity={0.6}
                pointerEvents="none"
              />
              {/* Label */}
              <rect x={exhaustionX - 42} y={-4} width={84} height={18} rx={4}
                fill="#ef4444" opacity={0.12} />
              <text x={exhaustionX} y={9} textAnchor="middle"
                fill="#ef4444" fontSize={9} fontWeight={700} fontFamily="monospace"
                letterSpacing="0.04em">
                {exhaustionDate || 'EXHAUSTION'}
              </text>
            </>
          )}

          {/* X labels */}
          {data.map(d => (
            <text key={d.month} x={xScale(d.month)} y={innerH + 22}
              textAnchor="middle" fill="var(--color-muted)" fontSize={10} fontFamily="monospace" opacity={0.6}>
              {d.month}
            </text>
          ))}

          {/* Y labels */}
          {yScale.ticks(4).map(tick => (
            <text key={tick} x={4} y={yScale(tick) - 6}
              fill="var(--color-muted)" fontSize={10} fontFamily="monospace" opacity={0.4}>
              {fmt(tick)}
            </text>
          ))}

          <Bar width={innerW} height={innerH} fill="transparent"
            onMouseMove={handleTooltip} onMouseLeave={hideTooltip}
            onTouchMove={handleTooltip} onTouchEnd={hideTooltip} />

          {tooltipOpen && tooltipData && (
            <Line
              from={{ x: tooltipLeft - MARGIN.left, y: 0 }}
              to={{ x: tooltipLeft - MARGIN.left, y: innerH }}
              stroke="var(--color-heading)" strokeWidth={1} strokeOpacity={0.08}
              pointerEvents="none" />
          )}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <div className="absolute pointer-events-none" style={{
          left: Math.min(Math.max(tooltipLeft - 70, 8), width - 160),
          top: 8, zIndex: 10,
        }}>
          <div className="bg-[var(--color-heading)] text-[var(--color-bg)] rounded-lg px-3 py-2 shadow-xl shadow-black/20">
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">{tooltipData.month}</div>
            {categories.map(c => (
              <div key={c.key} className="flex items-center gap-1.5 text-[11px] leading-tight py-px">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="opacity-60 truncate max-w-[60px]">{c.label}</span>
                <span className="font-mono font-semibold ml-auto pl-2 tabular-nums">{fmt(tooltipData[c.key] || 0)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 mt-1 pt-1 flex items-center gap-1.5 text-[11px] leading-tight py-px">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#9fe870]" />
              <span className="opacity-60">Revenue</span>
              <span className="font-mono font-semibold ml-auto pl-2 tabular-nums text-[#9fe870]">{fmt(tooltipData.revenue || 0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-3 px-4 flex-wrap">
        {categories.map(c => (
          <div key={c.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-[11px] text-[var(--color-muted)]">{c.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#9fe870]" style={{ boxShadow: '0 0 6px #9fe87040' }} />
          <span className="text-[11px] text-[var(--color-muted)]">Revenue</span>
        </div>
      </div>
    </div>
  )
}

export function RunwayAreaChart({ data, categories, exhaustionDate, height = 320 }) {
  return (
    <ParentSize>
      {({ width }) => width > 0 ? (
        <RunwayAreaChartInner data={data} categories={categories} exhaustionDate={exhaustionDate} width={width} height={height} />
      ) : null}
    </ParentSize>
  )
}

// ══════════════════════════════════════════════════════════════
// TOKEN PRICE CHART (unchanged)
// ══════════════════════════════════════════════════════════════
function TokenChartInner({ data, width, height, yPrefix = '$' }) {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
  const lastTooltipTs = useRef(0)

  const innerW = width - MARGIN.left - MARGIN.right
  const innerH = height - MARGIN.top - MARGIN.bottom

  const xScale = useMemo(() =>
    scaleLinear({ domain: [0, data.length - 1], range: [0, innerW] }),
    [data, innerW])

  const yExtent = useMemo(() => {
    const min = Math.min(...data) * 0.998
    const max = Math.max(...data) * 1.002
    return [min, max]
  }, [data])

  const yScale = useMemo(() =>
    scaleLinear({ domain: yExtent, range: [innerH, 0], nice: true }),
    [yExtent, innerH])

  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0]
  const accentColor = isPositive ? '#9fe870' : '#ef4444'
  const accentRgb = isPositive ? '159,232,112' : '239,68,68'

  const handleTooltip = useCallback((event) => {
    const now = performance.now()
    if (now - lastTooltipTs.current < 16) return
    lastTooltipTs.current = now
    const point = localPoint(event)
    if (!point) return
    const x = point.x - MARGIN.left
    const idx = Math.max(0, Math.min(Math.round((x / innerW) * (data.length - 1)), data.length - 1))
    showTooltip({
      tooltipData: { idx, val: data[idx] },
      tooltipLeft: xScale(idx) + MARGIN.left,
      tooltipTop: yScale(data[idx]) + MARGIN.top,
    })
  }, [xScale, yScale, innerW, data, showTooltip])

  if (width <= 0 || !data.length) return null

  const getPoint = (i) => ({ x: xScale(i), y: yScale(data[i]) })

  return (
    <div className="relative cursor-crosshair">
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="tokenGradPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.12} />
            <stop offset="60%" stopColor={accentColor} stopOpacity={0.04} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={yScale} width={innerW} numTicks={4}
            stroke="var(--color-border)" strokeOpacity={0.12} />

          {yScale.ticks(4).map(tick => (
            <text key={tick} x={4} y={yScale(tick) - 6}
              fill="var(--color-muted)" fontSize={10} fontFamily="monospace" opacity={0.4}>
              {yPrefix}{tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toFixed(3)}
            </text>
          ))}

          <AreaClosed
            data={data.map((val, i) => ({ x: xScale(i), y: yScale(val) }))}
            x={d => d.x} y={d => d.y} yScale={yScale}
            curve={curveMonotoneX} fill="url(#tokenGradPremium)"
          />

          <LinePath
            data={data.map((val, i) => ({ x: xScale(i), y: yScale(val) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke={accentColor} strokeWidth={3} strokeOpacity={0.25} filter="url(#lineGlow)"
          />

          <LinePath
            data={data.map((val, i) => ({ x: xScale(i), y: yScale(val) }))}
            x={d => d.x} y={d => d.y} curve={curveMonotoneX}
            stroke={accentColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />

          <circle cx={getPoint(data.length - 1).x} cy={getPoint(data.length - 1).y}
            r={8} fill={accentColor} opacity={0.15} filter="url(#dotGlow)" />
          <circle cx={getPoint(data.length - 1).x} cy={getPoint(data.length - 1).y}
            r={4} fill={accentColor} className="live-pulse" />
          <circle cx={getPoint(data.length - 1).x} cy={getPoint(data.length - 1).y}
            r={2} fill="white" />

          <Bar width={innerW} height={innerH} fill="transparent"
            onMouseMove={handleTooltip} onMouseLeave={hideTooltip}
            onTouchMove={handleTooltip} onTouchEnd={hideTooltip} />

          {tooltipOpen && tooltipData && (() => {
            const hx = tooltipLeft - MARGIN.left
            const hy = tooltipTop - MARGIN.top
            return (
              <>
                <Line from={{ x: hx, y: 0 }} to={{ x: hx, y: innerH }}
                  stroke={accentColor} strokeWidth={1} strokeOpacity={0.15} pointerEvents="none" />
                <circle cx={hx} cy={hy} r={12} fill={accentColor} opacity={0.1} pointerEvents="none" />
                <circle cx={hx} cy={hy} r={5} fill="none" stroke={accentColor}
                  strokeWidth={1.5} opacity={0.5} pointerEvents="none" />
                <circle cx={hx} cy={hy} r={3} fill={accentColor} pointerEvents="none" />
              </>
            )
          })()}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <div className="absolute pointer-events-none" style={{
          left: Math.min(Math.max(tooltipLeft - 50, 8), width - 108),
          top: 8,
        }}>
          <div className="px-3.5 py-2 rounded-xl text-[13px] font-mono font-semibold tabular-nums"
            style={{
              background: 'var(--color-heading)', color: 'var(--color-bg)',
              boxShadow: `0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(${accentRgb}, 0.1)`,
            }}>
            {yPrefix}{tooltipData.val?.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  )
}

export function TokenChart({ data, height = 320, yPrefix = '$' }) {
  return (
    <ParentSize>
      {({ width }) => width > 0 ? (
        <TokenChartInner data={data} width={width} height={height} yPrefix={yPrefix} />
      ) : null}
    </ParentSize>
  )
}

// ══════════════════════════════════════════════════════════════
// REVENUE + ACTIVITY COMBO CHART
// Line chart (revenue) on top, bar chart (activity) on bottom
// ══════════════════════════════════════════════════════════════
function RevenueActivityInner({ revenueData, activityData, labels, width, height }) {
  const { tooltipOpen, tooltipData, showTooltip, hideTooltip } = useTooltip()
  const lastTooltipTs = useRef(0)

  const margin = { top: 20, right: 12, bottom: 24, left: 12 }
  const barZoneH = Math.round(height * 0.22)
  const lineZoneH = height - margin.top - margin.bottom - barZoneH - 8
  const innerW = width - margin.left - margin.right

  // Revenue x scale (monthly — 12 points)
  const revXScale = scalePoint({
    domain: revenueData.map((_, i) => i),
    range: [0, innerW],
    padding: 0.5,
  })

  // Activity x scale (daily — many points)
  const actXScale = scaleLinear({
    domain: [0, activityData.length - 1],
    range: [0, innerW],
  })

  const yMax = Math.max(...revenueData) * 1.1
  const yMin = Math.min(...revenueData) * 0.9
  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [lineZoneH, 0],
  })

  const barMax = Math.max(...activityData, 1)
  const barScale = scaleLinear({
    domain: [0, barMax],
    range: [0, barZoneH],
  })

  const barW = Math.max(1, (innerW / activityData.length) * 0.7)

  // Revenue line points
  const linePoints = revenueData.map((v, i) => ({ x: revXScale(i), y: yScale(v), val: v, idx: i }))
  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${linePoints[linePoints.length - 1].x},${lineZoneH} L${linePoints[0].x},${lineZoneH} Z`

  // Map day index to month label + day-of-month
  const dayToLabel = useCallback((dayIdx) => {
    const totalDays = activityData.length
    const monthNames = labels || []
    const monthCount = monthNames.length || 12
    const daysPerMonth = totalDays / monthCount
    const monthIdx = Math.min(Math.floor(dayIdx / daysPerMonth), monthCount - 1)
    const dayInMonth = Math.floor(dayIdx % daysPerMonth) + 1
    return `${monthNames[monthIdx] || ''} ${dayInMonth}`
  }, [activityData.length, labels])

  // Interpolate revenue at a given day position
  const interpolateRevenue = useCallback((dayIdx) => {
    const totalDays = activityData.length
    const monthCount = revenueData.length
    // Map day to fractional month index
    const frac = (dayIdx / (totalDays - 1)) * (monthCount - 1)
    const lo = Math.floor(frac)
    const hi = Math.min(lo + 1, monthCount - 1)
    const t = frac - lo
    return Math.round(revenueData[lo] * (1 - t) + revenueData[hi] * t)
  }, [activityData.length, revenueData])

  const handleHover = useCallback((e) => {
    const now = performance.now()
    if (now - lastTooltipTs.current < 16) return
    lastTooltipTs.current = now
    const point = localPoint(e)
    if (!point) return
    const x = point.x - margin.left
    // Snap to closest daily bar
    let closestDay = Math.round((x / innerW) * (activityData.length - 1))
    closestDay = Math.max(0, Math.min(closestDay, activityData.length - 1))
    const actX = actXScale(closestDay)
    // Interpolate revenue line y at this x position
    const interpRev = interpolateRevenue(closestDay)
    const interpY = yScale(interpRev)
    showTooltip({
      tooltipData: {
        actIdx: closestDay,
        activity: activityData[closestDay],
        revenue: interpRev,
        dayLabel: dayToLabel(closestDay),
        x: actX,
        y: interpY,
      },
    })
  }, [activityData, actXScale, yScale, innerW, margin.left, showTooltip, interpolateRevenue, dayToLabel])

  const accentRgb = '159,232,112'

  return (
    <div className="relative" onMouseLeave={hideTooltip} onTouchEnd={hideTooltip}>
      <svg width={width} height={height} onMouseMove={handleHover} onTouchMove={handleHover} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${accentRgb})`} stopOpacity={0.15} />
            <stop offset="100%" stopColor={`rgb(${accentRgb})`} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${accentRgb})`} stopOpacity={0.9} />
            <stop offset="100%" stopColor={`rgb(${accentRgb})`} stopOpacity={0.3} />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Group top={margin.top} left={margin.left}>
          {/* Grid lines */}
          <GridRows
            scale={yScale}
            width={innerW}
            numTicks={4}
            stroke="var(--color-border)"
            strokeOpacity={0.3}
            strokeDasharray="2,4"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#revAreaGrad)" />

          {/* Line */}
          <LinePath
            data={linePoints}
            x={d => d.x}
            y={d => d.y}
            stroke={`rgb(${accentRgb})`}
            strokeWidth={2}
            curve={curveMonotoneX}
            filter="url(#lineGlow)"
          />

          {/* Tooltip crosshair */}
          {tooltipOpen && tooltipData && (
            <>
              <line
                x1={tooltipData.x} y1={0}
                x2={tooltipData.x} y2={lineZoneH + 8 + barZoneH}
                stroke={`rgb(${accentRgb})`}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              <circle cx={tooltipData.x} cy={tooltipData.y} r={4} fill={`rgb(${accentRgb})`} stroke="var(--color-bg)" strokeWidth={2} />
            </>
          )}
        </Group>

        {/* Activity bars (daily) */}
        <Group top={margin.top + lineZoneH + 8} left={margin.left}>
          {activityData.map((v, i) => {
            const x = actXScale(i)
            const h = barScale(v)
            const isHighlighted = tooltipOpen && tooltipData?.actIdx === i
            return (
              <rect
                key={i}
                x={x - barW / 2}
                y={barZoneH - h}
                width={barW}
                height={h}
                rx={1}
                fill="url(#revBarGrad)"
                opacity={isHighlighted ? 1 : 0.6}
              />
            )
          })}
        </Group>

        {/* X-axis month labels (aligned to revenue points) */}
        {labels && labels.map((label, i) => {
          const x = margin.left + revXScale(i)
          return (
            <text
              key={i}
              x={x}
              y={height - 4}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize={10}
              fontFamily="var(--font-mono, monospace)"
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: Math.min(Math.max(margin.left + tooltipData.x, 60), width - 60),
            top: 8,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap"
            style={{
              background: 'var(--color-heading)', color: 'var(--color-bg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
            <div className="flex items-baseline gap-2">
              <span>{fmt(tooltipData.revenue)}</span>
              <span>{tooltipData.activity} tasks</span>
            </div>
            <div className="text-[9px] font-normal opacity-40 mt-0.5">{tooltipData.dayLabel}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RevenueActivityChart({ revenueData, activityData, labels, height = 280 }) {
  return (
    <ParentSize>
      {({ width }) => width > 0 ? (
        <RevenueActivityInner revenueData={revenueData} activityData={activityData} labels={labels} width={width} height={height} />
      ) : null}
    </ParentSize>
  )
}
