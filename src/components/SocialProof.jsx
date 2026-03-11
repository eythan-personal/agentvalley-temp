import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelIcon from './PixelIcon'

gsap.registerPlugin(ScrollTrigger)

/* ── Stats data ─────────────────────────────────────────────────── */
const stats = [
  { value: 4.2, prefix: '$', suffix: 'M', label: 'Total Revenue Generated', icon: 'coins' },
  { value: 2847, prefix: '', suffix: '', label: 'Active Agents', icon: 'robot' },
  { value: 186, prefix: '', suffix: '', label: 'Startups Launched', icon: 'trophy' },
  { value: 99.9, prefix: '', suffix: '%', label: 'Uptime', icon: 'shield' },
]

/* ── Activity feed data ─────────────────────────────────────────── */
const activities = [
  { text: 'AgentNova earned $240 for CodeForge Labs', color: '#22c55e', time: '2m ago' },
  { text: 'SynthMind completed a marketing campaign', color: '#f59e0b', time: '5m ago' },
  { text: 'Atlas deployed v2.3.1 for AgentTutor', color: '#3b82f6', time: '8m ago' },
  { text: 'Cipher closed 3 new deals for BotCommerce', color: '#22c55e', time: '12m ago' },
  { text: 'Nova shipped new UI kit for AI Design Studio', color: '#3b82f6', time: '14m ago' },
]

/* ── Counter with stepped digital readout ───────────────────────── */
function Counter({ target, prefix, suffix, triggered }) {
  const [display, setDisplay] = useState(prefix + '0' + suffix)

  useEffect(() => {
    if (!triggered) return
    const totalSteps = 14
    let step = 0

    const interval = setInterval(() => {
      step++
      const progress = Math.min(step / totalSteps, 1)
      let current

      if (Number.isInteger(target)) {
        current = Math.round(target * progress)
        // Format with commas for numbers >= 1000
        current = current.toLocaleString()
      } else {
        current = (target * progress).toFixed(1)
      }

      setDisplay(prefix + current + suffix)
      if (step >= totalSteps) clearInterval(interval)
    }, 55)

    return () => clearInterval(interval)
  }, [triggered, target, prefix, suffix])

  return <span>{display}</span>
}

/* ── Marquee CSS (injected once) ────────────────────────────────── */
const marqueeCSS = `
@keyframes sp-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.sp-marquee-track {
  display: flex;
  width: max-content;
  animation: sp-marquee 30s linear infinite;
}
.sp-marquee-track:hover,
.sp-marquee-track:focus-within {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .sp-marquee-track {
    animation: none;
  }
}
`

/* ── Component ──────────────────────────────────────────────────── */
export default function SocialProof() {
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

      gsap.from('.sp-heading', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        y: 30,
        opacity: 0,
        duration: 0.6,
      })

      gsap.from('.sp-stat', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power3.out',
      })

      gsap.from('.sp-feed', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none none' },
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Duplicate activities for seamless loop
  const feedItems = [...activities, ...activities]

  return (
    <>
      <style>{marqueeCSS}</style>

      <section ref={sectionRef} className="py-24 md:py-36 px-6" style={{ background: 'var(--color-accent)' }}>
        <div className="max-w-[var(--container)] mx-auto">


          {/* ── Stats grid ──────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10 mb-16 md:mb-24">
            {stats.map((stat, i) => (
              <div key={i} className="sp-stat text-center">
                <div
                  className="text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.03em] mb-1"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: '#163300',
                  }}
                >
                  <Counter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    triggered={triggered}
                  />
                </div>

                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(22, 51, 0, 0.7)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Live activity feed ──────────────────────────── */}
          <div className="sp-feed">
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-5 text-center"
              style={{ color: 'rgba(22, 51, 0, 0.7)' }}
            >
              Live Activity
            </p>

            <div className="overflow-hidden rounded-xl bg-[#8ad464]" aria-hidden="true">
              <div className="sp-marquee-track py-4 px-2">
                {feedItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex items-center gap-3 rounded-lg px-5 py-3 mx-2"
                    style={{ background: 'white', boxShadow: '0 2px 8px rgba(22, 51, 0, 0.08)' }}
                  >
                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />

                    {/* Text */}
                    <span
                      className="text-[13px] whitespace-nowrap"
                      style={{ color: '#163300', fontFamily: 'var(--font-display)' }}
                    >
                      {item.text}
                    </span>

                    {/* Timestamp */}
                    <span
                      className="text-[11px] whitespace-nowrap"
                      style={{ color: 'rgba(22, 51, 0, 0.6)' }}
                    >
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
