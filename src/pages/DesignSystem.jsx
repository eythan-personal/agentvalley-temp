import { useState } from 'react'
import PixelIcon from '../components/PixelIcon'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import {
  PrimaryButton, SecondaryButton, ConnectButton,
  TextInput, TextArea, SelectInput,
  DashCard, CardLabel, SelectableCard,
  ToggleSwitch, StatusBadge, AgentDot, SegmentedProgress,
} from '../components/ui'

/* ── Section wrapper ── */
function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-20">
      <h2 className="text-[22px] font-bold text-[var(--color-heading)] mb-6 pb-3 border-b border-[var(--color-border)]" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }) {
  return (
    <div className="mb-10">
      <h3 className="text-[16px] font-semibold text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      {children}
    </div>
  )
}

function TokenRow({ name, value, preview }) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0">
      <code className="text-[12px] font-mono text-[var(--color-accent)] w-48 shrink-0">{name}</code>
      <code className="text-[12px] font-mono text-[var(--color-muted)] flex-1">{value}</code>
      {preview && <div className="shrink-0">{preview}</div>}
    </div>
  )
}

function ColorSwatch({ name, value, dark }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-xl border border-[var(--color-border)] shadow-sm" style={{ background: value }} />
      <div className="text-center">
        <div className="text-[11px] font-mono text-[var(--color-heading)]">{name.replace('--color-', '')}</div>
        <div className="text-[10px] font-mono text-[var(--color-muted)]">{value}</div>
      </div>
    </div>
  )
}

function ComponentDemo({ title, description, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <div className="text-[14px] font-semibold text-[var(--color-heading)]">{title}</div>
        {description && <div className="text-[12px] text-[var(--color-muted)]">{description}</div>}
      </div>
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
        {children}
      </div>
    </div>
  )
}

function SelectableCardDemo() {
  const [sel, setSel] = useState('open')
  return (
    <div className="grid grid-cols-2 gap-3 max-w-sm">
      <SelectableCard selected={sel === 'open'} onClick={() => setSel('open')}>
        <PixelIcon name="globe" size={16} className={sel === 'open' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
        <div className="text-[14px] font-semibold mt-2">Open</div>
        <div className="text-[11px] text-[var(--color-muted)]">Discoverable by everyone</div>
      </SelectableCard>
      <SelectableCard selected={sel === 'private'} onClick={() => setSel('private')}>
        <PixelIcon name="lock" size={16} className={sel === 'private' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
        <div className="text-[14px] font-semibold mt-2">Private</div>
        <div className="text-[11px] text-[var(--color-muted)]">Invite-only access</div>
      </SelectableCard>
    </div>
  )
}

function ToggleSwitchDemo() {
  const [on, setOn] = useState(true)
  const [off, setOff] = useState(false)
  return (
    <div className="flex gap-4">
      <ToggleSwitch checked={on} onChange={setOn} />
      <ToggleSwitch checked={off} onChange={setOff} />
    </div>
  )
}

/* ── Nav sidebar items ── */
const NAV_ITEMS = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing & Layout' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'motion', label: 'Motion' },
  { id: 'icons', label: 'Icons' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges & Status' },
  { id: 'progress', label: 'Progress' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'agent', label: 'Agent Patterns' },
  { id: 'roadmap', label: 'Roadmap' },
]

/* ── All icon names ── */
const ICON_NAMES = [
  'zap','robot','chart','chart-bar','shield','sword','speed','target','trophy','crown',
  'terminal','cpu','server','globe','coins','sparkle','repeat','database','lock','power',
  'login','wallet','search','grid','list','menu','close','arrow-left','arrow-right','check',
  'clock','folder','image','loader','message','note','add-box','list-box','file-text','plus',
  'thumbs-up','thumbs-down','external-link','calendar','calendar-check','article','chevron-right',
  'coin','edit-box','notification','settings','briefcase','clipboard','chevrons-vertical',
  'more-vertical','user','bullseye-arrow','upload',
]

export default function DesignSystem() {
  const [activeSection, setActiveSection] = useState('colors')

  return (
    <div>
      <Nav forceScrolled />
      <div className="pt-20 px-6 pb-20">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <PixelIcon name="sparkle" size={20} className="text-[var(--color-accent)]" />
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Design System</span>
            </div>
            <h1 className="text-[32px] font-bold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              AgentValley <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Design System</span>
            </h1>
            <p className="text-[15px] text-[var(--color-body)] max-w-xl leading-relaxed">
              Living reference for tokens, components, and patterns used across the AgentValley platform.
            </p>
          </div>

          <div className="flex gap-10">
            {/* Sidebar nav */}
            <nav className="hidden lg:block w-48 shrink-0 sticky top-24 self-start">
              <div className="space-y-0.5">
                {NAV_ITEMS.map(item => (
                  <a key={item.id} href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`block px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                      activeSection === item.id
                        ? 'text-[var(--color-heading)] font-medium bg-[var(--color-bg-alt)]'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                    }`}>
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* ═══ COLORS ═══ */}
              <Section id="colors" title="Colors">
                <Subsection title="Light Mode">
                  <div className="flex flex-wrap gap-5">
                    <ColorSwatch name="--color-bg" value="#FBFAF9" />
                    <ColorSwatch name="--color-bg-alt" value="#F2F0ED" />
                    <ColorSwatch name="--color-surface" value="#FFFFFF" />
                    <ColorSwatch name="--color-accent" value="#9fe870" />
                    <ColorSwatch name="--color-accent-soft" value="#f0fbe8" />
                    <ColorSwatch name="--color-heading" value="#171717" />
                    <ColorSwatch name="--color-body" value="#494440" />
                    <ColorSwatch name="--color-muted" value="#767270" />
                    <ColorSwatch name="--color-border" value="#E8E8E8" />
                    <ColorSwatch name="--color-input" value="#f7f7f7" />
                  </div>
                </Subsection>
                <Subsection title="Dark Mode">
                  <div className="flex flex-wrap gap-5">
                    <ColorSwatch name="--color-bg" value="#121212" dark />
                    <ColorSwatch name="--color-bg-alt" value="#2a2a2a" dark />
                    <ColorSwatch name="--color-surface" value="#1e1e1e" dark />
                    <ColorSwatch name="--color-heading" value="#f0f0f0" dark />
                    <ColorSwatch name="--color-body" value="#c5c2bf" dark />
                    <ColorSwatch name="--color-muted" value="#8a8582" dark />
                    <ColorSwatch name="--color-border" value="#363636" dark />
                    <ColorSwatch name="--color-input" value="#343434" dark />
                  </div>
                </Subsection>
                <Subsection title="Semantic Usage">
                  <div className="rounded-xl bg-[var(--color-bg-alt)] p-4 text-[12px] font-mono text-[var(--color-body)] leading-relaxed space-y-1">
                    <div><span className="text-[var(--color-accent)]">bg</span> — page background</div>
                    <div><span className="text-[var(--color-accent)]">bg-alt</span> — cards on cards, subdued sections, input backgrounds</div>
                    <div><span className="text-[var(--color-accent)]">surface</span> — card/panel backgrounds (white in light mode)</div>
                    <div><span className="text-[var(--color-accent)]">accent</span> — primary action, brand, progress, selected states</div>
                    <div><span className="text-[var(--color-accent)]">heading</span> — titles, strong text, primary buttons</div>
                    <div><span className="text-[var(--color-accent)]">body</span> — body copy, descriptions</div>
                    <div><span className="text-[var(--color-accent)]">muted</span> — secondary text, labels, placeholders</div>
                    <div><span className="text-[var(--color-accent)]">border</span> — card borders, dividers</div>
                    <div><span className="text-[var(--color-accent)]">input</span> — form field backgrounds</div>
                  </div>
                </Subsection>
              </Section>

              {/* ═══ TYPOGRAPHY ═══ */}
              <Section id="typography" title="Typography">
                <Subsection title="Font Families">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--color-bg-alt)]">
                      <div className="text-[11px] font-mono text-[var(--color-muted)] mb-2">--font-display / --font-body: Sora</div>
                      <div className="text-[24px] text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>The quick brown fox jumps over the lazy dog</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--color-bg-alt)]">
                      <div className="text-[11px] font-mono text-[var(--color-muted)] mb-2">--font-accent: PP Mondwest</div>
                      <div className="text-[24px] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>The quick brown fox jumps over the lazy dog</div>
                    </div>
                  </div>
                </Subsection>
                <Subsection title="Type Scale">
                  <div className="space-y-3">
                    {[
                      { size: '24px', weight: 700, label: 'Page title', font: 'display' },
                      { size: '17px', weight: 700, label: 'Card title', font: 'display' },
                      { size: '15px', weight: 600, label: 'Section heading', font: 'display' },
                      { size: '14px', weight: 600, label: 'Body bold / input text', font: 'body' },
                      { size: '13px', weight: 400, label: 'Body / descriptions', font: 'body' },
                      { size: '12px', weight: 400, label: 'Small text / labels', font: 'body' },
                      { size: '11px', weight: 500, label: 'Mono labels (uppercase)', font: 'mono' },
                      { size: '10px', weight: 400, label: 'Micro text', font: 'body' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-baseline gap-4">
                        <code className="text-[11px] font-mono text-[var(--color-muted)] w-20 shrink-0">{t.size}</code>
                        <span style={{ fontSize: t.size, fontWeight: t.weight, fontFamily: t.font === 'mono' ? 'monospace' : `var(--font-${t.font})` }}
                          className={`text-[var(--color-heading)] ${t.font === 'mono' ? 'uppercase tracking-wider' : ''}`}>
                          {t.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              {/* ═══ SPACING ═══ */}
              <Section id="spacing" title="Spacing & Layout">
                <Subsection title="Spacing Scale">
                  <div className="space-y-2">
                    {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map(v => (
                      <div key={v} className="flex items-center gap-4">
                        <code className="text-[11px] font-mono text-[var(--color-muted)] w-12 shrink-0">{v}px</code>
                        <div className="h-3 rounded-sm bg-[var(--color-accent)]" style={{ width: v * 2 }} />
                      </div>
                    ))}
                  </div>
                </Subsection>
                <Subsection title="Layout Tokens">
                  <div className="rounded-xl bg-[var(--color-bg-alt)] p-4">
                    <TokenRow name="--container" value="1040px" />
                    <TokenRow name="--radius" value="12px" />
                    <TokenRow name="Dashboard max-w" value="540px" />
                    <TokenRow name="Card padding" value="20px (p-5)" />
                    <TokenRow name="Card gap" value="16px (mb-4)" />
                    <TokenRow name="Card radius" value="16px (rounded-2xl)" />
                  </div>
                </Subsection>
              </Section>

              {/* ═══ ELEVATION ═══ */}
              <Section id="elevation" title="Elevation & Shadows">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'None', cls: '' },
                    { label: 'sm', cls: 'shadow-sm' },
                    { label: 'md (cards)', cls: 'shadow-md shadow-black/4' },
                    { label: 'lg (hover)', cls: 'shadow-lg shadow-black/8' },
                    { label: 'xl (modals)', cls: 'shadow-xl shadow-black/10' },
                    { label: '2xl (floating)', cls: 'shadow-2xl shadow-black/20' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 ${s.cls}`}>
                      <div className="text-[13px] font-semibold text-[var(--color-heading)]">{s.label}</div>
                      <div className="text-[11px] font-mono text-[var(--color-muted)] mt-1">{s.cls || 'none'}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ═══ MOTION ═══ */}
              <Section id="motion" title="Motion & Animation">
                <Subsection title="Easing">
                  <div className="rounded-xl bg-[var(--color-bg-alt)] p-4 text-[12px] font-mono text-[var(--color-body)] space-y-1">
                    <div><span className="text-[var(--color-accent)]">steps(4)</span> — pixel-art brand easing (most animations)</div>
                    <div><span className="text-[var(--color-accent)]">steps(3)</span> — fast micro-interactions</div>
                    <div><span className="text-[var(--color-accent)]">cubic-bezier(0.16, 1, 0.3, 1)</span> — smooth spring for layout transitions</div>
                    <div><span className="text-[var(--color-accent)]">power2.in/out</span> — GSAP step transitions</div>
                  </div>
                </Subsection>
                <Subsection title="Animation Classes">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { cls: 'pixel-float', label: 'Float' },
                      { cls: 'live-pulse', label: 'Pulse' },
                      { cls: 'blink-cursor', label: 'Cursor' },
                      { cls: 'badge-breathe', label: 'Breathe' },
                      { cls: 'animate-slide-in', label: 'Slide In' },
                    ].map(a => (
                      <div key={a.cls} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--color-bg-alt)]">
                        <div className={a.cls}>
                          <PixelIcon name="sparkle" size={20} className="text-[var(--color-accent)]" />
                        </div>
                        <code className="text-[10px] font-mono text-[var(--color-muted)]">.{a.cls}</code>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              {/* ═══ ICONS ═══ */}
              <Section id="icons" title="Icons">
                <p className="text-[13px] text-[var(--color-muted)] mb-4">
                  Using <code className="text-[var(--color-accent)]">pixelarticons</code> via the <code className="text-[var(--color-accent)]">PixelIcon</code> component. 8×8 pixel grid, crisp rendering.
                </p>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                  {ICON_NAMES.map(name => (
                    <div key={name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors group cursor-default">
                      <PixelIcon name={name} size={22} className="text-[var(--color-heading)] group-hover:text-[var(--color-accent)] transition-colors" />
                      <span className="text-[9px] font-mono text-[var(--color-muted)] truncate max-w-full">{name}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ═══ BUTTONS ═══ */}
              <Section id="buttons" title="Buttons">
                <ComponentDemo title="Primary" description="Main actions — accent green, dark text. Sizes: md, lg, xl">
                  <div className="flex flex-wrap gap-3 items-center">
                    <PrimaryButton icon="power" size="xl">Launch Startup</PrimaryButton>
                    <PrimaryButton icon="plus" size="lg">Create Objective</PrimaryButton>
                    <PrimaryButton icon="chevron-right" size="md">Continue</PrimaryButton>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center mt-3">
                    <PrimaryButton loading size="lg">Launching...</PrimaryButton>
                    <PrimaryButton disabled size="lg">Disabled</PrimaryButton>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Secondary" description="Back, cancel, less prominent actions">
                  <div className="flex flex-wrap gap-3 items-center">
                    <SecondaryButton size="lg">Back</SecondaryButton>
                    <SecondaryButton size="md">Cancel</SecondaryButton>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Connect / Small" description="Inline actions — rounded-full pill">
                  <div className="flex flex-wrap gap-3">
                    <ConnectButton>Connect</ConnectButton>
                    <ConnectButton connected>Connected</ConnectButton>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Toggle Switch" description="For on/off settings">
                  <ToggleSwitchDemo />
                </ComponentDemo>
              </Section>

              {/* ═══ INPUTS ═══ */}
              <Section id="inputs" title="Inputs">
                <ComponentDemo title="Text Input" description="h-12, rounded-xl, bg-input, mono label">
                  <div className="max-w-sm space-y-4">
                    <TextInput label="Startup Name" required placeholder="e.g. CodeForge Labs" />
                    <TextInput label="With Error" required placeholder="Too short" error="Name must be at least 2 characters" />
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Textarea" description="Same styling, resize-none">
                  <div className="max-w-sm">
                    <TextArea label="Description" placeholder="Describe what your startup does..." />
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Select" description="Native select with custom arrow">
                  <div className="max-w-sm">
                    <SelectInput label="Vesting Schedule" required>
                      <option value="" disabled>Select an option...</option>
                      <option>3 months, 33% monthly</option>
                      <option>6 months, 20% monthly</option>
                    </SelectInput>
                  </div>
                </ComponentDemo>
              </Section>

              {/* ═══ CARDS ═══ */}
              <Section id="cards" title="Cards">
                <ComponentDemo title="Dashboard Card" description="DashCard + CardLabel">
                  <div className="max-w-sm">
                    <DashCard>
                      <CardLabel>Section Label</CardLabel>
                      <div className="text-[15px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Card Title</div>
                      <div className="text-[13px] text-[var(--color-body)] mt-1">Card body text goes here.</div>
                    </DashCard>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Selectable Card" description="SelectableCard — border highlights on selection">
                  <SelectableCardDemo />
                </ComponentDemo>
              </Section>

              {/* ═══ BADGES ═══ */}
              <Section id="badges" title="Badges & Status">
                <ComponentDemo title="Status Badges" description="StatusBadge component — all variants">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant="in-progress" />
                    <StatusBadge variant="working" />
                    <StatusBadge variant="queued" />
                    <StatusBadge variant="completed" />
                    <StatusBadge variant="pending" />
                    <StatusBadge variant="urgent" />
                    <StatusBadge variant="medium" />
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Agent Dot" description="AgentDot component — deterministic color from name">
                  <div className="flex gap-4 items-end">
                    {['PixelForge', 'NovaMind', 'CodeWraith', 'SynthMind'].map(name => (
                      <div key={name} className="flex flex-col items-center gap-1.5">
                        <AgentDot name={name} size={32} />
                        <span className="text-[10px] text-[var(--color-muted)]">{name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center mt-4">
                    <AgentDot name="Active" size={28} active />
                    <span className="text-[12px] text-[var(--color-muted)]">With <code className="text-[var(--color-accent)]">active</code> prop (ring pulse)</span>
                  </div>
                </ComponentDemo>
              </Section>

              {/* ═══ PROGRESS ═══ */}
              <Section id="progress" title="Progress">
                <ComponentDemo title="Segmented Progress Bar" description="SegmentedProgress component">
                  <div className="max-w-sm space-y-6">
                    <SegmentedProgress completed={5} assigned={2} pending={7} />
                    <SegmentedProgress completed={10} assigned={0} pending={0} />
                    <SegmentedProgress completed={0} assigned={3} pending={5} />
                  </div>
                </ComponentDemo>
              </Section>

              {/* ═══ FEEDBACK ═══ */}
              <Section id="feedback" title="Feedback">
                <ComponentDemo title="Loading States" description="Skeleton shimmer and spinner">
                  <div className="flex gap-4 items-center">
                    <div className="skeleton-shimmer rounded-xl h-10 w-32" />
                    <div className="skeleton-shimmer rounded-full h-8 w-8" />
                    <span className="text-[var(--color-accent)] live-pulse"><PixelIcon name="loader" size={24} /></span>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Typing Indicator" description="Three bouncing dots">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot-1 w-2 h-2 rounded-full bg-[var(--color-muted)]" />
                    <span className="typing-dot-2 w-2 h-2 rounded-full bg-[var(--color-muted)]" />
                    <span className="typing-dot-3 w-2 h-2 rounded-full bg-[var(--color-muted)]" />
                  </div>
                </ComponentDemo>
              </Section>

              {/* ═══ AGENT PATTERNS ═══ */}
              <Section id="agent" title="Agent Patterns">
                <ComponentDemo title="Agent Status Row" description="Avatar + name + status dot + current task">
                  <div className="max-w-sm space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center rounded-full text-white text-[11px] font-bold" style={{ width: 28, height: 28, background: 'hsl(200, 65%, 50%)' }}>PI</span>
                      <span className="text-[13px] font-medium text-[var(--color-heading)]">PixelForge</span>
                      <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse" /> Pricing page
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center rounded-full text-white text-[11px] font-bold" style={{ width: 28, height: 28, background: 'hsl(300, 65%, 50%)' }}>NO</span>
                      <span className="text-[13px] font-medium text-[var(--color-heading)]">NovaMind</span>
                      <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" /> Idle
                      </span>
                    </div>
                  </div>
                </ComponentDemo>
                <ComponentDemo title="Chat Bubbles" description="AI (left with avatar) and User (right, dark)">
                  <div className="max-w-sm space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
                        <PixelIcon name="robot" size={14} className="text-[var(--color-accent)]" />
                      </div>
                      <div className="rounded-xl rounded-tl-sm bg-[var(--color-bg-alt)] px-3 py-2">
                        <p className="text-[13px] text-[var(--color-body)]">How's the pricing page looking?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="rounded-xl rounded-tr-sm bg-[var(--color-heading)] px-3 py-2">
                        <p className="text-[13px] text-white">Almost done — shipping today.</p>
                      </div>
                    </div>
                  </div>
                </ComponentDemo>
              </Section>

              {/* ═══ ROADMAP ═══ */}
              <Section id="roadmap" title="Roadmap">
                {[
                  { tier: 'Tier 1 — Build Now', color: 'bg-[var(--color-accent)]', items: [
                    'Extract reusable components (DashCard, TextInput, PrimaryButton, etc.)',
                    'Formalize spacing tokens (4px scale)',
                    'Shadow/elevation tokens',
                    'Typography scale tokens',
                    'Component props documentation',
                    'Interactive playground',
                  ]},
                  { tier: 'Tier 2 — Agent Patterns', color: 'bg-blue-400', items: [
                    'Agent lifecycle states (idle, thinking, acting, waiting, error, complete)',
                    'Conversational UI patterns (message types, streaming, threading)',
                    'Tool invocation and result cards',
                    'Multi-agent orchestration views',
                    'Trust and transparency indicators',
                    'Context and memory visualization',
                  ]},
                  { tier: 'Tier 3 — Platform & Tooling', color: 'bg-amber-400', items: [
                    'Figma library structure',
                    'Storybook / component dev environment',
                    'Visual regression testing',
                    'Token linting and CI checks',
                    'Platform-specific guidance (Swift, Kotlin)',
                    'Contribution model and versioning',
                    'White-label / theming support',
                    'Accessibility audit per component',
                    'Content and voice guidelines',
                  ]},
                ].map(tier => (
                  <div key={tier.tier} className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                      <h3 className="text-[15px] font-semibold text-[var(--color-heading)]">{tier.tier}</h3>
                    </div>
                    <div className="space-y-1.5 ml-5">
                      {tier.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-body)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] mt-1.5 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
