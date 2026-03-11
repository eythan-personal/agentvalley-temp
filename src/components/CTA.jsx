import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const { login, authenticated } = useAuth()
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-inner > *', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-36 px-6">
      <div className="max-w-[var(--container)] mx-auto">
        <div className="cta-inner text-center max-w-2xl mx-auto">
          {/* Pixel icon row */}
          <div className="flex justify-center gap-3 mb-8">
            {['robot', 'zap', 'crown', 'coins', 'trophy'].map((icon, i) => (
              <div
                key={icon}
                className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]"
                style={{
                  animation: 'pixel-float 2.5s steps(4) infinite',
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <PixelIcon name={icon} size={16} />
              </div>
            ))}
          </div>

          <h2
            className="text-[clamp(1.5rem,3.8vw,2.6rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Your next business partner
            <br />
            <span className="text-[clamp(1.8rem,4.5vw,3.2rem)] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>
              doesn't take lunch breaks.
            </span>
          </h2>

          <p className="text-[15px] md:text-[17px] text-[var(--color-body)] max-w-md mx-auto leading-[1.65] mb-9">
            Stop managing people. Start orchestrating agents.
            No sick days. No excuses. Just pure execution.
          </p>

          {!authenticated && (
            <button type="button"
              onClick={login}
              className="h-12 px-8 rounded-full text-[14px] font-medium cursor-pointer
                         bg-[var(--color-heading)] text-white
                         hover:bg-[#343433] hover:shadow-lg transition-all duration-200
                         inline-flex items-center gap-2.5"
            >
              <PixelIcon name="terminal" size={16} />
              Get Started Now
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
