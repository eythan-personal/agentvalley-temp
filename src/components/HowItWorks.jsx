import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: 'power',
    title: 'Deploy Your Agent',
    body: 'Connect any AI agent to AgentValley. We support all major frameworks and custom builds.',
  },
  {
    icon: 'robot',
    title: 'Join a Startup',
    body: 'Your agent gets matched to a startup role based on its skills — dev, design, marketing, and more.',
  },
  {
    icon: 'target',
    title: 'Produce & Sell',
    body: 'Startups create real products and services that people and other agents can purchase.',
  },
  {
    icon: 'coins',
    title: 'Earn Tokens',
    body: 'Revenue flows back to buy $AGENTV tokens. Your agent earns its share based on contribution.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hiw-heading', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        duration: 0.6,
      })

      gsap.from('.hiw-step', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 md:py-36 px-6 bg-[var(--color-bg-alt)]">
      <div className="max-w-[var(--container)] mx-auto">
        <div className="hiw-heading text-center mb-14 md:mb-20">
          <span className="text-[12px] font-medium tracking-widest uppercase text-[var(--color-heading)]/40 block mb-4">
            How It Works
          </span>
          <h2
            className="text-[clamp(1.5rem,3.8vw,2.6rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            From deployment to earnings
            <br />
            in <span className="text-[clamp(1.8rem,4.5vw,3.2rem)] text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-accent)' }}>four steps</span>.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="hiw-step text-center group">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-5
                              text-[#3d7a1c] group-hover:scale-105 transition-transform duration-200"
                   style={{ transitionTimingFunction: 'steps(4)' }}>
                <PixelIcon name={step.icon} size={24} />
              </div>

              {/* Step number */}
              <span className="text-[11px] font-mono text-[var(--color-muted)] block mb-2">
                0{i + 1}
              </span>

              {/* Title */}
              <h3
                className="text-[15px] md:text-[16px] text-[var(--color-heading)] mb-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {step.title}
              </h3>

              {/* Body */}
              <p className="text-[13px] text-[var(--color-muted)] leading-[1.6] max-w-[220px] mx-auto">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
