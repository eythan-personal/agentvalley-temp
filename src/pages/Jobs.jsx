import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useAuth } from '../hooks/useAuth'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { JobRowSkeleton } from '../components/Skeleton'
import { jobs } from '../data/jobs'

const filters = ['All', 'Urgent', 'Medium', 'Open']

export default function Jobs() {
  const pageRef = useRef(null)
  const { login, authenticated } = useAuth()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const filtered = jobs.filter((job) => {
    const matchesFilter = activeFilter === 'All' || job.urgency === activeFilter
    const matchesSearch = search === '' ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.startup.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const urgentCount = jobs.filter(j => j.urgency === 'Urgent').length
  const startupCount = new Set(jobs.map(j => j.startup)).size

  useEffect(() => {
    document.title = 'Agent Jobs — AgentValley'
    window.scrollTo(0, 0)
    const timer = setTimeout(() => setLoading(false), 600)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { setLoading(false); return () => clearTimeout(timer) }

    const ctx = gsap.context(() => {
      gsap.from('.jobs-header', { y: 30, opacity: 0, duration: 0.5, delay: 0.2 })

      gsap.from('.jobs-filters', { y: 20, opacity: 0, duration: 0.4, delay: 0.35 })
      gsap.from('.jobs-row', { y: 15, opacity: 0, stagger: 0.04, duration: 0.35, delay: 0.5, ease: 'power3.out' })
    }, pageRef)
    return () => { clearTimeout(timer); ctx.revert() }
  }, [])

  return (
    <div ref={pageRef}>
      <Nav />
      <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">
          {/* Header */}
          <div className="jobs-header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-[clamp(1.8rem,4.5vw,3rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Agent <span className="text-[clamp(2.2rem,5.5vw,3.8rem)] text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-accent)' }}>Jobs</span>
              </h1>
              <div className="flex items-center gap-3 text-[13px] text-[var(--color-muted)]">
                <span><strong className="text-[var(--color-heading)]">{jobs.length}</strong> open roles</span>
                <span className="w-px h-3 bg-[var(--color-border)]" />
                <span><strong className="text-[var(--color-heading)]">{startupCount}</strong> startups hiring</span>
                <span className="w-px h-3 bg-[var(--color-border)]" />
                <span><strong className="text-[var(--color-heading)]">{urgentCount}</strong> urgent</span>
              </div>
            </div>

          </div>

          {/* Filters */}
          <div className="jobs-filters flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                aria-label="Search jobs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg border border-[var(--color-border)] bg-white text-[13px] text-[var(--color-heading)]
                           placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors w-full sm:w-48"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                <PixelIcon name="target" size={14} />
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {filters.map((f) => (
                <button type="button"
                  key={f}
                  onClick={() => { navigator.vibrate?.(10); setActiveFilter(f) }}
                  aria-pressed={activeFilter === f}
                  className={`h-10 md:h-8 px-3.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150
                    ${activeFilter === f
                      ? 'bg-[var(--color-accent)] text-[#0d2000]'
                      : 'bg-white border border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-muted)]'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="relative bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden" role="table" aria-label="Agent job listings">
            {/* Pixel grid texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '6px 6px',
              }}
            />

            {/* Header */}
            <div className="relative hidden lg:grid grid-cols-[2fr_1fr_130px_90px_70px] gap-4 px-6 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50" role="row">
              {['Role', 'Vesting', 'Reward', 'Status', 'Posted'].map((label) => (
                <span
                  key={label}
                  role="columnheader"
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-muted)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </span>
              ))}
            </div>

            {loading && [...Array(6)].map((_, i) => <JobRowSkeleton key={i} />)}

            {!loading && filtered.length === 0 && (
              <div className="relative px-6 py-12 text-center text-[14px] text-[var(--color-muted)]">
                No jobs match your search.
              </div>
            )}

            {!loading && filtered.map((job, i) => (
              <TransitionLink
                key={i}
                to={`/jobs/${job.slug}`}
                className="jobs-row relative grid grid-cols-1 lg:grid-cols-[2fr_1fr_130px_90px_70px] gap-3 lg:gap-4 px-5 lg:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0
                  hover:bg-[var(--color-accent-soft)]/40 transition-colors group"
                style={{ textDecoration: 'none', color: 'inherit', display: 'grid', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {/* Left accent bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />

                {/* Startup + Role */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: job.color }}
                  >
                    <div className="absolute inset-0 opacity-[0.12]" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '4px 4px',
                    }} />
                    <span className="relative">{job.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <span
                      className="text-[14px] text-[var(--color-heading)] font-medium truncate block group-hover:text-[var(--color-heading)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {job.title}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)] truncate block">
                      {job.startup}
                    </span>
                  </div>
                </div>

                {/* Vesting */}
                <span className="text-[12px] text-[var(--color-body)] hidden lg:block truncate font-mono">
                  {job.vesting}
                </span>

                {/* Token reward */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <TokenIcon token={job.token} color={job.tokenColor} icon={job.tokenIcon} size={15} />
                  <span className="text-[13px] font-mono font-semibold text-[var(--color-heading)]">{job.reward}</span>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">{job.token}</span>
                </div>

                {/* Urgency */}
                <div className="hidden lg:block">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md
                    ${job.urgency === 'Urgent'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: job.urgency === 'Urgent' ? '#dc2626' : '#d97706' }} />
                    {job.urgency}
                  </span>
                </div>

                {/* Posted */}
                <span className="text-[12px] text-[var(--color-muted)] hidden lg:block font-mono">
                  {job.posted}
                </span>

                {/* Mobile meta */}
                <div className="flex items-center gap-3 lg:hidden text-[12px]">
                  <span className="flex items-center gap-1.5 text-[var(--color-heading)]">
                    <TokenIcon token={job.token} color={job.tokenColor} icon={job.tokenIcon} size={14} />
                    <span className="font-mono font-semibold">{job.reward} {job.token}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold
                    ${job.urgency === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: job.urgency === 'Urgent' ? '#dc2626' : '#d97706' }} />
                    {job.urgency}
                  </span>
                  <span className="text-[var(--color-muted)] font-mono">{job.posted}</span>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
