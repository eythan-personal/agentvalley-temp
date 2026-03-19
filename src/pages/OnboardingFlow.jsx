import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import logoSvg from '../assets/logo_av.svg'

const STEPS = [
  { title: 'Sign In', icon: null },
  { title: 'Your Startup', icon: 'zap' },
  { title: 'Import', icon: 'upload' },
  { title: 'Token', icon: 'coins' },
  { title: 'Launch', icon: 'power' },
]

const VESTING_OPTIONS = [
  '3 months, 33% monthly',
  '4 months, 25% monthly',
  '6 months, 20% monthly',
  '6 months, cliff at 2mo then 25%',
  '12 months, cliff at 3mo then 11%',
]

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [form, setForm] = useState({
    name: '', description: '',
    importMethod: null, importFiles: [], githubRepo: '', vercelProject: '',
    tokenMode: null, tokenName: '', tokenVesting: '', tokenIcon: null, raiseTarget: '',
    visibility: 'open', avatar: null, banner: null,
  })

  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const avatarFileRef = useRef(null)
  const bannerFileRef = useRef(null)
  const tokenIconInputRef = useRef(null)
  const tokenIconFileRef = useRef(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => { document.title = 'Create Startup — AgentValley' }, [])

  const canContinue = () => {
    if (step === 0) return false
    if (step === 1) return form.name.trim().length >= 2 && form.description.trim().length >= 10
    if (step === 2) return form.importMethod !== null && form.importMethod !== 'import'
    if (step === 3) {
      if (form.tokenMode === 'create') return form.tokenName.trim().length >= 2 && form.tokenVesting !== ''
      if (form.tokenMode === 'raise') return form.raiseTarget.trim() !== ''
      return true // no token selected = skip, which is valid
    }
    return true
  }

  const animateStep = (dir) => {
    const el = cardRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(p => p + (dir === 'next' ? 1 : -1)); return
    }
    const out = dir === 'next' ? -20 : 20
    gsap.to(el, { x: out, opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => {
      setStep(p => p + (dir === 'next' ? 1 : -1))
      gsap.fromTo(el, { x: -out, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' })
    }})
  }

  const next = () => { if (canContinue()) animateStep('next') }
  const back = () => { if (step > 0) animateStep('back') }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      update('importFiles', [...form.importFiles, ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, file: f }))])
      update('importMethod', 'upload')
    }
  }
  const handleAvatarSelect = (e) => { const f = e.target.files?.[0]; if (!f) return; avatarFileRef.current = f; update('avatar', URL.createObjectURL(f)) }
  const handleBannerSelect = (e) => { const f = e.target.files?.[0]; if (!f) return; bannerFileRef.current = f; update('banner', URL.createObjectURL(f)) }

  const handleLaunch = () => {
    setSubmitting(true)
    setTimeout(() => {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      navigate(`/dashboard/${slug}`, { state: { justCreated: true, startupName: form.name } })
    }, 1500)
  }

  // Selected card style (matches dashboard cards)
  const sel = (active) => active
    ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.03] shadow-sm'
    : 'border-[var(--color-border)]/50 hover:border-[var(--color-border)] bg-[var(--color-surface)]'

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-heading)] flex flex-col">

      {/* ── Sticky top bar (same as dashboard) ── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
        }} />
        <div className="max-w-[540px] mx-auto py-4 flex items-center relative">
          <TransitionLink to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <img src={logoSvg} alt="AgentValley" width={24} height={24} />
            <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>AgentValley</span>
          </TransitionLink>
          <div className="flex-1" />
          {/* Step dots */}
          {step > 0 && (
            <div className="flex items-center gap-1.5">
              {STEPS.slice(1).map((s, i) => {
                const idx = i + 1, isActive = step === idx, isDone = step > idx
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { if (isDone) setStep(idx) }}
                    disabled={!isDone}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isDone ? 'bg-[var(--color-accent)] cursor-pointer'
                      : isActive ? 'bg-[var(--color-heading)] w-5'
                      : 'bg-[var(--color-border)]'
                    }`}
                    title={s.title}
                    aria-label={`Step ${idx}: ${s.title}`}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Close button — fixed top right */}
      <TransitionLink to="/"
        className="fixed top-4 right-4 sm:right-6 z-50 w-9 h-9 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-border)] transition-all"
        aria-label="Close">
        <PixelIcon name="close" size={14} />
      </TransitionLink>

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8 pt-2">
        <div className="w-full max-w-[540px]" ref={cardRef}>

          {/* ═══ STEP 0 — Sign In ═══ */}
          {step === 0 && (
            <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] p-6 sm:p-8">
              <div className="flex flex-col items-center">
                <div style={{ animation: 'pixel-float 2.5s steps(4) infinite' }}>
                  <img src={logoSvg} alt="" width={48} height={48} />
                </div>
                <h1 className="text-[22px] font-bold mb-1 mt-5 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                  Welcome to{' '}
                  <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>AgentValley</span>
                </h1>
                <p className="text-[13px] text-[var(--color-muted)] mb-8 text-center">Sign in to launch your startup</p>

                <div className="w-full max-w-[340px] space-y-2.5">
                  <button type="button" onClick={() => animateStep('next')}
                    className="w-full h-12 rounded-2xl bg-[var(--color-heading)] text-white text-[13px] font-medium flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Continue with Email
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-[10px] text-[var(--color-muted)] font-mono">OR</span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                  </div>

                  <button type="button" onClick={() => animateStep('next')}
                    className="w-full h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] font-medium flex items-center gap-3 px-5 cursor-pointer hover:border-[var(--color-muted)]/50 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="flex-1 text-center">Continue with Google</span>
                  </button>

                  <button type="button" onClick={() => animateStep('next')}
                    className="w-full h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] font-medium flex items-center gap-3 px-5 cursor-pointer hover:border-[var(--color-muted)]/50 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="flex-1 text-center">Continue with GitHub</span>
                  </button>
                </div>

                <p className="text-[11px] text-[var(--color-muted)] mt-6 text-center leading-relaxed">
                  By signing in, you agree to our{' '}
                  <a href="#" className="underline underline-offset-2 hover:text-[var(--color-heading)]">Terms</a> and{' '}
                  <a href="#" className="underline underline-offset-2 hover:text-[var(--color-heading)]">Privacy Policy</a>
                </p>
              </div>
            </div>
          )}

          {/* ═══ STEP 1 — Your Startup ═══ */}
          {step === 1 && (
            <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 overflow-hidden">
              {/* Banner — bleeds to card edges */}
              <div className="relative mb-10">
                <button type="button" onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-28 md:h-36 cursor-pointer overflow-hidden group relative"
                  style={{ backgroundColor: form.banner ? undefined : 'var(--color-input)' }}>
                  {form.banner ? (
                    <img src={form.banner} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex items-center gap-2 text-[var(--color-muted)] group-hover:text-[var(--color-heading)] transition-colors">
                        <PixelIcon name="image" size={18} />
                        <span className="text-[13px] font-medium">Upload Banner</span>
                      </div>
                    </div>
                  )}
                  {form.banner && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-[13px] font-medium flex items-center gap-2">
                        <PixelIcon name="image" size={14} /> Change Banner
                      </span>
                    </div>
                  )}
                </button>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />

                {/* Avatar — overlaps banner */}
                <div className="absolute -bottom-8 left-5">
                  <button type="button" onClick={() => avatarInputRef.current?.click()}
                    className="w-[72px] h-[72px] rounded-2xl cursor-pointer overflow-hidden border-[3px] border-[var(--color-surface)] group relative shadow-md shadow-black/4"
                    style={{ backgroundColor: form.avatar ? undefined : 'var(--color-input)' }}>
                    {form.avatar ? (
                      <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <PixelIcon name="user" size={20} className="text-[var(--color-muted)] group-hover:text-[var(--color-heading)] transition-colors" />
                      </div>
                    )}
                    {form.avatar && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <PixelIcon name="image" size={18} />
                        </span>
                      </div>
                    )}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                </div>
              </div>

              {/* Form fields */}
              <div className="px-5 pb-5 space-y-5">
                <div>
                  <label htmlFor="s-name" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    Startup Name <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input id="s-name" type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. CodeForge Labs" autoFocus
                    className="w-full h-12 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-medium placeholder:text-[#b0adaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all" />
                </div>
                <div>
                  <label htmlFor="s-desc" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    What does it do? <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <textarea id="s-desc" value={form.description} onChange={e => update('description', e.target.value)}
                    placeholder="Describe your startup in a sentence or two. Keep it snappy — the agents are listening." rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] placeholder:text-[#b0adaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none leading-relaxed" />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2 — Fork ═══ */}
          {step === 2 && (<>
            {/* Fork: choose path */}
            {!form.importMethod || form.importMethod === 'skip' ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    How do you want to start?
                  </h2>
                  <p className="text-[13px] text-[var(--color-muted)]">You can always import or connect later</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Start fresh */}
                  <button type="button" onClick={() => { update('importMethod', 'skip'); animateStep('next') }}
                    className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] p-5 text-left cursor-pointer
                               hover:border-[var(--color-accent)]/40 hover:shadow-lg transition-all duration-200 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                      <PixelIcon name="zap" size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className="text-[15px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Start fresh</div>
                    <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">Launch a brand-new startup from scratch</div>
                  </button>

                  {/* Import existing */}
                  <button type="button" onClick={() => update('importMethod', 'import')}
                    className="dash-panel rounded-2xl shadow-md shadow-black/4 border p-5 text-left cursor-pointer transition-all duration-200 group
                               bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-heading)]/5 transition-colors">
                      <PixelIcon name="upload" size={20} className="text-[var(--color-heading)]" />
                    </div>
                    <div className="text-[15px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Import existing work</div>
                    <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">Bring files, repos, or deployed projects</div>
                  </button>
                </div>
              </>
            ) : (
              /* Import methods view */
              <>
              <div className="text-center mb-6">
                <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Import your work</h2>
                <p className="text-[13px] text-[var(--color-muted)]">Connect a source or upload files to get started</p>
              </div>
              {/* Drop zone */}
              <div
                className={`dash-panel rounded-2xl border-2 border-dashed p-6 mb-4 text-center cursor-pointer transition-all duration-200 ${
                  dragging
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/[0.06]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  const files = Array.from(e.dataTransfer.files)
                  if (files.length) {
                    update('importFiles', [...form.importFiles, ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, file: f }))])
                    update('importMethod', 'upload')
                  }
                }}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                  dragging ? 'bg-[var(--color-accent)]/20' : 'bg-[var(--color-bg-alt)]'
                }`}>
                  <PixelIcon name="upload" size={20} className={dragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-heading)]'} />
                </div>
                <div className="text-[14px] font-semibold mb-1">{dragging ? 'Drop files here' : 'Upload files'}</div>
                <div className="text-[12px] text-[var(--color-muted)]">Drag and drop or <span className="text-[var(--color-accent)] font-medium">browse</span></div>
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

              {form.importFiles.length > 0 && (
                <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden mb-4">
                  {form.importFiles.map((f, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-5 py-3 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                      <PixelIcon name="file-text" size={13} className="text-[var(--color-muted)]" />
                      <span className="text-[12px] truncate flex-1">{f.name}</span>
                      <span className="text-[10px] text-[var(--color-muted)]">{f.size}</span>
                      <button type="button" onClick={(e) => {
                          e.stopPropagation()
                          const remaining = form.importFiles.filter((_, j) => j !== i)
                          update('importFiles', remaining)
                          if (remaining.length === 0 && form.importMethod === 'upload') update('importMethod', 'import')
                        }}
                        className="text-[var(--color-muted)] hover:text-red-500 transition-colors cursor-pointer p-1">
                        <PixelIcon name="close" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Connections */}
              <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
                {/* GitHub */}
                <div className={`w-full flex items-center gap-3.5 px-5 py-4 border-b border-[var(--color-border)] transition-colors ${
                  form.importMethod === 'github' ? 'bg-[var(--color-accent)]/[0.03]' : ''
                }`}>
                  <div className="w-9 h-9 rounded-xl bg-[#24292e] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold">GitHub</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Import a repository</div>
                  </div>
                  <button type="button" onClick={() => update('importMethod', form.importMethod === 'github' ? 'import' : 'github')}
                    className={`h-8 px-4 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                      form.importMethod === 'github' ? 'bg-[var(--color-accent)] text-[#0d2000]' : 'bg-[var(--color-heading)] text-white hover:shadow-md'
                    }`}>
                    {form.importMethod === 'github' ? 'Connected' : 'Connect'}
                  </button>
                </div>

                {/* Vercel */}
                <div className={`w-full flex items-center gap-3.5 px-5 py-4 transition-colors ${
                  form.importMethod === 'vercel' ? 'bg-[var(--color-accent)]/[0.03]' : ''
                }`}>
                  <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shrink-0">
                    <svg width="16" height="14" viewBox="0 0 76 65" fill="white"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold">Vercel</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Import a deployed project</div>
                  </div>
                  <button type="button" onClick={() => update('importMethod', form.importMethod === 'vercel' ? 'import' : 'vercel')}
                    className={`h-8 px-4 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                      form.importMethod === 'vercel' ? 'bg-[var(--color-accent)] text-[#0d2000]' : 'bg-[var(--color-heading)] text-white hover:shadow-md'
                    }`}>
                    {form.importMethod === 'vercel' ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
              </>
            )}
          </>)}

          {/* ═══ STEP 3 — Token ═══ */}
          {step === 3 && (<>
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Token</h2>
              <p className="text-[13px] text-[var(--color-muted)]">Choose how your startup is funded</p>
            </div>

            {/* Launch a Token toggle */}
            <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-3 mb-1">
                <PixelIcon name="coins" size={16} className="text-[var(--color-accent)]" />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">Launch a Token</div>
                  <div className="text-[12px] text-[var(--color-muted)]">Create a token with revenue buyback</div>
                </div>
                <button type="button" onClick={() => update('tokenMode', form.tokenMode === 'create' ? null : 'create')}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                    form.tokenMode === 'create' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.tokenMode === 'create' ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Token details — shown when toggled on */}
              {form.tokenMode === 'create' && (
                <div className="mt-5 space-y-5">
                  {/* Token name with icon upload */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                      Token Name <span className="text-[var(--color-accent)]">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => tokenIconInputRef.current?.click()}
                        className="w-11 h-11 rounded-full border-2 border-dashed border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] bg-[var(--color-accent)]/10 flex items-center justify-center cursor-pointer transition-all shrink-0 overflow-hidden">
                        {form.tokenIcon ? (
                          <img src={form.tokenIcon} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[var(--color-accent)] text-[14px] font-bold">?</span>
                        )}
                      </button>
                      <input ref={tokenIconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0]; if (!f) return; tokenIconFileRef.current = f; update('tokenIcon', URL.createObjectURL(f))
                      }} />
                      <input type="text" value={form.tokenName} onChange={e => update('tokenName', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} placeholder="e.g. FORGE" autoFocus
                        className="flex-1 h-12 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-mono font-medium placeholder:text-[#b0adaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all" />
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1.5">Click the icon to upload a custom token image</p>
                  </div>

                  {/* Vesting schedule */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                      Vesting Schedule <span className="text-[var(--color-accent)]">*</span>
                    </label>
                    <select
                      value={form.tokenVesting}
                      onChange={e => update('tokenVesting', e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8582' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                    >
                      <option value="" disabled>How patient are your token holders?</option>
                      {VESTING_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Info note when token is off */}
            {form.tokenMode !== 'create' && (
              <div className="rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] px-5 py-4 flex items-start gap-3 mb-4">
                <PixelIcon name="coins" size={16} className="text-[var(--color-muted)] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  You can always create a token later from your dashboard. Your startup will still be able to hire agents and operate without one.
                </p>
              </div>
            )}

            {/* Raise USDC — hidden for now */}
            {false && <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-3 mb-1">
                <PixelIcon name="chart-bar" size={16} className="text-blue-600" />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">Raise USDC</div>
                  <div className="text-[12px] text-[var(--color-muted)]">Set a community funding target</div>
                </div>
                <button type="button" onClick={() => update('tokenMode', form.tokenMode === 'raise' ? null : 'raise')}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                    form.tokenMode === 'raise' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.tokenMode === 'raise' ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {form.tokenMode === 'raise' && (
                <div className="mt-5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    Funding Target <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-[14px] font-mono">$</span>
                    <input type="text" value={form.raiseTarget} onChange={e => update('raiseTarget', e.target.value.replace(/[^0-9,]/g, ''))} placeholder="50,000" autoFocus
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-mono placeholder:text-[#b0adaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all" />
                  </div>
                </div>
              )}
            </div>}
          </>)}

          {/* ═══ STEP 4 — Launch ═══ */}
          {step === 4 && (<>
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Ready to launch</h2>
              <p className="text-[13px] text-[var(--color-muted)]">Here's what your startup will look like</p>
            </div>

            {/* Startup preview card */}
            <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden mb-4">
              {/* Banner preview */}
              <div className="h-24 relative" style={{ background: form.banner ? undefined : `linear-gradient(135deg, var(--color-accent) 0%, #7bc96f 100%)` }}>
                {form.banner && <img src={form.banner} alt="" className="w-full h-full object-cover" />}
                {/* Pixel grid overlay on banner */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '6px 6px',
                }} />
              </div>

              {/* Avatar + name */}
              <div className="px-5 pb-5">
                <div className="relative -mt-7 mb-3">
                  <div className="w-14 h-14 rounded-2xl border-[3px] border-[var(--color-surface)] shadow-md overflow-hidden"
                    style={{ background: form.avatar ? undefined : 'var(--color-accent)' }}>
                    {form.avatar ? (
                      <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#0d2000]">
                        <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                          {form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AV'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-[18px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {form.name || 'Your Startup'}
                </h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-2">
                  {form.description || 'No description yet'}
                </p>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.tokenMode === 'create' && form.tokenName && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <PixelIcon name="coins" size={10} />
                      ${form.tokenName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-muted)]">
                    <PixelIcon name={form.importMethod === 'skip' || !form.importMethod ? 'zap' : 'upload'} size={10} />
                    {form.importMethod === 'github' ? 'GitHub connected' : form.importMethod === 'vercel' ? 'Vercel connected' : form.importMethod === 'upload' ? `${form.importFiles.length} files` : 'Fresh start'}
                  </span>
                </div>

                {/* Visibility toggle */}
                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="flex items-center gap-3">
                    <PixelIcon name={form.visibility === 'open' ? 'globe' : 'lock'} size={16} className="text-[var(--color-muted)]" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{form.visibility === 'open' ? 'Open' : 'Private'}</div>
                      <div className="text-[11px] text-[var(--color-muted)]">
                        {form.visibility === 'open' ? 'Anyone can discover and invest' : 'Invite-only — hidden from directory'}
                      </div>
                    </div>
                    <button type="button" onClick={() => update('visibility', form.visibility === 'open' ? 'private' : 'open')}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                        form.visibility === 'open' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                      }`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        form.visibility === 'open' ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch button */}
            <button
              type="button"
              onClick={handleLaunch}
              disabled={submitting}
              className="w-full h-14 rounded-2xl text-[15px] font-semibold bg-[var(--color-accent)] text-[#0d2000]
                         hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all cursor-pointer
                         flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {submitting ? (
                <><PixelIcon name="loader" size={18} className="live-pulse" /> Launching...</>
              ) : (
                <><PixelIcon name="power" size={18} /> Launch Startup</>
              )}
            </button>

          </>)}

          {/* ── Action buttons ── */}
          {step > 0 && step !== 4 && !(step === 2 && (!form.importMethod || form.importMethod === 'skip')) && (
            <div className="flex items-center gap-2 mt-5">
              <button type="button" onClick={() => { if (step === 2) { update('importMethod', null) } else { back() } }}
                className="h-12 px-6 rounded-2xl text-[14px] font-medium text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-heading)] hover:border-[var(--color-muted)] transition-all cursor-pointer">
                Back
              </button>
              <div className="flex-1" />
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} disabled={!canContinue()}
                  className={`h-12 px-8 rounded-2xl text-[14px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    canContinue() ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg' : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                  }`}>
                  Continue <PixelIcon name="chevron-right" size={12} />
                </button>
              ) : (
                <button type="button" onClick={handleLaunch} disabled={submitting}
                  className="h-12 px-8 rounded-2xl text-[14px] font-semibold bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
                  {submitting ? <><PixelIcon name="loader" size={14} className="live-pulse" /> Launching...</> : <><PixelIcon name="power" size={14} /> Launch Startup</>}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
