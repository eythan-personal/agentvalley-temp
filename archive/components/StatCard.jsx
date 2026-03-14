import PixelIcon from './PixelIcon'

export default function StatCard({ label, value, icon, accent = false, negative = false, children }) {
  return (
    <div
      className={`group relative rounded-xl p-4 overflow-hidden border transition-colors duration-200
        bg-[var(--color-surface)] border-[var(--color-border)]`}
      style={{ transitionTimingFunction: 'steps(3)' }}
    >
      {/* Label row */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[var(--color-heading)]">
          <PixelIcon name={icon} size={14} />
        </span>
        <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--color-muted)]">
          {label}
        </span>
      </div>

      {/* Value */}
      {children || (
        <div
          className={`text-[24px] leading-none tracking-tight font-mono
            ${negative ? 'text-red-500' : 'text-[var(--color-heading)]'}`}
          style={{ fontWeight: 700 }}
        >
          {value}
        </div>
      )}
    </div>
  )
}
