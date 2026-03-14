import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

const oldWay = [
  { icon: 'speed', text: 'Hire slowly, fire painfully' },
  { icon: 'chart-bar', text: 'Scale = more headcount, more overhead' },
  { icon: 'lock', text: 'Ops bottlenecked by human bandwidth' },
]

const newWay = [
  { icon: 'zap', text: 'Deploy instantly, iterate relentlessly' },
  { icon: 'server', text: 'Scale = one click, infinite capacity' },
  { icon: 'robot', text: 'Ops automated, founders liberated' },
]

export default function Tension() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tension-title', {
        scrollTrigger: { trigger: '.tension-title', start: 'top 85%' },
        y: 50,
        opacity: 0,
        duration: 0.7,
      })

      gsap.from('.old-item', {
        scrollTrigger: { trigger: '.old-col', start: 'top 80%' },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
      })

      gsap.from('.new-item', {
        scrollTrigger: { trigger: '.new-col', start: 'top 80%' },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'steps(6)',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-36 px-6 bg-[var(--color-bg-alt)]">
      <div className="max-w-[var(--container)] mx-auto">
        <div className="tension-title text-center mb-16 md:mb-20">
          <h2
            className="text-[clamp(1.8rem,4.5vw,3.2rem)] text-[var(--color-heading)] tracking-[-0.02em] max-w-2xl mx-auto leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            The old playbook is{' '}
            <span className="line-through text-[var(--color-muted)]">broken</span>.
            <br />
            We wrote a <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>new one</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-3xl mx-auto">
          {/* Old way */}
          <div className="old-col">
            <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-muted)] mb-6 flex items-center gap-3">
              <span className="w-6 h-px bg-[var(--color-border)]" />
              Yesterday
            </div>
            <div className="space-y-5">
              {oldWay.map((item, i) => (
                <div key={i} className="old-item flex items-start gap-3.5">
                  <div className="text-[var(--color-muted)] mt-0.5 shrink-0">
                    <PixelIcon name={item.icon} size={18} />
                  </div>
                  <p className="text-[14px] text-[var(--color-muted)] leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* New way */}
          <div className="new-col relative">
            <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-px bg-[var(--color-accent)] opacity-30 hidden md:block" />
            <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-accent)] mb-6 flex items-center gap-3">
              <span className="w-6 h-px bg-[var(--color-accent)]" />
              AgentValley
            </div>
            <div className="space-y-5">
              {newWay.map((item, i) => (
                <div key={i} className="new-item flex items-start gap-3.5 group">
                  <div className="text-[var(--color-accent)] mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-150" style={{ transitionTimingFunction: 'steps(3)' }}>
                    <PixelIcon name={item.icon} size={18} />
                  </div>
                  <p className="text-[14px] text-[var(--color-heading)] leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
