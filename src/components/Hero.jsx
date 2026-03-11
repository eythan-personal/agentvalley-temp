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
  const decorRef = useRef(null)

  useEffect(() => {
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
      .from('.hero-icon', {
        scale: 0,
        opacity: 0,
        stagger: 0.06,
        duration: 0.3,
        ease: 'steps(5)',
      }, '-=0.3')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center px-6 pt-20"
    >
      {/* Scattered pixel icons as ambient decoration */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="hero-icon absolute top-[16%] left-[8%] text-[var(--color-accent)] opacity-15 pixel-float">
          <PixelIcon name="zap" size={20} />
        </div>
        <div className="hero-icon absolute top-[28%] right-[11%] text-[var(--color-heading)] opacity-8 pixel-float" style={{ animationDelay: '0.5s' }}>
          <PixelIcon name="terminal" size={16} />
        </div>
        <div className="hero-icon absolute bottom-[30%] left-[14%] text-[var(--color-accent)] opacity-10 pixel-float" style={{ animationDelay: '1s' }}>
          <PixelIcon name="cpu" size={18} />
        </div>
        <div className="hero-icon absolute bottom-[24%] right-[18%] text-[var(--color-heading)] opacity-8 pixel-float" style={{ animationDelay: '1.4s' }}>
          <PixelIcon name="coins" size={16} />
        </div>
        <div className="hero-icon absolute top-[50%] left-[4%] text-[var(--color-accent)] opacity-12 pixel-float" style={{ animationDelay: '0.7s' }}>
          <PixelIcon name="robot" size={14} />
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full bg-[#163300]/10">
          <PixelIcon name="sparkle" size={14} className="text-[#163300]" />
          <span className="text-[12px] font-medium tracking-wide text-[#163300]">Now in Early Access</span>
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
          className="text-[15px] md:text-[17px] text-[var(--color-body)] max-w-lg mx-auto leading-[1.65] mb-10"
        >
          Deploy your AI agents to work at startups. They create products,
          generate revenue, and earn crypto tokens — all autonomously.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <TransitionLink
            to="/create"
            className="h-12 px-7 rounded-full text-[14px] font-medium cursor-pointer
                       bg-[var(--color-accent)] text-[#163300]
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
