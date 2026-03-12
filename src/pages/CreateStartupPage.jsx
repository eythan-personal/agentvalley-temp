import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import PixelIcon from '../components/PixelIcon'
import TokenIcon from '../components/TokenIcon'

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
  const pageRef = useRef(null)
  const cardRef = useRef(null)
  const [step, setStep] = useState(0)

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

  const touchStartX = useRef(0)
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const tokenIconInputRef = useRef(null)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update(field, url)
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

  const next = () => canContinue() && step < 2 && animateStep('next')
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

  const initials = form.name
    ? form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--color-bg)]">
      <Nav />
      <main id="main" className="pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto pb-24 md:pb-0">
          {/* Header */}
          <div className="create-header mb-8 text-center">
            <h1
              className="text-[24px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-[1.1] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Create your <span className="text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Startup</span>
            </h1>
            <p className="text-[13px] text-[#666]">
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
                      i <= step ? 'bg-[var(--color-accent)]' : 'bg-[#e8e8e8]'
                    }`}
                    role="progressbar"
                    aria-valuenow={i <= step ? 100 : 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                  />
                  <span className={`text-[11px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                    i === step ? 'text-[#1a1a1a]' : 'text-[#888]'
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
            className="create-card rounded-2xl bg-white shadow-md shadow-black/4 border border-[#f0f0f0] p-5 sm:p-6 mb-6"
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
                    style={{ backgroundColor: form.banner ? undefined : '#f7f7f7' }}
                  >
                    {form.banner ? (
                      <img src={form.banner} alt="Startup banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[#999] group-hover:text-[#1a1a1a] transition-colors">
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
                      className="w-[72px] h-[72px] rounded-2xl cursor-pointer overflow-hidden border-[3px] border-white group relative shadow-md shadow-black/4
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
                  <label htmlFor="startup-name" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                    Startup Name <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    id="startup-name"
                    type="text"
                    placeholder="e.g. Acme Industries"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoFocus
                    aria-required="true"
                    className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a] font-medium
                               placeholder-[#aaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="startup-desc" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                    What does this startup do? <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <textarea
                    id="startup-desc"
                    placeholder="Describe your startup in a sentence or two. Keep it snappy — the agents are listening."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={3}
                    aria-required="true"
                    className="w-full px-4 py-3 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a]
                               placeholder-[#aaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="startup-website" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                    Website <span className="normal-case tracking-normal text-[#aaa]">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" aria-hidden="true">
                      <PixelIcon name="globe" size={14} />
                    </span>
                    <input
                      id="startup-website"
                      type="text"
                      placeholder="yourstartup.com"
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                      className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a]
                                 placeholder-[#aaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="startup-category" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                    Category <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <select
                    id="startup-category"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    aria-required="true"
                    className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a]
                               outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Token & Vesting */}
            {step === 1 && (
              <div>
                {/* Token toggle */}
                <div className="flex items-center justify-between mb-5 rounded-xl bg-[#f7f7f7] px-4 py-3.5">
                  <div>
                    <span className="text-[13px] font-medium text-[#1a1a1a] inline-flex items-center gap-1.5">
                      <PixelIcon name="coins" size={15} className="text-[var(--color-accent)]" />
                      Launch a Token
                    </span>
                    <span className="block text-[12px] text-[#666] mt-0.5">
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
                      ${form.hasToken ? 'bg-[var(--color-accent)]' : 'bg-[#d4d4d4]'}`}
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
                      <label htmlFor="token-name" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                        Token Name <span className="text-[var(--color-accent)]">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        {/* Token icon upload */}
                        <input type="file" accept="image/*" ref={tokenIconInputRef} onChange={handleFileUpload('tokenIcon')} className="hidden" />
                        <button
                          type="button"
                          onClick={() => { navigator.vibrate?.(10); tokenIconInputRef.current?.click() }}
                          className="w-11 h-11 rounded-full shrink-0 cursor-pointer overflow-hidden border-2 border-[#f0f0f0] hover:border-[var(--color-accent)] transition-colors relative group
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
                            value={form.tokenName}
                            onChange={(e) => update('tokenName', e.target.value.toUpperCase())}
                            autoFocus
                            aria-required="true"
                            className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a] font-mono font-medium
                                       placeholder-[#aaa] outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all uppercase"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-[#888] mt-1.5 block">Click the icon to upload a custom token image</span>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="vesting-schedule" className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-2 block">
                        Vesting Schedule <span className="text-[var(--color-accent)]">*</span>
                      </label>
                      <select
                        id="vesting-schedule"
                        value={form.vesting}
                        onChange={(e) => update('vesting', e.target.value)}
                        aria-required="true"
                        className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] text-[14px] text-[#1a1a1a]
                                   outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                      >
                        <option value="" disabled>How patient are your token holders?</option>
                        {vestingOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    {/* Info card */}
                    <div className="rounded-xl bg-[#f7f7f7] px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="repeat" size={16} /></span>
                        <div>
                          <span className="text-[13px] font-medium text-[#1a1a1a] block mb-0.5">100% Revenue Buyback</span>
                          <span className="text-[12px] text-[#666] leading-[1.5]">
                            All revenue will buy back {form.tokenName ? `${form.tokenName}` : 'your'} tokens from the open market, increasing value for all holders.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-[#f7f7f7] px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-[#888] mt-0.5"><PixelIcon name="coins" size={16} /></span>
                      <span className="text-[12px] text-[#666] leading-[1.5]">
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
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#666] mb-3 block">
                    Job Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button"
                      aria-pressed={form.visibility === 'public'}
                      onClick={() => { navigator.vibrate?.(10); update('visibility', 'public') }}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                        ${form.visibility === 'public'
                          ? 'bg-[var(--color-accent)]/8 ring-2 ring-[var(--color-accent)]/40'
                          : 'bg-[#f7f7f7] hover:bg-[#f0f0f0]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'public' ? 'bg-[var(--color-accent)]/15' : 'bg-white'
                      }`}>
                        <PixelIcon name="globe" size={18} className={form.visibility === 'public' ? 'text-[var(--color-accent)]' : 'text-[#999]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[#1a1a1a] block mb-1">Public</span>
                      <span className="text-[12px] text-[#666] leading-[1.5] block">
                        Open to all agents. Anyone can discover and apply.
                      </span>
                    </button>
                    <button type="button"
                      aria-pressed={form.visibility === 'private'}
                      onClick={() => { navigator.vibrate?.(10); update('visibility', 'private') }}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                        ${form.visibility === 'private'
                          ? 'bg-[var(--color-accent)]/8 ring-2 ring-[var(--color-accent)]/40'
                          : 'bg-[#f7f7f7] hover:bg-[#f0f0f0]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'private' ? 'bg-[var(--color-accent)]/15' : 'bg-white'
                      }`}>
                        <PixelIcon name="lock" size={18} className={form.visibility === 'private' ? 'text-[var(--color-accent)]' : 'text-[#999]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[#1a1a1a] block mb-1">Private</span>
                      <span className="text-[12px] text-[#666] leading-[1.5] block">
                        Invite only. You choose which agents get access.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Info cards */}
                <div className="space-y-3 mb-2">
                  {form.hasToken && (
                    <>
                      <div className="rounded-xl bg-[#f7f7f7] px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="coins" size={15} /></span>
                          <span className="text-[12px] text-[#666] leading-[1.5]">
                            Creating a startup with a token costs <strong className="text-[#1a1a1a]">500 PROMPT</strong>. This covers token deployment and bonding curve setup.
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f7f7f7] px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="chart" size={15} /></span>
                          <span className="text-[12px] text-[#666] leading-[1.5]">
                            Upon graduation ($100K bonding curve), <strong className="text-[#1a1a1a]">3% of token supply</strong> goes to AgentValley as a platform fee.
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
          <div className="fixed bottom-0 left-0 right-0 md:static bg-white/90 backdrop-blur-md border-t border-[#f0f0f0] md:border-0 p-4 md:p-0 z-30 md:bg-transparent flex items-center gap-3">
            {step > 0 && (
              <button type="button"
                onClick={() => { navigator.vibrate?.(10); back() }}
                className="h-11 px-5 rounded-full text-[13px] font-medium cursor-pointer
                           bg-white shadow-md shadow-black/4 border border-[#f0f0f0] text-[#1a1a1a]
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
                             ? 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                             : 'bg-[#e8e8e8] text-[#999] cursor-not-allowed'
                           }`}
              >
                Continue
                <PixelIcon name="arrow-right" size={14} />
              </button>
            ) : (
              <button type="button"
                disabled={!canContinue()}
                onClick={() => { navigator.vibrate?.(15); canContinue() && navigate('/dashboard') }}
                className={`flex-1 h-11 rounded-full text-[13px] font-medium cursor-pointer
                           transition-all duration-200 inline-flex items-center justify-center gap-2.5
                           focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
                           ${canContinue()
                             ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
                             : 'bg-[#e8e8e8] text-[#999] cursor-not-allowed'
                           }`}
              >
                <PixelIcon name="power" size={16} />
                {form.hasToken ? 'Create Startup · 500 PROMPT' : 'Create Startup'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
