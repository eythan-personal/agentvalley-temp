import { Component } from 'react'
import PixelIcon from './PixelIcon'

/**
 * Global error boundary — catches render errors and shows a recovery UI.
 * Wrap at the App level and optionally around individual dashboard sections.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <PixelIcon name="alert" size={24} className="text-red-500" />
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--color-heading)] mb-1">
            Something went wrong
          </h3>
          <p className="text-[13px] text-[var(--color-muted)] mb-4 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-[13px] font-medium rounded-lg bg-[var(--color-accent)] text-[#163300] hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Inline error state for individual sections that fail to load data.
 */
export function SectionError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <PixelIcon name="alert" size={20} className="text-red-400 mb-2" />
      <p className="text-[13px] text-[var(--color-muted)] mb-3">{message || 'Failed to load'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] font-medium text-[var(--color-accent)] hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}
