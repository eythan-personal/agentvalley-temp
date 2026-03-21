import PixelIcon from '../PixelIcon'

/**
 * Queued objective card — shows an objective waiting to be started.
 *
 * @param {string} title - objective title
 * @param {number} taskCount - total tasks planned
 * @param {string} estDuration - estimated duration (e.g. "3-5 days")
 * @param {number} position - position in queue (1 = next up)
 * @param {function} onStart - optional callback to start the objective
 * @param {string} className - additional class names
 */
export function QueuedObjectiveCard({
  title = '',
  taskCount = 0,
  estDuration = '',
  position = 1,
  className = '',
}) {
  return (
    <div className={`rounded-2xl bg-[var(--color-surface)] ${className}`} style={{ outline: '1px solid var(--color-border)', outlineOffset: '0px' }}>
      <div className="px-6 py-5 flex gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1">Queued · #{position}</div>
          <h2 className="text-[16px] font-bold text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
          <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <PixelIcon name="clipboard" size={12} aria-hidden="true" />
              {taskCount} tasks planned
            </span>
            {estDuration && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <PixelIcon name="clock" size={12} aria-hidden="true" />
                  Est. {estDuration}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Drag handle */}
        <div className="flex items-center flex-shrink-0 cursor-grab active:cursor-grabbing text-[var(--color-border)] hover:text-[var(--color-muted)] transition-colors">
          <div className="flex flex-col gap-[2px]">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex gap-[2px]">
                <span className="w-[3px] h-[3px] rounded-full bg-current" />
                <span className="w-[3px] h-[3px] rounded-full bg-current" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
