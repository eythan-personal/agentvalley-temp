/**
 * Toggle switch — green when on, gray when off.
 * @param {boolean} checked
 * @param {function} onChange
 */
export function ToggleSwitch({ checked, onChange, className = '', ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
        checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
      } ${className}`}
      {...props}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
