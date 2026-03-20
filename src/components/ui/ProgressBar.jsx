import PixelIcon from '../PixelIcon'

/**
 * Segmented progress bar with legend.
 *
 * @param {number} completed - count
 * @param {number} assigned - count
 * @param {number} pending - count
 * @param {boolean} showLegend - show legend below (default true)
 * @param {string} height - bar height class (default 'h-3')
 */
export function SegmentedProgress({ completed = 0, assigned = 0, pending = 0, showLegend = true, height = 'h-3' }) {
  const total = completed + assigned + pending
  if (total === 0) return null

  return (
    <div>
      <div className={`flex ${height} rounded-full bg-[var(--color-bg-alt)] overflow-hidden`}>
        {completed > 0 && (
          <div className="h-full bg-[var(--color-accent)] progress-shimmer" style={{ width: `${(completed / total) * 100}%` }} />
        )}
        {assigned > 0 && (
          <div className="h-full bg-blue-400" style={{ width: `${(assigned / total) * 100}%` }} />
        )}
      </div>
      {showLegend && (
        <div className="flex items-center gap-4 text-[12px] mt-2">
          <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
            <span className="font-medium">{completed}</span> completed
          </span>
          <span className="flex items-center gap-1.5 text-blue-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
            <span className="font-medium">{assigned}</span> assigned
          </span>
          <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)]" />
            <span className="font-medium">{pending}</span> pending
          </span>
        </div>
      )}
    </div>
  )
}
