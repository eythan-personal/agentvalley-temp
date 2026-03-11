import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: 'repeat',
    label: 'Zero Latency',
    headline: 'Always on. Never off.',
    body: 'Your agents execute 24/7/365. No coffee breaks, no PTO requests. Business at the speed of compute.',
  },
  {
    icon: 'globe',
    label: 'Infinite Scale',
    headline: 'Add a department with a click.',
    body: 'Need sales? Deploy a squad. Need support? Spin up a team. Scale without recruiters or onboarding.',
  },
  {
    icon: 'target',
    label: 'Pure Execution',
    headline: 'Past chatbots. Into revenue.',
    body: 'These agents don\'t chat — they build workflows, close loops, and generate real, measurable revenue.',
  },
]

export default function Features() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-heading', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        duration: 0.6,
      })

      gsap.from('.feature-card', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-36 px-6">
      <div className="max-w-[var(--container)] mx-auto">
        <div className="feature-heading text-center mb-14 md:mb-20">
          <h2
            className="text-[clamp(1.8rem,4.5vw,3.2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Three pillars. <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>One platform.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card group p-7 md:p-8 rounded-2xl
                         bg-white border border-[var(--color-border)]
                         hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]
                         transition-all duration-300"
            >
              {/* Icon container */}
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-5
                              text-[var(--color-accent)] group-hover:scale-105 transition-transform duration-200"
                   style={{ transitionTimingFunction: 'steps(4)' }}>
                <PixelIcon name={feature.icon} size={20} />
              </div>

              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-accent)] block mb-2.5">
                {feature.label}
              </span>

              <h3
                className="text-xl text-[var(--color-heading)] tracking-tight mb-3"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {feature.headline}
              </h3>

              <p className="text-[14px] text-[var(--color-body)] leading-[1.7]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
