import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import PixelIcon from './PixelIcon'

const ToastContext = createContext(null)

const ICONS = {
  success: 'check',
  error: 'alert',
  info: 'info-box',
}

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state.slice(-2), action.toast]
    case 'REMOVE':
      return state.filter(t => t.id !== action.id)
    default:
      return state
  }
}

function ToastItem({ toast, onRemove }) {
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg shadow-black/10 min-w-[260px] max-w-[380px] animate-toast-in"
    >
      <span className={`shrink-0 ${
        toast.type === 'success' ? 'text-[var(--color-accent)]'
        : toast.type === 'error' ? 'text-red-500'
        : 'text-[var(--color-muted)]'
      }`}>
        <PixelIcon name={toast.icon || ICONS[toast.type] || 'info-box'} size={16} />
      </span>
      <span className="text-[13px] text-[var(--color-heading)] flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <PixelIcon name="close" size={12} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  const toast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random()
    dispatch({ type: 'ADD', toast: { id, message, type: 'info', duration: 3000, ...options } })
  }, [])

  const remove = useCallback((id) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 right-5 z-[60] flex flex-col-reverse gap-2">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={remove} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
