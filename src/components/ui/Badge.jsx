import PixelIcon from '../PixelIcon'

/**
 * Status badge chip.
 * @param {'in-progress'|'working'|'queued'|'completed'|'pending'|'urgent'|'medium'} variant
 */
const VARIANTS = {
  'in-progress': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bullseye-arrow', label: 'In Progress' },
  'working': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'loader', label: 'Working' },
  'queued': { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'clock', label: 'Queued' },
  'completed': { bg: 'bg-[var(--color-accent-soft)]', text: 'text-[var(--color-accent)]', icon: 'check', label: 'Completed' },
  'pending': { bg: 'bg-[var(--color-bg-alt)]', text: 'text-[var(--color-muted)]', icon: 'clock', label: 'Pending' },
  'urgent': { bg: 'bg-red-500/10', text: 'text-red-600', icon: null, label: 'Urgent', uppercase: true },
  'medium': { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: null, label: 'Medium', uppercase: true },
}

export function StatusBadge({ variant, label, className = '' }) {
  const v = VARIANTS[variant] || VARIANTS.pending
  const displayLabel = label || v.label
  return (
    <span className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${v.bg} ${v.text} ${
      v.uppercase ? 'text-[10px] font-bold uppercase tracking-wider' : 'text-[11px]'
    } ${className}`}>
      {v.icon && <PixelIcon name={v.icon} size={10} />}
      {displayLabel}
    </span>
  )
}
