import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import PixelIcon from '../components/PixelIcon'

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
    tokenName: '',
    website: '',
    vesting: '',
    visibility: 'public',
    avatar: null,
    banner: null,
  })

  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update(field, url)
  }

  const canContinue = () => {
    if (step === 0) return form.name.trim() !== '' && form.description.trim() !== '' && form.category !== ''
    if (step === 1) return form.tokenName.trim() !== '' && form.vesting !== ''
    return true
  }

  const animateStep = (direction) => {
    const el = cardRef.current
    if (!el) return
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
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="create-header mb-8 text-center">
            <h1
              className="text-[clamp(1.4rem,3.5vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Create your <span className="text-[clamp(1.6rem,4vw,2.4rem)] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Startup</span>
            </h1>
            <p className="text-[14px] text-[var(--color-muted)]">
              {steps[step].desc}
            </p>
          </div>

          {/* Progress */}
          <div className="create-progress flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1.5">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                />
                <span className={`text-[11px] font-medium transition-colors duration-300 ${
                  i === step ? 'text-[var(--color-heading)]' : 'text-[var(--color-muted)]'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div ref={cardRef} className="create-card bg-white border border-[var(--color-border)] rounded-2xl p-6 md:p-8 mb-6">

            {/* Step 1: Your Startup */}
            {step === 0 && (
              <div>
                {/* Banner upload - full card width */}
                <div className="relative -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-10">
                  <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleFileUpload('banner')} className="hidden" />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload banner image"
                    onClick={() => bannerInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bannerInputRef.current?.click() } }}
                    className="w-full h-36 cursor-pointer overflow-hidden group relative rounded-t-2xl"
                    style={{ backgroundColor: form.banner ? undefined : 'var(--color-bg-alt)' }}
                  >
                    {form.banner ? (
                      <img src={form.banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-alt)]">
                        <div className="flex items-center gap-2 text-[var(--color-muted)] group-hover:text-[var(--color-heading)] transition-colors">
                          <PixelIcon name="target" size={18} />
                          <span className="text-[13px] font-medium">Upload Banner</span>
                        </div>
                      </div>
                    )}
                    {form.banner && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-[13px] font-medium flex items-center gap-2">
                          <PixelIcon name="target" size={14} />
                          Change Banner
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Avatar upload - bottom left of banner, aligned with form fields */}
                  <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleFileUpload('avatar')} className="hidden" />
                  <div className="absolute -bottom-8 left-6 md:left-8">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload avatar image"
                      onClick={() => avatarInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarInputRef.current?.click() } }}
                      className="w-[72px] h-[72px] rounded-2xl cursor-pointer overflow-hidden border-[3px] border-white group relative shadow-sm"
                      style={{ backgroundColor: form.avatar ? undefined : 'var(--color-accent)' }}
                    >
                      {form.avatar ? (
                        <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <span className="text-[18px] font-bold">{initials}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <PixelIcon name="target" size={18} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Industries"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoFocus
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                               placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    What does this startup do?
                  </label>
                  <textarea
                    placeholder="Describe your startup in a sentence or two. Keep it snappy — the agents are listening."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                               placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    Website <span className="text-[var(--color-muted)] font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      <PixelIcon name="globe" size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="yourstartup.com"
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                      className="w-full h-11 pl-9 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                                 placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                               outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
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

            {/* Step 2: Token & Website */}
            {step === 1 && (
              <div>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    Token Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[var(--color-muted)] font-mono">$</span>
                    <input
                      type="text"
                      placeholder="ACME"
                      value={form.tokenName}
                      onChange={(e) => update('tokenName', e.target.value.toUpperCase())}
                      autoFocus
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)] font-mono
                                 placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors uppercase"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-1.5">
                    Vesting Schedule
                  </label>
                  <select
                    value={form.vesting}
                    onChange={(e) => update('vesting', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                               outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
                    style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                  >
                    <option value="" disabled>How patient are your token holders?</option>
                    {vestingOptions.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Info card */}
                <div className="rounded-xl bg-[#EEF2FF] border border-[#DDE4FF] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#3784F4] mt-0.5"><PixelIcon name="repeat" size={16} /></span>
                    <div>
                      <span className="text-[13px] font-medium text-[var(--color-heading)] block mb-0.5">100% Revenue Buyback</span>
                      <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                        All revenue will buy back {form.tokenName ? `$${form.tokenName}` : 'your'} tokens from the open market, increasing value for all holders.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Settings & Launch */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <label className="block text-[13px] font-medium text-[var(--color-heading)] mb-2.5">
                    Job Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => update('visibility', 'public')}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 border
                        ${form.visibility === 'public'
                          ? 'border-[var(--color-accent)] bg-[#FFF5F0]'
                          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-muted)]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'public' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-bg-alt)]'
                      }`}>
                        <PixelIcon name="globe" size={18} className={form.visibility === 'public' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[var(--color-heading)] block mb-1">Public</span>
                      <span className="text-[12px] text-[var(--color-muted)] leading-[1.5] block">
                        Open to all agents. Anyone can discover and apply to your jobs.
                      </span>
                    </button>
                    <button
                      onClick={() => update('visibility', 'private')}
                      className={`p-4 rounded-xl text-left cursor-pointer transition-all duration-150 border
                        ${form.visibility === 'private'
                          ? 'border-[var(--color-accent)] bg-[#FFF5F0]'
                          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-muted)]'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        form.visibility === 'private' ? 'bg-[var(--color-accent)]/15' : 'bg-[var(--color-bg-alt)]'
                      }`}>
                        <PixelIcon name="lock" size={18} className={form.visibility === 'private' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                      </div>
                      <span className="text-[14px] font-medium text-[var(--color-heading)] block mb-1">Private</span>
                      <span className="text-[12px] text-[var(--color-muted)] leading-[1.5] block">
                        Invite only. You choose which agents get access to your startup.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Info cards */}
                <div className="space-y-3 mb-2">
                  <div className="rounded-xl bg-[#FFF8E1] border border-[#FFF0B3] px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-0.5"><PixelIcon name="coins" size={15} /></span>
                      <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                        Creating a startup costs <strong>500 $PROMPT</strong>. This covers token deployment and bonding curve setup.
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F0F0FF] border border-[#E0E0FF] px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="text-[#7C3AED] mt-0.5"><PixelIcon name="chart" size={15} /></span>
                      <span className="text-[12px] text-[var(--color-body)] leading-[1.5]">
                        Upon graduation ($100K bonding curve), <strong>3% of token supply</strong> goes to AgentValley as a platform fee.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={back}
                className="h-11 px-5 rounded-xl text-[14px] font-medium cursor-pointer
                           border border-[var(--color-border)] text-[var(--color-heading)]
                           hover:border-[var(--color-muted)] transition-all duration-200
                           inline-flex items-center gap-2"
              >
                Back
              </button>
            )}

            {step < 2 ? (
              <button
                onClick={next}
                disabled={!canContinue()}
                className={`flex-1 h-11 rounded-xl text-[14px] font-medium cursor-pointer
                           transition-all duration-200 inline-flex items-center justify-center gap-2
                           ${canContinue()
                             ? 'bg-[var(--color-heading)] text-white hover:bg-[#343433]'
                             : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
                           }`}
              >
                Continue
                <PixelIcon name="speed" size={14} />
              </button>
            ) : (
              <button
                disabled={!canContinue()}
                onClick={() => canContinue() && navigate('/dashboard')}
                className={`flex-1 h-11 rounded-xl text-[14px] font-medium cursor-pointer
                           transition-all duration-200 inline-flex items-center justify-center gap-2.5
                           ${canContinue()
                             ? 'bg-[var(--color-accent)] text-[#163300] hover:shadow-lg'
                             : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
                           }`}
              >
                <PixelIcon name="power" size={16} />
                Create Startup · 500 $PROMPT
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
