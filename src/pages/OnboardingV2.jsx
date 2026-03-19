import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import logoSvg from '../assets/logo_av.svg'

/* ── Chat components ── */
function AIBubble({ text }) {
  return (
    <div className="flex gap-3 items-start animate-slide-in">
      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
        <img src={logoSvg} alt="" width={16} height={16} />
      </div>
      <p className="text-[14px] text-[var(--color-heading)] leading-relaxed pt-1">{text}</p>
    </div>
  )
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end animate-slide-in">
      <div className="bg-[var(--color-heading)] text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
        <p className="text-[14px] leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-3 items-start animate-slide-in">
      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] flex items-center justify-center shrink-0">
        <img src={logoSvg} alt="" width={16} height={16} />
      </div>
      <div className="flex items-center gap-1 pt-2">
        <span className="typing-dot-1 w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
        <span className="typing-dot-2 w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
        <span className="typing-dot-3 w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
      </div>
    </div>
  )
}

function OptionCards({ options, onSelect, columns = 1 }) {
  return (
    <div className={`ml-10 animate-slide-in ${columns === 2 ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
      {options.map((opt, i) => (
        <button key={i} type="button" onClick={() => onSelect(opt)}
          className="text-left px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]
                     hover:border-[var(--color-accent)]/40 hover:shadow-sm transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            {opt.icon && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] group-hover:bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 transition-colors">
                {typeof opt.icon === 'string'
                  ? <PixelIcon name={opt.icon} size={16} className="text-[var(--color-heading)] group-hover:text-[var(--color-accent)] transition-colors" />
                  : opt.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[var(--color-heading)]">{opt.label}</div>
              {opt.desc && <div className="text-[11px] text-[var(--color-muted)]">{opt.desc}</div>}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function DropZone({ files, onFiles, onRemove, onContinue }) {
  const [dragging, setDragging] = useState(false)
  const ref = useRef(null)
  return (
    <div className="space-y-2">
      <div className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
        dragging ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/[0.06]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30'
      }`}
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onFiles(Array.from(e.dataTransfer.files)) }}>
        <PixelIcon name="upload" size={20} className={`mx-auto mb-2 ${dragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}`} />
        <div className="text-[13px] font-medium">{dragging ? 'Drop here' : 'Drop files or browse'}</div>
      </div>
      <input ref={ref} type="file" multiple className="hidden" onChange={e => onFiles(Array.from(e.target.files || []))} />
      {files.length > 0 && (
        <>
          <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
            {files.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 text-[12px] ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                <PixelIcon name="file-text" size={12} className="text-[var(--color-muted)]" />
                <span className="truncate flex-1">{f.name}</span>
                <span className="text-[var(--color-muted)] text-[10px]">{f.size}</span>
                <button type="button" onClick={() => onRemove(i)} className="text-[var(--color-muted)] hover:text-red-500 cursor-pointer p-0.5"><PixelIcon name="close" size={10} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={onContinue}
            className="h-10 px-6 rounded-2xl text-[13px] font-semibold bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5">
            Continue <PixelIcon name="chevron-right" size={12} />
          </button>
        </>
      )}
    </div>
  )
}

function PreviewCard({ form, centered }) {
  return (
    <div className={`${centered ? '' : 'ml-10'} animate-slide-in`}>
      <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
        <div className="h-20 relative" style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #7bc96f 100%)' }}>
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }} />
        </div>
        <div className="px-4 pb-4 text-center">
          <div className="relative -mt-6 mb-2 flex justify-center">
            <div className="w-12 h-12 rounded-xl border-[3px] border-[var(--color-surface)] shadow-sm overflow-hidden" style={{ background: 'var(--color-accent)' }}>
              <div className="w-full h-full flex items-center justify-center text-[#0d2000] text-[14px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AV'}
              </div>
            </div>
          </div>
          <div className="text-[16px] font-bold mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{form.name}</div>
          <div className="text-[12px] text-[var(--color-muted)] mb-3 line-clamp-2">{form.description}</div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {form.tokenName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <PixelIcon name="coins" size={8} />${form.tokenName}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-muted)]">
              <PixelIcon name={form.visibility === 'open' ? 'globe' : 'lock'} size={8} />
              {form.visibility === 'open' ? 'Open' : 'Private'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Conversation script ── */
const GITHUB_ICON = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
const VERCEL_ICON = <svg width="14" height="12" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>

const STEPS = [
  { id: 'name', ai: "Hey! I'm your AgentValley co-pilot. Let's build something. What's your startup called?", input: 'text', placeholder: 'Startup name...', field: 'name' },
  { id: 'desc', ai: f => `"${f.name}" — I like it. What does ${f.name} do? One or two sentences.`, input: 'text', placeholder: 'What does it do...', field: 'description' },
  { id: 'import', ai: f => `Got it. Are you starting ${f.name} from scratch, or bringing existing work?`, input: 'options', field: 'importMethod', title: 'How do you want to start?', skippable: true, options: [
    { label: 'Start fresh', desc: 'Blank slate', icon: 'zap', value: 'skip' },
    { label: 'Upload files', desc: 'Bring existing work', icon: 'upload', value: 'upload' },
    { label: 'Connect GitHub', desc: 'Import a repo', icon: GITHUB_ICON, value: 'github' },
    { label: 'Connect Vercel', desc: 'Deployed project', icon: VERCEL_ICON, value: 'vercel' },
  ]},
  { id: 'token', ai: f => `Do you want to launch a token for ${f.name}?`, input: 'options', field: 'tokenMode', title: 'Token', skippable: true, columns: 2, options: [
    { label: 'Yes, create a token', desc: 'Bonding curve launch', icon: 'coins', value: 'create' },
    { label: 'Not right now', desc: 'Add one later', icon: 'close', value: 'none' },
  ]},
  { id: 'ticker', ai: 'What should the ticker be? 2-8 characters.', input: 'text', placeholder: 'e.g. FORGE', field: 'tokenName', transform: v => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8), skip: f => f.tokenMode !== 'create' },
  { id: 'vesting', ai: 'Pick a vesting schedule.', input: 'options', field: 'tokenVesting', title: 'Vesting schedule', skip: f => f.tokenMode !== 'create', options: [
    { label: '3mo, 33% monthly', value: '3 months, 33% monthly' },
    { label: '4mo, 25% monthly', value: '4 months, 25% monthly' },
    { label: '6mo, 20% monthly', value: '6 months, 20% monthly' },
    { label: '12mo, cliff at 3mo', value: '12 months, cliff at 3mo then 11%' },
  ]},
  { id: 'visibility', ai: f => `Almost done! Should ${f.name} be open or private?`, input: 'options', field: 'visibility', title: 'Visibility', columns: 2, options: [
    { label: 'Open', desc: 'Anyone can discover', icon: 'globe', value: 'open' },
    { label: 'Private', desc: 'Invite-only', icon: 'lock', value: 'private' },
  ]},
  { id: 'launch', ai: f => `Perfect! ${f.name} is all set up. Let me prepare everything for launch...`, input: 'launch' },
]

export default function OnboardingV2() {
  const navigate = useNavigate()
  const [signedIn, setSignedIn] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [typing, setTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [launchScreen, setLaunchScreen] = useState(false) // false | 'loading' | 'ready'
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const [form, setForm] = useState({
    name: '', description: '', importMethod: null, importFiles: [],
    tokenMode: null, tokenName: '', tokenVesting: '',
    visibility: 'open',
  })

  const update = useCallback((field, value) => setForm(prev => ({ ...prev, [field]: value })), [])

  useEffect(() => { document.title = 'Create Startup — AgentValley' }, [])
  const chatContainerRef = useRef(null)

  // Scroll last user message to top of chat container
  const scrollTimers = useRef([])
  const scrollToUser = useCallback((el) => {
    if (!el) return
    // Clear any pending scrolls
    scrollTimers.current.forEach(clearTimeout)
    const doScroll = () => {
      const container = chatContainerRef.current
      if (!container || !el) return
      const containerTop = container.getBoundingClientRect().top
      const elTop = el.getBoundingClientRect().top
      const target = container.scrollTop + (elTop - containerTop) - 8
      container.scrollTo({ top: target, behavior: 'smooth' })
    }
    // Fire multiple times to catch async renders
    scrollTimers.current = [
      setTimeout(doScroll, 50),
      setTimeout(doScroll, 250),
      setTimeout(doScroll, 600),
      setTimeout(doScroll, 1000),
    ]
  }, [])

  const pushAI = useCallback((text, then) => {
    setTyping(true)
    setShowInput(false)
    setShowOptions(false)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'ai', text }])
      setTimeout(() => then?.(), 200)
    }, 600 + Math.random() * 400)
  }, [])

  const runStep = useCallback((idx, currentForm) => {
    // Skip steps
    while (idx < STEPS.length && STEPS[idx].skip?.(currentForm)) idx++
    if (idx >= STEPS.length) return
    setStepIdx(idx)

    const step = STEPS[idx]
    const aiText = typeof step.ai === 'function' ? step.ai(currentForm) : step.ai

    pushAI(aiText, () => {
      if (step.input === 'text') { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 100) }
      else if (step.input === 'options') setShowOptions(true)
      else if (step.input === 'launch') {
        // Transition to launch screen after a moment
        setTimeout(() => {
          setLaunchScreen('loading')
          setTimeout(() => setLaunchScreen('ready'), 1500)
        }, 1000)
      }
    })
  }, [pushAI])

  useEffect(() => {
    if (signedIn && messages.length === 0) runStep(0, form)
  }, [signedIn])

  const handleSubmitText = () => {
    const step = STEPS[stepIdx]
    if (!inputValue.trim()) return
    const val = step.transform ? step.transform(inputValue.trim()) : inputValue.trim()

    setMessages(prev => [...prev, { role: 'user', text: val }])
    setShowInput(false)
    setInputValue('')

    const newForm = { ...form, [step.field]: val }
    setForm(newForm)
    setTimeout(() => runStep(stepIdx + 1, newForm), 300)
  }

  const handleOption = (opt, field) => {
    setMessages(prev => [...prev, { role: 'user', text: opt.label }])
    setShowOptions(false)

    // Special: upload triggers drop zone instead of advancing
    if (opt.value === 'upload') {
      const newForm = { ...form, [field]: 'upload' }
      setForm(newForm)
      pushAI('Drop your files below, then hit continue when ready.', () => setShowOptions(true))
      return
    }
    if (opt.value === 'github') {
      const newForm = { ...form, [field]: 'github' }
      setForm(newForm)
      pushAI('GitHub connected! Moving on.', () => { setTimeout(() => runStep(stepIdx + 1, newForm), 300) })
      return
    }
    if (opt.value === 'vercel') {
      const newForm = { ...form, [field]: 'vercel' }
      setForm(newForm)
      pushAI('Vercel connected! Moving on.', () => { setTimeout(() => runStep(stepIdx + 1, newForm), 300) })
      return
    }

    const newForm = { ...form, [field]: opt.value }
    setForm(newForm)
    setTimeout(() => runStep(stepIdx + 1, newForm), 300)
  }

  const handleFiles = (files) => {
    const formatted = files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` }))
    update('importFiles', [...form.importFiles, ...formatted])
    update('importMethod', 'upload')
  }

  const handleUploadContinue = () => {
    setMessages(prev => [...prev, { role: 'user', text: `Uploaded ${form.importFiles.length} file${form.importFiles.length > 1 ? 's' : ''}` }])
    setShowOptions(false)
    setTimeout(() => runStep(stepIdx + 1, form), 300)
  }

  const handleSkip = () => {
    setMessages(prev => [...prev, { role: 'user', text: 'Skip' }])
    setShowOptions(false)
    setTimeout(() => runStep(stepIdx + 1, form), 300)
  }

  const handleLaunch = () => {
    setSubmitting(true)
    setTimeout(() => {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      navigate(`/dashboard/${slug}`, { state: { justCreated: true, startupName: form.name } })
    }, 1500)
  }

  // ── Sign-in screen ──
  if (!signedIn) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col items-center justify-center px-6">
        <TransitionLink to="/" className="fixed top-4 right-4 sm:right-6 z-50 w-9 h-9 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-all" aria-label="Close">
          <PixelIcon name="close" size={14} />
        </TransitionLink>
        <div className="w-full max-w-[380px]">
          <div className="flex flex-col items-center mb-8">
            <div style={{ animation: 'pixel-float 2.5s steps(4) infinite' }}><img src={logoSvg} alt="" width={48} height={48} /></div>
            <h1 className="text-[22px] font-bold mt-5 mb-1 text-center" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome to <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>AgentValley</span>
            </h1>
            <p className="text-[13px] text-[var(--color-muted)] text-center">Sign in to launch your startup</p>
          </div>
          <div className="space-y-2.5">
            <button type="button" onClick={() => setSignedIn(true)} className="w-full h-12 rounded-2xl bg-[var(--color-heading)] text-white text-[13px] font-medium flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              Continue with Email
            </button>
            <div className="flex items-center gap-3 py-1"><div className="flex-1 h-px bg-[var(--color-border)]" /><span className="text-[10px] text-[var(--color-muted)] font-mono">OR</span><div className="flex-1 h-px bg-[var(--color-border)]" /></div>
            <button type="button" onClick={() => setSignedIn(true)} className="w-full h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] font-medium flex items-center gap-3 px-5 cursor-pointer hover:border-[var(--color-muted)]/50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button type="button" onClick={() => setSignedIn(true)} className="w-full h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] font-medium flex items-center gap-3 px-5 cursor-pointer hover:border-[var(--color-muted)]/50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              <span className="flex-1 text-center">Continue with GitHub</span>
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-muted)] mt-6 text-center leading-relaxed">
            By signing in, you agree to our <a href="#" className="underline underline-offset-2 hover:text-[var(--color-heading)]">Terms</a> and <a href="#" className="underline underline-offset-2 hover:text-[var(--color-heading)]">Privacy Policy</a>
          </p>
        </div>
      </div>
    )
  }

  // ── Chat interface ──
  const currentStep = STEPS[stepIdx]
  const isUploadStep = currentStep?.id === 'import' && form.importMethod === 'upload'
  const isLaunchStep = currentStep?.input === 'launch'

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col">
      {/* Header nav — top of viewport */}
      <div className="sticky top-0 z-50 px-4 sm:px-6">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
        }} />
        <div className="max-w-[540px] mx-auto py-3 flex items-center relative">
          <div className="flex items-center gap-2">
            <img src={logoSvg} alt="" width={20} height={20} />
            <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Create Startup</span>
          </div>
          <div className="flex-1" />
          <span className="text-[12px] text-[var(--color-muted)]">
            {stepIdx <= 1 ? 'About your startup...' : stepIdx <= 3 ? 'Setting things up...' : stepIdx <= 5 ? 'Token & funding...' : stepIdx <= 6 ? 'Almost there...' : 'Ready to launch'}
          </span>
        </div>
      </div>

      {/* Close — fixed top right */}
      <TransitionLink to="/"
        className="fixed top-4 right-4 sm:right-6 z-50 w-9 h-9 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-all"
        aria-label="Close">
        <PixelIcon name="close" size={14} />
      </TransitionLink>

      {/* ═══ LAUNCH SCREEN ═══ */}
      {launchScreen && (
        <div className="fixed inset-0 z-40 bg-[var(--color-bg)] flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-[480px] text-center">
            {launchScreen === 'loading' ? (
              <div className="flex flex-col items-center gap-4 animate-slide-in">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center" style={{ animation: 'pixel-float 2.5s steps(4) infinite' }}>
                  <PixelIcon name="loader" size={28} className="text-[var(--color-accent)] live-pulse" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Setting up {form.name}...</h2>
                  <p className="text-[13px] text-[var(--color-muted)]">Preparing your startup for launch</p>
                </div>
              </div>
            ) : (
              <div className="animate-slide-in">
                <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Ready to launch</h2>
                <p className="text-[13px] text-[var(--color-muted)] mb-6">Here's what your startup will look like</p>

                <PreviewCard form={form} centered />

                <div className="mt-6">
                  <button type="button" onClick={handleLaunch} disabled={submitting}
                    className="w-full h-14 rounded-2xl text-[15px] font-semibold bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60">
                    {submitting ? <><PixelIcon name="loader" size={18} className="live-pulse" /> Launching...</> : <><PixelIcon name="power" size={18} /> Launch {form.name}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat card — centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
      <div className="w-full max-w-[540px] rounded-2xl bg-[var(--color-bg-alt)] flex flex-col overflow-hidden" style={{ height: '700px', maxHeight: 'calc(100dvh - 120px)' }}>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
          <div className="space-y-5">
          {(() => {
            const lastUserIdx = messages.reduce((acc, m, i) => m.role === 'user' ? i : acc, -1)
            return messages.map((msg, i) => msg.role === 'ai'
              ? <AIBubble key={i} text={msg.text} />
              : <div key={i} ref={i === lastUserIdx ? (el) => { if (el) scrollToUser(el) } : undefined}><UserBubble text={msg.text} /></div>
            )
          })()}

          {typing && <TypingDots />}

          {/* Waiting state — shown while interactive panel is open at bottom */}
          {!typing && (showInput || showOptions) && !isLaunchStep && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <img src={logoSvg} alt="" width={16} height={16} />
              </div>
              <span className="text-[12px] text-[var(--color-muted)] italic pt-1">Waiting for your response...</span>
            </div>
          )}


          </div>
        </div>

        {/* Bottom panel — always visible inside card */}
        {!isLaunchStep && (
          <div className="relative border-t border-[var(--color-border)] px-4 py-3 shrink-0">

            {/* Options / upload — float above the input */}
            {!typing && showOptions && isUploadStep && (
              <div className="absolute bottom-full left-0 right-0 px-4 pb-2">
                <DropZone files={form.importFiles} onFiles={handleFiles}
                  onRemove={idx => update('importFiles', form.importFiles.filter((_, j) => j !== idx))}
                  onContinue={handleUploadContinue} />
              </div>
            )}

            {/* Options panel — grows upward over chat */}
            {!typing && showOptions && currentStep?.input === 'options' && !isUploadStep && !isLaunchStep && (
              <div className="absolute bottom-full left-0 right-0 px-4 pb-2 animate-slide-in">
                <div className="rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/8 border border-[var(--color-border)] overflow-hidden">
                  {/* Title + close */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <span className="text-[13px] font-semibold text-[var(--color-heading)]">{currentStep.title || 'Choose one'}</span>
                    {currentStep.skippable && (
                      <button type="button" onClick={handleSkip}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-all cursor-pointer">
                        <PixelIcon name="close" size={12} />
                      </button>
                    )}
                  </div>
                  {/* Options */}
                  {currentStep.options.map((opt, i) => (
                    <button key={i} type="button" onClick={() => handleOption(opt, currentStep.field)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:bg-[var(--color-bg-alt)]/50 border-t border-[var(--color-border)]">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0 text-[11px] font-mono text-[var(--color-muted)]">
                        {opt.icon ? (typeof opt.icon === 'string' ? <PixelIcon name={opt.icon} size={14} className="text-[var(--color-heading)]" /> : opt.icon) : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--color-heading)]">{opt.label}</div>
                        {opt.desc && <div className="text-[11px] text-[var(--color-muted)]">{opt.desc}</div>}
                      </div>
                    </button>
                  ))}
                  {/* Skip at bottom */}
                  {currentStep.skippable && (
                    <div className="border-t border-[var(--color-border)] px-4 py-2 flex justify-end">
                      <button type="button" onClick={handleSkip}
                        className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]">
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text input — always same size, always in place */}
            <form onSubmit={e => {
              e.preventDefault()
              if (!inputValue.trim()) return
              if (showOptions && currentStep?.input === 'options') {
                // Custom typed answer for option step
                const val = currentStep?.transform ? currentStep.transform(inputValue.trim()) : inputValue.trim()
                setMessages(prev => [...prev, { role: 'user', text: val }])
                setShowOptions(false)
                setInputValue('')
                const newForm = { ...form, [currentStep.field]: val }
                setForm(newForm)
                setTimeout(() => runStep(stepIdx + 1, newForm), 300)
              } else if (showInput) {
                handleSubmitText()
              }
            }} className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] px-4 h-11">
              <input ref={inputRef} type="text" value={inputValue}
                onChange={e => setInputValue(currentStep?.transform ? currentStep.transform(e.target.value) : e.target.value)}
                placeholder={typing ? 'Thinking...' : showOptions ? 'Something else...' : (currentStep?.placeholder || 'Type here...')}
                disabled={typing}
                className={`flex-1 bg-transparent text-[14px] text-[var(--color-heading)] placeholder:text-[#b0adaa] focus:outline-none ${typing ? 'opacity-30' : ''}`}
                autoFocus={showInput} />
              <button type="submit" disabled={!inputValue.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${inputValue.trim() ? 'bg-[var(--color-accent)] text-[#0d2000]' : 'text-[var(--color-muted)]'}`}>
                <PixelIcon name="chevron-right" size={16} />
              </button>
            </form>

          </div>
        )}
      </div>
      </div>
    </div>
  )
}
