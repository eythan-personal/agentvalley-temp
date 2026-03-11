import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { jobs } from '../data/jobs'

const pixelGrid = `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6V0h6' fill='none' stroke='%23000' stroke-width='.5' opacity='.06'/%3E%3C/svg%3E")`

function PixelGridOverlay({ opacity = '0.03' }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{ backgroundImage: pixelGrid, opacity }}
      aria-hidden="true"
    />
  )
}

export default function JobDetail() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const job = jobs.find((j) => j.slug === slug)

  useEffect(() => {
    document.title = job ? `${job.title} at ${job.startup} — AgentValley` : 'Job Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!job) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.job-header', { y: 30, opacity: 0, duration: 0.5, delay: 0.2, clearProps: 'all' })
      gsap.from('.job-section', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.4, clearProps: 'all' })
    }, pageRef)
    return () => ctx.revert()
  }, [job])

  if (!job) {
    return (
      <div ref={pageRef}>
        <Nav />
        <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
          <div className="max-w-[var(--container)] mx-auto text-center py-20">
            <h1 className="text-[24px] text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Job not found
            </h1>
            <TransitionLink to="/jobs" className="text-[14px] text-[var(--color-accent)] hover:underline">
              Back to Jobs
            </TransitionLink>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <Nav />

      <main id="main" className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-[var(--container)] mx-auto">

          {/* Back link */}
          <TransitionLink
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mb-6"
          >
            <PixelIcon name="speed" size={14} style={{ transform: 'scaleX(-1)' }} />
            Back to Jobs
          </TransitionLink>

          {/* Job header — unified listing block */}
          <div className="job-header mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              {/* Left: identity */}
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[16px] font-bold shrink-0 overflow-hidden"
                  style={{ backgroundColor: job.color, fontFamily: 'var(--font-display)' }}
                >
                  {job.initials}
                  <PixelGridOverlay opacity="0.08" />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-1"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-[13px]">
                    <span className="text-[var(--color-body)]">{job.startup}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md
                      ${job.urgency === 'Urgent'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${job.urgency === 'Urgent' ? 'bg-red-500' : 'bg-amber-400'}`} />
                      {job.urgency}
                    </span>
                    <span className="text-[var(--color-muted)]">Posted {job.posted}</span>
                  </div>
                </div>
              </div>

              {/* Right: token reward — the "price tag" */}
              <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[clamp(1.6rem,4vw,2.2rem)] leading-none tracking-tight text-[var(--color-heading)]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                  >
                    {job.reward}
                  </span>
                  <span className="text-[14px] font-mono font-semibold text-[var(--color-heading)]">
                    {job.token}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--color-muted)] font-mono sm:mt-1">
                  {job.vesting}
                </span>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">
              {/* About this role */}
              <div className="job-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="sparkle" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      About this role
                    </h2>
                  </div>
                  <p className="text-[13px] text-[var(--color-body)] leading-[1.7]">
                    {job.fullDescription}
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="job-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="target" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Responsibilities
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-body)] leading-[1.6]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Requirements */}
              <div className="job-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="shield" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Requirements
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {job.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-body)] leading-[1.6]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Apply card */}
              <div className="job-section relative bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay opacity="0.03" />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="robot" size={16} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Apply
                    </h2>
                  </div>
                  <p className="text-[12px] text-[var(--color-body)] mb-4 leading-[1.6]">
                    Submit your agent to apply for this role and start earning {job.token} tokens.
                  </p>
                  <button type="button"
                    className="w-full h-11 rounded-full text-[14px] font-medium cursor-pointer
                               bg-[var(--color-accent)] text-[#0d2000]
                               hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-200
                               inline-flex items-center justify-center gap-2"
                  >
                    <PixelIcon name="robot" size={16} />
                    Apply with Agent
                  </button>
                </div>
              </div>

              {/* Startup card */}
              <div className="job-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="speed" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Startup
                    </h2>
                  </div>
                  <TransitionLink
                    to={`/startups/${job.startupSlug}`}
                    className="flex items-center gap-3 p-3 -m-3 rounded-xl hover:bg-[var(--color-accent-soft)] transition-all duration-200 group"
                    style={{ textDecoration: 'none', color: 'inherit', transitionTimingFunction: 'steps(3)' }}
                  >
                    <div
                      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0 overflow-hidden"
                      style={{ backgroundColor: job.color, fontFamily: 'var(--font-display)' }}
                    >
                      {job.initials}
                      <PixelGridOverlay opacity="0.08" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[14px] text-[var(--color-heading)] font-medium block" style={{ fontFamily: 'var(--font-display)' }}>{job.startup}</span>
                      <span className="text-[12px] text-[var(--color-muted)]">{job.desc}</span>
                    </div>
                  </TransitionLink>
                </div>
              </div>

              {/* Tools card */}
              <div className="job-section relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 overflow-hidden">
                <PixelGridOverlay />
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[var(--color-accent)]"><PixelIcon name="terminal" size={14} /></span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Tools
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tools.map((tool, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-heading)] border border-[var(--color-accent)]/15"
                      >
                        <PixelIcon name="shield" size={10} className="text-[var(--color-accent)]" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
