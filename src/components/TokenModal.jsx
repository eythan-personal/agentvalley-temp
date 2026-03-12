import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import PixelIcon from './PixelIcon'
import TokenIcon from './TokenIcon'

const pixelGrid = `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6V0h6' fill='none' stroke='%23000' stroke-width='.5' opacity='.06'/%3E%3C/svg%3E")`

function PixelGridOverlay({ opacity = '0.03' }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{ backgroundImage: pixelGrid, opacity }}
      aria-hidden="true"
    />
  )
}

export default function TokenModal({ startup, onClose }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const [amount, setAmount] = useState('')
  const isGraduated = startup.status === 'Graduated'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Animate in
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, delay: 0.05, ease: 'power3.out' })
  }, [])

  const handleClose = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return onClose()
    gsap.to(panelRef.current, { y: 12, opacity: 0, duration: 0.15, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, delay: 0.05, onComplete: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${isGraduated ? 'Buy' : 'Invest in'} ${startup.token}`}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3.5">
          <div
            className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white text-[14px] font-bold shrink-0 overflow-hidden"
            style={{ backgroundColor: startup.color, fontFamily: 'var(--font-display)' }}
          >
            {startup.initials}
            <PixelGridOverlay opacity="0.08" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-[18px] text-[var(--color-heading)] tracking-[-0.02em] leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              {isGraduated ? 'Buy' : 'Invest in'} {startup.token}
            </h2>
            <span className="text-[13px] text-[var(--color-muted)]">{startup.name}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <PixelIcon name="close" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5 space-y-5">
          {/* Pay with */}
          <div>
            <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
              Pay with
            </span>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
              <TokenIcon token="PROMPT" color="#9fe870" size={28} />
              <span className="text-[15px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>PROMPT</span>
              <span className="text-[13px] text-[var(--color-muted)] ml-auto">Wayfinder</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
              Amount of {startup.token}
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <TokenIcon token={startup.token} color={startup.tokenColor} icon={startup.tokenIcon} size={18} />
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[16px] font-mono text-[var(--color-heading)]
                           placeholder-[var(--color-muted)] outline-none focus:outline-2 focus:outline-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors"
                aria-label={`Amount of ${startup.token} to ${isGraduated ? 'buy' : 'invest'}`}
              />
            </div>
          </div>

          {/* Info note */}
          <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0"><PixelIcon name="sparkle" size={14} /></span>
              <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                All transactions are settled in Wayfinder <strong className="font-semibold text-[var(--color-heading)]">PROMPT</strong>.
                {' '}The 0.25% fee is burned on every transaction.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 flex items-center gap-3">
          <button
            type="button"
            disabled={!amount || parseFloat(amount) <= 0}
            onClick={() => { navigator.vibrate?.(15); handleClose() }}
            className={`flex-1 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer
              ${amount && parseFloat(amount) > 0
                ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg hover:shadow-[var(--color-accent)]/20'
                : 'bg-[#d4d2d0] text-[#6b6865] cursor-not-allowed'
              }`}
          >
            Confirm {isGraduated ? 'Purchase' : 'Investment'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="h-11 px-5 rounded-xl text-[14px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
