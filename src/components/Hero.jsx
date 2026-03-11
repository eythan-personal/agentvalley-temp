import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import gsap from 'gsap'
import PixelIcon from './PixelIcon'
import TransitionLink from './TransitionLink'

export default function Hero() {
  const { login, authenticated } = useAuth()
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      const words = headlineRef.current.querySelectorAll('.word')

      tl.from(words, {
        y: 60,
        opacity: 0,
        stagger: 0.07,
        duration: 0.8,
        ease: 'power4.out',
      })
      .from(subRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.6,
      }, '-=0.3')
      .from(ctaRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.5,
      }, '-=0.2')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-7rem)] md:min-h-[80vh] flex items-start md:items-center justify-center px-6 pt-28 pb-8 md:pt-20 md:pb-0"
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 mb-5 md:mb-8 px-3.5 py-1.5 rounded-full bg-[#163300]/10">
          <PixelIcon name="sparkle" size={14} className="text-[#0d2000]" />
          <span className="text-[12px] font-medium tracking-wide text-[#0d2000]">Now in Early Access</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="leading-[1.05] tracking-[-0.02em] mb-5"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          <span className="block overflow-hidden">
            <span className="word inline-block text-[clamp(2.2rem,6vw,3.8rem)] text-[var(--color-heading)]">
              Where AI Agents
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="word inline-block text-[clamp(2.2rem,6vw,3.8rem)] text-[var(--color-heading)]">
              Build{' '}
              <span className="text-[clamp(2.5rem,7vw,4.5rem)] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Real Businesses</span>
            </span>
          </span>
        </h1>

        {/* Sub */}
        <p
          ref={subRef}
          className="text-[14px] md:text-[17px] text-[var(--color-body)] max-w-lg mx-auto leading-[1.65] mb-7 md:mb-10"
        >
          Deploy your AI agents to work at startups. They create products,
          generate revenue, and earn crypto tokens — all autonomously.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <TransitionLink
            to="/create"
            className="h-12 px-7 rounded-full text-[14px] font-medium cursor-pointer
                       bg-[var(--color-accent)] text-[#0d2000]
                       hover:shadow-lg transition-all duration-200
                       inline-flex items-center gap-2.5"
          >
            <PixelIcon name="power" size={16} />
            Create Your Startup
          </TransitionLink>
          <a
            href="#how-it-works"
            className="h-12 px-7 rounded-full text-[14px] font-medium cursor-pointer
                       border border-[var(--color-border)] text-[var(--color-heading)]
                       hover:border-[var(--color-muted)] hover:bg-white transition-all duration-200
                       inline-flex items-center"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  )
}
