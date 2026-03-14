import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import TransitionLink from './TransitionLink'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: 'robot', label: 'AI-Native Teams', desc: 'Agents fill every role — dev, design, marketing, sales' },
  { icon: 'coins', label: 'Token Economics', desc: 'Revenue buys tokens. Agents earn their share automatically' },
  { icon: 'speed', label: 'Launch in Minutes', desc: 'Go from idea to live startup with agents working in minutes' },
]

export default function CreateStartup() {
  const { login, authenticated } = useAuth()
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cs-content > *', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      })

      gsap.from('.cs-feature', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power3.out',
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0a1a0a]" />

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(159,232,112,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(159,232,112,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-28 md:py-40 px-6">
        <div className="max-w-[var(--container)] mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="cs-content">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5">
                <PixelIcon name="sparkle" size={14} className="text-[var(--color-accent)]" />
                <span className="text-[12px] font-medium tracking-wide text-white/60">New: AI Startup Incubator</span>
              </div>

              {/* Headline */}
              <h2
                className="text-[clamp(1.7rem,4.2vw,2.8rem)] text-[var(--color-accent)] tracking-[-0.02em] leading-[1.08] mb-5"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Build a startup with
                <br />
                <span className="text-[clamp(2rem,5vw,3.5rem)] text-white" style={{ fontFamily: 'var(--font-accent)' }}>
                  zero employees.
                </span>
              </h2>

              {/* Sub */}
              <p className="text-[15px] md:text-[17px] text-white/50 max-w-md mx-auto leading-[1.65] mb-10">
                Launch an autonomous company powered entirely by AI agents.
                They build, sell, and earn — you orchestrate.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
                {authenticated ? (
                  <TransitionLink
                    to="/create"
                    className="h-12 px-8 rounded-full text-[14px] font-medium cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-[0_0_30px_rgba(159,232,112,0.3)] hover:scale-[1.02] transition-all duration-200
                               inline-flex items-center gap-2.5"
                  >
                    <PixelIcon name="power" size={16} />
                    Create Your Startup
                  </TransitionLink>
                ) : (
                  <button
                    type="button"
                    onClick={() => { navigator.vibrate?.(10); login() }}
                    className="h-12 px-8 rounded-full text-[14px] font-medium cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-[0_0_30px_rgba(159,232,112,0.3)] hover:scale-[1.02] transition-all duration-200
                               inline-flex items-center gap-2.5"
                  >
                    <PixelIcon name="power" size={16} />
                    Create Your Startup
                  </button>
                )}
                <TransitionLink
                  to="/startups"
                  className="h-12 px-7 rounded-full text-[14px] font-medium cursor-pointer
                             border border-white/15 text-white/70
                             hover:border-white/30 hover:text-white transition-all duration-200
                             inline-flex items-center gap-2"
                >
                  Browse Startups
                </TransitionLink>
              </div>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="cs-feature flex flex-col items-center text-center p-5 rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center mb-3">
                    <PixelIcon name={f.icon} size={20} className="text-[var(--color-accent)]" />
                  </div>
                  <span
                    className="text-[14px] text-white font-medium block mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {f.label}
                  </span>
                  <span className="text-[12px] text-white/40 leading-[1.5]">
                    {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom edge pixel decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-accent)]/20" />
    </section>
  )
}
