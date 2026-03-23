import NumberFlow from '@number-flow/react'
import PixelIcon from '../PixelIcon'
import { AgentDot } from './AgentDot'

/**
 * Active objective card — shows current objective with progress, agents, and status.
 * Supports compact mode for task detail view.
 */
export function ObjectiveCard({
  title = '',
  description = '',
  percent = 0,
  completed = 0,
  inProgress = 0,
  review = 0,
  pending = 0,
  total = 0,
  agents = [],
  paused = false,
  animate = true,
  analyzing = false,
  compact = false,
  minimal = false,
  onViewObjective,
  className = '',
}) {
  const completedPct = total ? `${Math.round((completed / total) * 100)}%` : '0%'
  const inProgressPct = total ? `${Math.round((inProgress / total) * 100)}%` : '0%'
  const reviewPct = total ? `${Math.round((review / total) * 100)}%` : '0%'
  const overallPct = animate ? `${percent}%` : '0%'

  if (minimal) {
    return (
      <div className={`rounded-2xl bg-[var(--color-surface)] ${className}`} style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}>
        <div className="px-6 py-5">
          {/* Header with big percentage */}
          <div className="flex items-start justify-between gap-6 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Current Objective</div>
              <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
              </h2>
            </div>
            <NumberFlow value={percent} suffix="%" className="hidden sm:block text-[32px] font-bold leading-none tabular-nums text-[var(--color-heading)] flex-shrink-0 -mt-1" style={{ fontFamily: 'var(--font-display)' }} />
          </div>
          {/* Single-color progress bar */}
          <div
            className="h-2.5 rounded-full overflow-hidden bg-[var(--color-border)] mb-4"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Objective progress"
          >
            <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: overallPct, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s' }} />
          </div>
          {/* Agents + status + ETA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {agents.map(name => (
                  <AgentDot key={name} name={name} size={24} thinking={analyzing} className="ring-2 ring-[var(--color-surface)]" />
                ))}
              </div>
              <span className="text-[11px] text-[var(--color-muted)]">
                {analyzing ? `${agents.join(' & ')} analyzing` : agents.join(' & ')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-body)]">
                {paused ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'oklch(0.82 0.18 80)' }} aria-hidden="true" />
                    <span className="text-[oklch(0.82_0.18_80)]">Paused</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0 animate-pulse" aria-hidden="true" />
                    Active
                  </>
                )}
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">ETA 45min</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-[var(--color-surface)] transition-all duration-500 ease-out ${className}`} style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)' }}>
      <div className={`px-6 transition-[padding] duration-500 ease-out ${compact ? 'py-4' : 'py-5'}`}>
        {/* Header — always visible */}
        <div className={`flex items-start justify-between gap-6 transition-[margin] duration-500 ease-out ${compact ? 'mb-0' : 'mb-4'}`}>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Current Objective</div>
            <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h2>
          </div>
          <NumberFlow value={percent} suffix="%" className="hidden sm:block text-[32px] font-bold leading-none tabular-nums text-[var(--color-heading)] flex-shrink-0 -mt-1" style={{ fontFamily: 'var(--font-display)' }} />
        </div>

        {/* Collapsible content */}
        <div
          className="overflow-hidden transition-[max-height,opacity] duration-500 ease-out"
          style={{
            maxHeight: compact ? 0 : 300,
            opacity: compact ? 0 : 1,
          }}
        >
          {/* Task progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--color-body)] flex items-center gap-2">
              Task Progress
              <NumberFlow value={percent} suffix="%" className="sm:hidden text-[13px] font-bold tabular-nums text-[var(--color-heading)]" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] hidden sm:block">Started 2h ago · ETA 45min</span>
          </div>
          <div
            className="flex h-2.5 rounded-full overflow-hidden bg-[var(--color-border)] mb-3"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Objective progress"
          >
            <div className="bg-[var(--color-accent)] rounded-l-full" style={{ width: animate ? completedPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s' }} />
            <div className="bg-[oklch(0.77_0.12_253.03)]" style={{ width: animate ? inProgressPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s' }} />
            <div className="bg-[oklch(0.82_0.18_80)]" style={{ width: animate ? reviewPct : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' }} />
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={completed} className="text-[11px] tabular-nums" /> completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.77_0.12_253.03)]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={inProgress} className="text-[11px] tabular-nums" /> in progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'oklch(0.82 0.18 80)' }} aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={review} className="text-[11px] tabular-nums" /> needs review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-muted)]"><NumberFlow value={pending} className="text-[11px] tabular-nums" /> pending</span>
            </div>
          </div>

          {/* Active agents */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {agents.map(name => (
                  <AgentDot key={name} name={name} size={24} thinking={analyzing} className="ring-2 ring-[var(--color-surface)]" />
                ))}
              </div>
              <span className="text-[11px] text-[var(--color-muted)]">
                {analyzing ? `${agents.join(' & ')} are analyzing tasks` : `${agents.join(' & ')} are working on this`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-body)]">
                {paused ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'oklch(0.82 0.18 80)' }} aria-hidden="true" />
                    <span className="text-[oklch(0.82_0.18_80)]">Paused</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0 animate-pulse" aria-hidden="true" />
                    Active
                  </>
                )}
              </span>
              {onViewObjective && (
                <button
                  type="button"
                  onClick={onViewObjective}
                  className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] bg-[var(--color-surface)] px-3 py-1.5 rounded-lg transition-[background-color,color,scale] duration-150 ease-out cursor-pointer active:scale-[0.96] flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                  style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
                >
                  View Objective <PixelIcon name="arrow-right" size={10} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
