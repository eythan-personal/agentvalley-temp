/**
 * Text input with optional mono uppercase label.
 */
export function TextInput({ label, required, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
          {label} {required && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}
      <input
        type="text"
        className={`w-full h-12 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-medium
                   placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all ${
                   error ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'
                   } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}

/**
 * Textarea with optional mono uppercase label.
 */
export function TextArea({ label, required, error, className = '', rows = 3, ...props }) {
  return (
    <div>
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
          {label} {required && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                   placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all resize-none leading-relaxed ${
                   error ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'
                   } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}

/**
 * Select dropdown with optional label.
 */
export function SelectInput({ label, required, error, children, className = '', ...props }) {
  const arrowBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8582' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`
  return (
    <div>
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
          {label} {required && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}
      <select
        className={`w-full h-12 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                   outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                   error ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'
                   } ${className}`}
        style={{ backgroundImage: arrowBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}
