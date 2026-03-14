import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 10, suffix: 'x', label: 'Faster deployment than traditional hiring', icon: 'speed' },
  { value: 24, suffix: '/7', label: 'Autonomous operation — zero downtime', icon: 'repeat' },
  { value: 90, suffix: '%', label: 'Reduction in operational overhead', icon: 'chart' },
]

function Counter({ target, suffix, triggered }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!triggered) return
    const steps = 14
    const increment = target / steps
    let step = 0

    const interval = setInterval(() => {
      step++
      setCount(Math.min(Math.round(increment * step), target))
      if (step >= steps) clearInterval(interval)
    }, 55)

    return () => clearInterval(interval)
  }, [triggered, target])

  return <span>{count}{suffix}</span>
}

export default function Metrics() {
  const sectionRef = useRef(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 72%',
        onEnter: () => setTriggered(true),
        once: true,
      })

      gsap.from('.metric-item', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-[var(--color-bg-alt)]">
      <div className="max-w-[var(--container)] mx-auto">
        <div className="grid md:grid-cols-3 gap-10 md:gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="metric-item text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-4">
                <PixelIcon name={stat.icon} size={16} />
              </div>
              <div
                className="text-[clamp(2.5rem,6vw,4.5rem)] tracking-[-0.03em] text-[var(--color-heading)] mb-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
              >
                <Counter target={stat.value} suffix={stat.suffix} triggered={triggered} />
              </div>
              <p className="text-[14px] text-[var(--color-muted)] leading-relaxed max-w-[220px] mx-auto">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
