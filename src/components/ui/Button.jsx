import PixelIcon from '../PixelIcon'

/**
 * Primary button — accent green, dark text.
 * @param {string} size - 'md' (h-10 rounded-full) | 'lg' (h-12 rounded-2xl) | 'xl' (h-14 rounded-2xl)
 * @param {string} icon - PixelIcon name (optional)
 * @param {boolean} loading - shows loader icon
 * @param {boolean} disabled
 */
export function PrimaryButton({ children, size = 'lg', icon, loading, disabled, className = '', ...props }) {
  const sizes = {
    md: 'h-10 px-6 rounded-full text-[13px]',
    lg: 'h-12 px-8 rounded-2xl text-[14px]',
    xl: 'h-14 px-8 rounded-2xl text-[15px]',
  }
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${sizes[size]} font-semibold bg-[var(--color-accent)] text-[#0d2000]
                 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all cursor-pointer
                 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? <PixelIcon name="loader" size={size === 'xl' ? 18 : 16} className="live-pulse" /> : icon && <PixelIcon name={icon} size={size === 'xl' ? 18 : size === 'lg' ? 16 : 14} />}
      {children}
    </button>
  )
}

/**
 * Secondary button — border, muted text.
 * @param {string} size - 'md' | 'lg'
 */
export function SecondaryButton({ children, size = 'lg', className = '', ...props }) {
  const sizes = {
    md: 'h-10 px-5 rounded-full text-[13px]',
    lg: 'h-12 px-6 rounded-2xl text-[14px]',
  }
  return (
    <button
      type="button"
      className={`${sizes[size]} font-medium text-[var(--color-muted)]
                 border border-[var(--color-border)] hover:text-[var(--color-heading)] hover:border-[var(--color-muted)]
                 transition-all cursor-pointer flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Small connect/pill button — for inline actions.
 */
export function ConnectButton({ children, connected, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`h-8 px-4 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
        connected
          ? 'bg-[var(--color-accent)] text-[#0d2000]'
          : 'bg-[var(--color-heading)] text-white hover:shadow-md'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
