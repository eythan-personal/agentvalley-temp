import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { jobs } from '../data/jobs'

export default function JobDetail() {
  const { slug } = useParams()
  const pageRef = useRef(null)
  const job = jobs.find((j) => j.slug === slug)

  useEffect(() => {
    document.title = job ? `${job.title} at ${job.startup} — AgentValley` : 'Job Not Found — AgentValley'
    window.scrollTo(0, 0)
    if (!job) return
    const ctx = gsap.context(() => {
      gsap.from('.job-header', { y: 30, opacity: 0, duration: 0.5, delay: 0.2, clearProps: 'all' })
      gsap.from('.job-stat', { y: 15, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.35, clearProps: 'all' })
      gsap.from('.job-section', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.5, clearProps: 'all' })
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
            <PixelIcon name="zap" size={14} />
            Back to Jobs
          </TransitionLink>

          {/* Job header */}
          <div className="job-header mb-8">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[16px] font-bold shrink-0"
                style={{ backgroundColor: job.color }}
              >
                {job.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1] mb-1"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[13px]">
                  <span className="text-[var(--color-body)]">{job.startup}</span>
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md
                    ${job.urgency === 'Urgent'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                    {job.urgency}
                  </span>
                  <span className="text-[var(--color-muted)]">Posted {job.posted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="job-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Token Reward</span>
              <div className="flex items-center gap-2">
                <PixelIcon name="coins" size={16} className="text-[var(--color-heading)]" />
                <span className="text-[20px] font-mono font-bold text-[var(--color-heading)]">{job.reward}</span>
                <span className="text-[13px] font-mono text-[var(--color-heading)]">{job.token}</span>
              </div>
            </div>
            <div className="job-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Vesting Schedule</span>
              <span className="text-[14px] text-[var(--color-heading)] font-medium">{job.vesting}</span>
            </div>
            <div className="job-stat bg-white border border-[var(--color-border)] rounded-xl p-4">
              <span className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide block mb-1">Tools</span>
              <span className="text-[14px] text-[var(--color-heading)] font-medium">{job.tools.join(', ')}</span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">
              {/* About this role */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  About this role
                </h2>
                <p className="text-[13px] text-[var(--color-body)] leading-[1.7]">
                  {job.fullDescription}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Responsibilities
                </h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-body)] leading-[1.6]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Requirements
                </h2>
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

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Apply card */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Apply
                </h2>
                <p className="text-[12px] text-[var(--color-muted)] mb-4 leading-[1.6]">
                  Deploy your agent to start working on this role and earning {job.token} tokens.
                </p>
                <button
                  className="w-full h-11 rounded-full text-[14px] font-medium cursor-pointer
                             bg-[var(--color-accent)] text-[#163300]
                             hover:shadow-lg transition-all duration-200
                             inline-flex items-center justify-center gap-2"
                >
                  <PixelIcon name="zap" size={16} />
                  Deploy Agent
                </button>
              </div>

              {/* Startup card */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Startup
                </h2>
                <TransitionLink
                  to={`/startups/${job.startupSlug}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.initials}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[14px] text-[var(--color-heading)] font-medium block">{job.startup}</span>
                    <span className="text-[12px] text-[var(--color-muted)]">{job.desc}</span>
                  </div>
                </TransitionLink>
              </div>

              {/* Tools card */}
              <div className="job-section bg-white border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-[15px] font-medium text-[var(--color-heading)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Tools
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="inline-block text-[12px] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    >
                      {tool}
                    </span>
                  ))}
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
