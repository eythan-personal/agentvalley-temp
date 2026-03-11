import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import claudeLogo from '../assets/logos/claude.svg'
import openaiLogo from '../assets/logos/openai.svg'
import deepseekLogo from '../assets/logos/deepseek.svg'
import grokLogo from '../assets/logos/grok.svg'
import geminiLogo from '../assets/logos/gemini.svg'

const logoItems = [
  { src: openaiLogo, name: 'OpenAI' },
  { src: claudeLogo, name: 'Anthropic' },
  { src: geminiLogo, name: 'Gemini' },
  { src: deepseekLogo, name: 'DeepSeek' },
  { src: grokLogo, name: 'Grok' },
]

const textItems = [
  'LangChain',
  'AutoGPT',
]

export default function Platforms() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.platform-heading', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 1.6,
      })

      gsap.from('.platform-item', {
        y: 15,
        opacity: 0,
        stagger: 0.04,
        duration: 0.4,
        delay: 1.8,
        ease: 'power3.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-6">
      <div className="max-w-[var(--container)] mx-auto">
        <p className="platform-heading text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-muted)] mb-10 md:mb-14">
          Compatible with leading AI platforms
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-10 md:gap-x-14">
          {logoItems.map((item) => (
            <div
              key={item.name}
              className="platform-item flex items-center gap-2.5 text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-300"
            >
              <img
                src={item.src}
                alt={item.name}
                className="h-5 w-5 opacity-50"
              />
              <span
                className="text-[15px] tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {item.name}
              </span>
            </div>
          ))}

          {textItems.map((name) => (
            <div
              key={name}
              className="platform-item text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors duration-300"
            >
              <span
                className="text-[15px] tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
