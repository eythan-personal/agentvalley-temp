import PixelIcon from './PixelIcon'
import TransitionLink from './TransitionLink'

const pixelGrid = `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6V0h6' fill='none' stroke='%23000' stroke-width='.5' opacity='.06'/%3E%3C/svg%3E")`

export default function EmptyState({ icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/15 flex items-center justify-center mb-5 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: pixelGrid, opacity: 0.06 }}
          aria-hidden="true"
        />
        <span className="text-[var(--color-accent)] relative z-[1]">
          <PixelIcon name={icon} size={28} />
        </span>
      </div>
      <h3
        className="text-[18px] text-[var(--color-heading)] tracking-tight mb-2"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
      >
        {title}
      </h3>
      <p className="text-[14px] text-[var(--color-muted)] max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && actionTo && (
        <TransitionLink
          to={actionTo}
          className="h-10 px-6 rounded-full text-[13px] font-semibold cursor-pointer
                     bg-[var(--color-accent)] text-[#0d2000]
                     hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                     inline-flex items-center gap-2"
        >
          <PixelIcon name="zap" size={14} />
          {actionLabel}
        </TransitionLink>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="h-10 px-6 rounded-full text-[13px] font-semibold cursor-pointer
                     bg-[var(--color-accent)] text-[#0d2000]
                     hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                     inline-flex items-center gap-2"
        >
          <PixelIcon name="zap" size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
