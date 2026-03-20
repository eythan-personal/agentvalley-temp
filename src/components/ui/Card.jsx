/**
 * Dashboard card — white surface with shadow and border.
 * @param {string} className - additional classes
 */
export function DashCard({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Mono uppercase section label used inside cards.
 */
export function CardLabel({ children }) {
  return (
    <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">
      {children}
    </span>
  )
}

/**
 * Selectable card — highlights border on selection.
 * @param {boolean} selected
 */
export function SelectableCard({ children, selected, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`rounded-2xl border-2 p-4 text-left cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] shadow-sm'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
