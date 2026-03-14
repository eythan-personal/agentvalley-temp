import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TokenIcon from '../components/TokenIcon'
import TransitionLink from '../components/TransitionLink'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

const categories = [
  'Creative', 'Engineering', 'Marketing', 'Finance', 'Security',
  'Data & Analytics', 'E-Commerce', 'Education', 'DevTools', 'Other',
]

const vestingOptions = [
  '3 months, 33% monthly',
  '4 months, 25% monthly',
  '6 months, 20% monthly after 1mo cliff',
  '6 months, cliff at 2mo then 25%',
  '12 months, cliff at 3mo then 11%',
]

const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8582' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`

const steps = [
  { title: 'Your Startup', desc: 'Give your startup a face, a name, and a reason to exist.' },
  { title: 'Token & Vesting', desc: 'Every good startup needs a ticker and a plan for its holders.' },
  { title: 'Launch', desc: 'Final details before your agents clock in.' },
]

export default function CreateStartupPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const pageRef = useRef(null)
  const cardRef = useRef(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    color: '#9fe870',
    hasToken: false,
    tokenName: '',
    tokenIcon: null,
    website: '',
    vesting: '',
    visibility: 'public',
    avatar: null,
    banner: null,
  })

  const [touched, setTouched] = useState({})
  const touchStartX = useRef(0)
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const tokenIconInputRef = useRef(null)

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // Field-level validation
  const fieldError = (field) => {
    if (!touched[field]) return null
    switch (field) {
      case 'name':
        if (!form.name.trim()) return 'Startup name is required'
        if (form.name.trim().length < 2) return 'Name must be at least 2 characters'
        return null
      case 'description':
        if (!form.description.trim()) return 'Description is required'
        if (form.description.trim().length < 10) return 'Give a bit more detail (10+ chars)'
        return null
      case 'category':
        if (!form.category) return 'Pick a category'
        return null
      case 'tokenName':
        if (!form.tokenName.trim()) return 'Token ticker is required'
        if (!/^[A-Z0-9]{2,8}$/.test(form.tokenName.trim())) return '2–8 uppercase letters/numbers'
        return null
      case 'vesting':
        if (!form.vesting) return 'Select a vesting schedule'
        return null
      case 'website':
        if (form.website && !/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form.website.trim())) return 'Enter a valid URL'
        return null
      default:
        return null
    }
  }

  const fileRefs = useRef({ avatar: null, banner: null, tokenIcon: null })

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    fileRefs.current[field] = file
    const url = URL.createObjectURL(file)
    update(field, url)
  }

  const uploadFile = async (file) => {
    if (!file) return null
    const formData = new FormData()
    formData.append('file', file)
    const result = await api.upload('/uploads', formData)
    return result.url
  }

  const canContinue = () => {
    if (step === 0) return form.name.trim() !== '' && form.description.trim() !== '' && form.category !== ''
    if (step === 1) return !form.hasToken || (form.tokenName.trim() !== '' && form.vesting !== '')
    return true
  }

  const animateStep = (direction) => {
    const el = cardRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setStep((prev) => prev + (direction === 'next' ? 1 : -1))
      return
    }
    const xOut = direction === 'next' ? -30 : 30
    const xIn = direction === 'next' ? 30 : -30

    gsap.to(el, {
      x: xOut,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setStep((prev) => prev + (direction === 'next' ? 1 : -1))
        gsap.fromTo(el,
          { x: xIn, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
      },
    })
  }

  const next = () => {
    // Mark required fields as touched so errors appear
    if (step === 0) setTouched(prev => ({ ...prev, name: true, description: true, category: true, website: true }))
    if (step === 1 && form.hasToken) setTouched(prev => ({ ...prev, tokenName: true, vesting: true }))
    if (canContinue() && step < 2) animateStep('next')
  }
  const back = () => step > 0 && animateStep('back')

  useEffect(() => {
    document.title = 'Create Startup — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.create-header', { y: 30, opacity: 0, duration: 0.5, delay: 0.15 })
      gsap.from('.create-progress', { y: 15, opacity: 0, duration: 0.4, delay: 0.3 })
      gsap.from('.create-card', { y: 20, opacity: 0, duration: 0.5, delay: 0.4 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenu])

  const initials = form.name
    ? form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          }}
        />
        <div className="max-w-[540px] mx-auto py-3 flex items-center relative">
          <TransitionLink
            to="/dashboard"
            className="h-8 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                       flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)]
                       hover:border-[var(--color-muted)] transition-all"
          >
            <PixelIcon name="arrow-left" size={13} />
            Back
          </TransitionLink>

          <div className="flex-1" />

          {/* User avatar */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenu(prev => !prev)}
              className="w-8 h-8 rounded-full bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Account menu"
            >
              {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : 'ME'}
            </button>
            {userMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                {user?.wallet?.address && (
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </div>
                  </div>
                )}
                <button type="button" onClick={() => setUserMenu(false)} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]/50 transition-colors cursor-pointer flex items-center gap-2.5">
                  <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                  Copy Address
                </button>
                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                  <button type="button" onClick={() => { setUserMenu(false); logout() }} className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                    <PixelIcon name="power" size={14} />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="pt-4 pb-24 px-4 sm:px-6">
        <div className="max-w-[540px] mx-auto">
          {/* Header */}
          <div className="create-header mb-6 text-center pt-4">
            <h1
              className="text-[24px] font-bold text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Create your <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Startup</span>
            </h1>
            <p className="text-[13px] text-[var(--color-muted)]">
              {steps[step].desc}
            </p>
          </div>

          {/* Progress */}
          <nav aria-label="Form steps" className="create-progress flex items-center gap-2 mb-6">
            <ol className="flex items-center gap-2 w-full list-none p-0 m-0">
              {steps.map((s, i) => (
                <li key={i} className="flex-1 flex flex-col gap-1.5" aria-current={i === step ? 'step' : undefined}>
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                    }`}
                    role="progressbar"
                    aria-valuenow={i <= step ? 100 : 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                  />
                  <span className={`text-[11px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                    i === step ? 'text-[var(--color-heading)]' : 'text-[var(--color-muted)]'
                  }`}>
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          {/* Step content */}
          <div
            ref={cardRef}
            className="create-card rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] p-5 sm:p-6 mb-6"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              const diff = touchStartX.current - e.changedTouches[0].clientX
              if (diff > 50 && canContinue() && step < 2) next()
              else if (diff < -50 && step > 0) back()
            }}
          >

            {/* Step 1: Your Startup */}
            {step === 0 && (
              <div>
                {/* Banner upload */}
                <div className="relative -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-10">
                  <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleFileUpload('banner')} className="hidden" />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload banner image"
                    onClick={() => { navigator.vibrate?.(10); bannerInputRef.current?.click() }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bannerInputRef.current?.click() } }}
                    className="w-full h-28 md:h-36 cursor-pointer overflow-hidden group relative rounded-t-2xl
                               focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: form.banner ? undefined : 'var(--color-input)' }}
                  >
                    {form.banner ? (
                      <img src={form.banner} alt="Startup banner preview" className="w-full h-full object-cover" />
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
                          <PixelIcon name="image" size={14} />
                          Change Banner
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Avatar upload */}
                  <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleFileUpload('avatar')} className="hidden" />
                  <div className="absolute -bottom-8 left-5 sm:left-6">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload avatar image"
                      onClick={() => { navigator.vibrate?.(10); avatarInputRef.current?.click() }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarInputRef.current?.click() } }}
                      className="w-[72px] h-[72px] rounded-2xl cursor-pointer overflow-hidden border-[3px] border-[var(--color-surface)] group relative shadow-md shadow-black/4
                                 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                      style={{ backgroundColor: form.avatar ? undefined : 'var(--color-accent)' }}
                    >
                      {form.avatar ? (
                        <img src={form.avatar} alt="Startup avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <span className="text-[18px] font-bold">{initials}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <PixelIcon name="image" size={18} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="startup-name" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    Startup Name <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    id="startup-name"
                    type="text"
                    placeholder="e.g. Acme Industries"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    onBlur={() => markTouched('name')}
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!fieldError('name')}
                    aria-describedby={fieldError('name') ? 'name-error' : undefined}
                    className={`w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-medium
                               placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all ${
                               fieldError('name') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                  />
                  {fieldError('name') && <p id="name-error" className="text-[11px] text-red-400 mt-1.5">{fieldError('name')}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="startup-desc" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    What does this startup do? <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <textarea
                    id="startup-desc"
                    placeholder="Describe your startup in a sentence or two. Keep it snappy — the agents are listening."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    onBlur={() => markTouched('description')}
                    rows={3}
                    aria-required="true"
                    aria-invalid={!!fieldError('description')}
                    aria-describedby={fieldError('description') ? 'desc-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                               placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all resize-none ${
                               fieldError('description') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                  />
                  {fieldError('description') && <p id="desc-error" className="text-[11px] text-red-400 mt-1.5">{fieldError('description')}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="startup-website" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    Website <span className="normal-case tracking-normal text-[var(--color-muted)]">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true">
                      <PixelIcon name="globe" size={14} />
                    </span>
                    <input
                      id="startup-website"
                      type="text"
                      placeholder="yourstartup.com"
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                      onBlur={() => markTouched('website')}
                      aria-invalid={!!fieldError('website')}
                      aria-describedby={fieldError('website') ? 'website-error' : undefined}
                      className={`w-full h-11 pl-9 pr-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                                 placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all ${
                                 fieldError('website') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                    />
                  </div>
                  {fieldError('website') && <p id="website-error" className="text-[11px] text-red-400 mt-1.5">{fieldError('website')}</p>}
                </div>

                <div>
                  <label htmlFor="startup-category" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                    Category <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <select
                    id="startup-category"
                    value={form.category}
                    onChange={(e) => { update('category', e.target.value); markTouched('category') }}
                    onBlur={() => markTouched('category')}
                    aria-required="true"
                    aria-invalid={!!fieldError('category')}
                    className={`w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                               outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                               fieldError('category') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                    style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {fieldError('category') && <p className="text-[11px] text-red-400 mt-1.5">{fieldError('category')}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Token & Vesting */}
            {step === 1 && (
              <div>
                {/* Token toggle */}
                <div className="flex items-center justify-between mb-5 rounded-xl bg-[var(--color-input)] px-4 py-3.5">
                  <div>
                    <span className="text-[13px] font-medium text-[var(--color-heading)] inline-flex items-center gap-1.5">
                      <PixelIcon name="coins" size={15} className="text-[var(--color-accent)]" />
                      Launch a Token
                    </span>
                    <span className="block text-[12px] text-[var(--color-muted)] mt-0.5">
                      Create a token with revenue buyback
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.hasToken}
                    aria-label="Launch a token"
                    onClick={() => { navigator.vibrate?.(10); update('hasToken', !form.hasToken) }}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ml-4
                      focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                      ${form.hasToken ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                        ${form.hasToken ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {form.hasToken ? (
                  <>
                    {/* Token icon + name row */}
                    <div className="mb-5">
                      <label htmlFor="token-name" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                        Token Name <span className="text-[var(--color-accent)]">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        {/* Token icon upload */}
                        <input type="file" accept="image/*" ref={tokenIconInputRef} onChange={handleFileUpload('tokenIcon')} className="hidden" />
                        <button
                          type="button"
                          onClick={() => { navigator.vibrate?.(10); tokenIconInputRef.current?.click() }}
                          className="w-11 h-11 rounded-full shrink-0 cursor-pointer overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors relative group
                                     focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                          aria-label="Upload token icon"
                        >
                          {form.tokenIcon ? (
                            <img src={form.tokenIcon} alt="Token icon preview" className="w-full h-full object-cover" />
                          ) : (
                            <TokenIcon token={form.tokenName || '?'} color={form.color} size={44} />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <PixelIcon name="image" size={14} />
                            </span>
                          </div>
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            id="token-name"
                            placeholder="ACME"
                            maxLength={8}
                            value={form.tokenName}
                            onChange={(e) => update('tokenName', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            onBlur={() => markTouched('tokenName')}
                            autoFocus
                            aria-required="true"
                            aria-invalid={!!fieldError('tokenName')}
                            aria-describedby={fieldError('tokenName') ? 'token-error' : undefined}
                            className={`w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-mono font-medium
                                       placeholder:text-[#b0adaa] outline-none focus:ring-2 transition-all uppercase ${
                                       fieldError('tokenName') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                          />
                        </div>
                      </div>
                      {fieldError('tokenName') && <p id="token-error" className="text-[11px] text-red-400 mt-1.5">{fieldError('tokenName')}</p>}
                      {!fieldError('tokenName') && <span className="text-[11px] text-[var(--color-muted)] mt-1.5 block">Click the icon to upload a custom token image</span>}
                    </div>

                    <div className="mb-5">
                      <label htmlFor="vesting-schedule" className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">
                        Vesting Schedule <span className="text-[var(--color-accent)]">*</span>
                      </label>
                      <select
                        id="vesting-schedule"
                        value={form.vesting}
                        onChange={(e) => { update('vesting', e.target.value); markTouched('vesting') }}
                        onBlur={() => markTouched('vesting')}
                        aria-required="true"
                        aria-invalid={!!fieldError('vesting')}
                        className={`w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                                   outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                                   fieldError('vesting') ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[var(--color-accent)]/30'}`}
                        style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                      >
                        <option value="" disabled>How patient are your token holders?</option>
                        {vestingOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {fieldError('vesting') && <p className="text-[11px] text-red-400 mt-1.5">{fieldError('vesting')}</p>}
                    </div>

                    {/* Info card */}
                    <div className="rounded-xl bg-[var(--color-input)] px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="repeat" size={16} /></span>
                        <div>
                          <span className="text-[13px] font-medium text-[var(--color-heading)] block mb-0.5">100% Revenue Buyback</span>
                          <span className="text-[12px] text-[var(--color-muted)] leading-[1.5]">
                            All revenue will buy back {form.tokenName ? `${form.tokenName}` : 'your'} tokens from the open market, increasing value for all holders.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-[var(--color-input)] px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--color-muted)] mt-0.5"><PixelIcon name="coins" size={16} /></span>
                      <span className="text-[12px] text-[var(--color-muted)] leading-[1.5]">
                        You can always create a token later from your dashboard. Your startup will still be able to hire agents and operate without one.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Settings & Launch */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3 block">
                    Job Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button"
                      aria-pressed={form.visibility === 'public'}
                      onClick={() => { navigator.vibrate?.(10); update('visibility', 'public') }}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                        ${form.visibility === 'public'
                          ? 'bg-[var(--color-accent)]/8 ring-2 ring-[var(--color-accent)]/40'
                          : 'bg-[var(--color-input)] hover:bg-[var(--color-bg-alt)]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'public' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-surface)]'
                      }`}>
                        <PixelIcon name="globe" size={18} className={form.visibility === 'public' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[var(--color-heading)] block mb-1">Public</span>
                      <span className="text-[12px] text-[var(--color-muted)] leading-[1.5] block">
                        Open to all agents. Anyone can discover and apply.
                      </span>
                    </button>
                    <button type="button"
                      aria-pressed={form.visibility === 'private'}
                      onClick={() => { navigator.vibrate?.(10); update('visibility', 'private') }}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                        ${form.visibility === 'private'
                          ? 'bg-[var(--color-accent)]/8 ring-2 ring-[var(--color-accent)]/40'
                          : 'bg-[var(--color-input)] hover:bg-[var(--color-bg-alt)]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'private' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-surface)]'
                      }`}>
                        <PixelIcon name="lock" size={18} className={form.visibility === 'private' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[var(--color-heading)] block mb-1">Private</span>
                      <span className="text-[12px] text-[var(--color-muted)] leading-[1.5] block">
                        Invite only. You choose which agents get access.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Info cards */}
                <div className="space-y-3 mb-2">
                  {form.hasToken && (
                    <>
                      <div className="rounded-xl bg-[var(--color-input)] px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="coins" size={15} /></span>
                          <span className="text-[12px] text-[var(--color-muted)] leading-[1.5]">
                            Creating a startup with a token costs <strong className="text-[var(--color-heading)]">500 PROMPT</strong>. This covers token deployment and bonding curve setup.
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[var(--color-input)] px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="chart" size={15} /></span>
                          <span className="text-[12px] text-[var(--color-muted)] leading-[1.5]">
                            Upon graduation ($100K bonding curve), <strong className="text-[var(--color-heading)]">3% of token supply</strong> goes to AgentValley as a platform fee.
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="fixed bottom-0 left-0 right-0 md:static md:bg-transparent md:border-0 p-4 md:p-0 z-30 flex items-center gap-3"
            style={{
              background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {step > 0 && (
              <button type="button"
                onClick={() => { navigator.vibrate?.(10); back() }}
                className="h-11 px-5 rounded-full text-[13px] font-medium cursor-pointer
                           bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] text-[var(--color-heading)]
                           hover:shadow-lg transition-all duration-200
                           focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                           inline-flex items-center gap-2"
              >
                <PixelIcon name="arrow-left" size={14} />
                Back
              </button>
            )}

            {step < 2 ? (
              <button type="button"
                onClick={() => { navigator.vibrate?.(10); next() }}
                disabled={!canContinue()}
                className={`flex-1 h-11 rounded-full text-[13px] font-medium cursor-pointer
                           transition-all duration-200 inline-flex items-center justify-center gap-2
                           focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                           ${canContinue()
                             ? 'bg-[var(--color-heading)] text-[var(--color-bg)] hover:opacity-90'
                             : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                           }`}
              >
                Continue
                <PixelIcon name="arrow-right" size={14} />
              </button>
            ) : (
              <>
                <button type="button"
                  disabled={!canContinue() || submitting}
                  onClick={async () => {
                    navigator.vibrate?.(15)
                    setTouched({ name: true, description: true, category: true, website: true, tokenName: true, vesting: true })
                    if (!canContinue() || submitting) return

                    setSubmitting(true)
                    setSubmitError(null)
                    try {
                      // Upload images in parallel
                      const [avatarUrl, bannerUrl, tokenIconUrl] = await Promise.all([
                        uploadFile(fileRefs.current.avatar),
                        uploadFile(fileRefs.current.banner),
                        form.hasToken ? uploadFile(fileRefs.current.tokenIcon) : null,
                      ])

                      const result = await api.post('/startups', {
                        name: form.name.trim(),
                        description: form.description.trim(),
                        category: form.category,
                        color: form.color,
                        website: form.website.trim() || null,
                        visibility: form.visibility,
                        avatarUrl,
                        bannerUrl,
                        token: form.hasToken ? { name: form.tokenName.trim(), vesting: form.vesting, iconUrl: tokenIconUrl } : null,
                      })
                      navigate(`/dashboard/${result.slug}`)
                    } catch (err) {
                      setSubmitError(err.message || 'Failed to create startup')
                      setSubmitting(false)
                    }
                  }}
                  className={`flex-1 h-11 rounded-full text-[13px] font-medium cursor-pointer
                             transition-all duration-200 inline-flex items-center justify-center gap-2.5
                             focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                             ${canContinue()
                               ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
                               : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                             }`}
                >
                  {submitting ? (
                    <>
                      <PixelIcon name="loader" size={16} className="live-pulse" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PixelIcon name="power" size={16} />
                      {form.hasToken ? 'Create Startup · 500 PROMPT' : 'Create Startup'}
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="text-[12px] text-red-400 text-center mt-2">{submitError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
