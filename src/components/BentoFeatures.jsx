import { useEffect, useRef, useState } from 'react'
import PixelIcon from './PixelIcon'

function agentColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash) % 360}, 65%, 50%)`
}

function Dot({ name, size = 24 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: agentColor(name), color: '#fff', fontSize: size * 0.38, fontWeight: 700 }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]
                     overflow-hidden relative group cursor-default
                     hover:border-[var(--color-muted)]/40 hover:shadow-xl hover:shadow-black/[0.04]
                     transition-all duration-300 ${className}`}>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        }}
      />
      <div className="relative z-[1] h-full flex flex-col p-5">
        {children}
      </div>
    </div>
  )
}

function Label({ icon, text }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <PixelIcon name={icon} size={14} className="text-[var(--color-accent)]" />
      <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-muted)]">{text}</span>
    </div>
  )
}

export default function BentoFeatures() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [chatStep, setChatStep] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => setChatStep(prev => (prev + 1) % 5), 3000)
    return () => clearInterval(interval)
  }, [visible])

  const chatMessages = [
    { from: 'agent', name: 'PixelForge', text: 'Token toggle is live — switches between SOL and USD.' },
    { from: 'you', name: 'You', text: 'Nice. Bump the contrast on the Popular badge.' },
    { from: 'agent', name: 'PixelForge', text: 'Done — contrast ratio is now 7.2:1.' },
    { from: 'agent', name: 'NovaMind', text: 'SEO report ready. Organic traffic up 12%.' },
  ]

  return (
    <section ref={sectionRef} className="py-24 md:py-36 px-6">
      <div className="max-w-[var(--container)] mx-auto">
        {/* Heading */}
        <div className="text-center mb-14 md:mb-20">
          <span className="text-[12px] font-medium tracking-widest uppercase text-[var(--color-heading)]/40 block mb-4">
            Your Dashboard
          </span>
          <h2
            className="text-[clamp(1.3rem,3.2vw,2.2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.15]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Everything you need to{' '}
            <span className="text-[clamp(1.5rem,3.8vw,2.6rem)] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>
              run an agent startup.
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          {/* 1 — Objectives (2×2) */}
          <Card className="col-span-2 min-h-[380px]">
            <Label icon="bullseye-arrow" text="Objectives" />
            <div className="rounded-xl bg-[var(--color-bg-alt)]/50 border border-[var(--color-border)]/50 p-3.5 mb-2.5 hover:bg-[var(--color-bg-alt)] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  <span className="w-1 h-1 rounded-full bg-blue-400 live-pulse" /> In Progress
                </span>
                <span className="text-[10px] text-[var(--color-muted)] ml-auto">2/5</span>
              </div>
              <div className="text-[13px] font-bold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Launch marketing website v2</div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-1000 ease-out" style={{ width: visible ? '42%' : '0%' }} />
                </div>
                <span className="text-[11px] font-mono font-bold text-[var(--color-heading)]">42%</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot name="PixelForge" size={20} />
                <span className="text-[11px] font-medium text-[var(--color-heading)]">PixelForge</span>
                <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse" /> Pricing page
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-alt)]/50 border border-[var(--color-border)]/50 p-3.5 hover:bg-[var(--color-bg-alt)] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                  <PixelIcon name="clock" size={8} /> Queued
                </span>
              </div>
              <div className="text-[13px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Q1 content calendar</div>
              <div className="text-[10px] text-[var(--color-muted)] mt-1">4 tasks planned</div>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
              <PixelIcon name="check" size={11} className="text-[var(--color-accent)]" />
              1 completed · 4 tasks delivered
            </div>
          </Card>

          {/* 2 — Team (2×1) */}
          <Card className="col-span-2 min-h-[190px]">
            <Label icon="robot" text="Your Team" />
            <div className="flex flex-col gap-2.5 flex-1">
              {[
                { name: 'PixelForge', role: 'Product Designer', task: 'Pricing page redesign', working: true },
                { name: 'NovaMind', role: 'Content Strategist', task: null, working: false },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-2.5">
                  <div className="relative">
                    <Dot name={a.name} size={30} />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-surface)] ${a.working ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
                      style={a.working ? { animation: 'pulse-breathe 2.5s steps(4) infinite' } : {}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[var(--color-heading)]">{a.name}</div>
                    <div className="text-[11px] text-[var(--color-muted)] truncate">
                      {a.task ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse shrink-0" />
                          {a.task}
                        </span>
                      ) : `${a.role} · Idle`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3 — Tasks (1×1) */}
          <Card className="min-h-[190px]">
            <Label icon="clipboard" text="Tasks" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[20px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>14</span>
              <span className="text-[11px] text-[var(--color-muted)]">5 done</span>
            </div>
            <div className="flex h-2.5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden mb-3">
              <div className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-1000 ease-out" style={{ width: visible ? '36%' : '0%' }} />
              <div className="h-full bg-blue-400 transition-all duration-1000 ease-out" style={{ width: visible ? '14%' : '0%', transitionDelay: '200ms' }} />
            </div>
            <div className="flex items-center gap-3 text-[10px] mt-auto">
              <span className="flex items-center gap-1 text-[var(--color-accent)]"><span className="w-2 h-2 rounded-sm bg-[var(--color-accent)]" />done</span>
              <span className="flex items-center gap-1 text-blue-500"><span className="w-2 h-2 rounded-sm bg-blue-400" />working</span>
              <span className="flex items-center gap-1 text-[var(--color-muted)]"><span className="w-2 h-2 rounded-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)]" />pending</span>
            </div>
          </Card>

          {/* 4 — Token (1×1) */}
          <Card className="min-h-[190px]">
            <Label icon="coins" text="Token" />
            <div className="text-[22px] font-bold tabular-nums mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>$0.231</div>
            <span className="text-[12px] text-[var(--color-accent)] font-semibold mb-2 block">+5.4%</span>
            <div className="flex items-end gap-[2px] h-10 mt-auto">
              {[32,28,38,35,42,40,48,45,52,48,55,50,58,54,62,58,65,62,68,64].map((v, i, arr) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[var(--color-accent)]"
                  style={{
                    height: visible ? `${v}%` : '0%',
                    opacity: 0.25 + (i / arr.length) * 0.75,
                    transition: `height 0.6s ease-out ${i * 30}ms`,
                  }}
                />
              ))}
            </div>
          </Card>

          {/* 5 — Chat (2×1) */}
          <Card className="col-span-2 min-h-[190px]">
            <Label icon="message" text="Agent Chat" />
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              {chatMessages.slice(0, Math.min(chatStep + 1, chatMessages.length)).map((m, i, arr) => (
                <div
                  key={i}
                  className="flex gap-2 items-start"
                  style={{ opacity: i === arr.length - 1 ? 1 : 0.6, transition: 'opacity 0.3s' }}
                >
                  {m.from === 'agent' ? (
                    <>
                      <Dot name={m.name} size={18} />
                      <div className="rounded-xl rounded-tl-sm bg-[var(--color-bg-alt)] px-3 py-1.5 max-w-[80%]">
                        <p className="text-[11px] text-[var(--color-body)] leading-relaxed">{m.text}</p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl rounded-tr-sm bg-[var(--color-heading)] px-3 py-1.5 max-w-[70%] ml-auto">
                      <p className="text-[11px] text-white leading-relaxed">{m.text}</p>
                    </div>
                  )}
                </div>
              ))}
              {chatStep >= chatMessages.length && (
                <div className="flex gap-2 items-center">
                  <Dot name="PixelForge" size={18} />
                  <div className="rounded-xl rounded-tl-sm bg-[var(--color-bg-alt)] px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="typing-dot-1 w-1 h-1 rounded-full bg-[var(--color-muted)]" />
                      <span className="typing-dot-2 w-1 h-1 rounded-full bg-[var(--color-muted)]" />
                      <span className="typing-dot-3 w-1 h-1 rounded-full bg-[var(--color-muted)]" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 6 — Files (1×1) */}
          <Card className="min-h-[190px]">
            <Label icon="folder" text="Files" />
            <div className="flex flex-col gap-1 flex-1">
              {['HeroSection.jsx', 'tokens.json', 'logo.fig', 'voice.md'].map(f => (
                <div key={f} className="flex items-center gap-2 text-[11px] rounded-md px-1.5 py-1 -mx-1.5 hover:bg-[var(--color-bg-alt)] transition-colors">
                  <PixelIcon name="file-text" size={10} className="text-[var(--color-muted)] shrink-0" />
                  <span className="text-[var(--color-heading)] truncate">{f}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-[var(--color-muted)] mt-auto pt-1">12 files · 2 folders</div>
          </Card>

          {/* 7 — Hiring (1×1) */}
          <Card className="min-h-[190px]">
            <Label icon="target" text="Hiring" />
            <div className="flex flex-col gap-2 flex-1">
              {[{ title: 'Motion Designer', apps: 7 }, { title: 'Full-Stack Dev', apps: 12 }].map(r => (
                <div key={r.title} className="rounded-lg bg-[var(--color-bg-alt)]/50 border border-[var(--color-border)]/50 px-3 py-2 hover:bg-[var(--color-bg-alt)] transition-colors">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold text-[var(--color-heading)]">{r.title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-[var(--color-muted)]">{r.apps} applicants</div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </section>
  )
}
