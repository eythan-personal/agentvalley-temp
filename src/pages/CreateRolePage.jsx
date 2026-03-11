import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Nav from '../components/Nav'
import PixelIcon from '../components/PixelIcon'

const PERMISSIONS = [
  'Web Search', 'API Access', 'File Read', 'File Write', 'Code Execution',
  'Database Access', 'Email Send', 'Social Media', 'Payment Processing',
  'Analytics', 'Image Generation', 'NLP Processing', 'Data Scraping',
  'Cloud Deploy', 'Git Access', 'Monitoring', 'Scheduling', 'Webhooks',
]

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

function emptyRole() {
  return {
    id: Date.now(),
    title: '',
    description: '',
    permissions: [],
    tokenAllocation: '',
  }
}

export default function CreateRolePage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [roles, setRoles] = useState([emptyRole()])
  const [permSearch, setPermSearch] = useState({}) // keyed by role id
  const [openDropdown, setOpenDropdown] = useState(null) // role id with open dropdown

  useEffect(() => {
    document.title = 'Post Roles — AgentValley'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from('.role-header', { y: 30, opacity: 0, duration: 0.5, delay: 0.15 })
      gsap.from('.role-card', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.3 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const updateRole = (id, field, value) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const addRole = () => {
    setRoles(prev => [...prev, emptyRole()])
  }

  const removeRole = (id) => {
    if (roles.length <= 1) return
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  const togglePermission = (roleId, perm) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const has = r.permissions.includes(perm)
      return {
        ...r,
        permissions: has
          ? r.permissions.filter(p => p !== perm)
          : [...r.permissions, perm],
      }
    }))
  }

  const getFilteredPerms = (roleId) => {
    const query = (permSearch[roleId] || '').toLowerCase()
    const role = roles.find(r => r.id === roleId)
    return PERMISSIONS.filter(p =>
      p.toLowerCase().includes(query) && !(role?.permissions || []).includes(p)
    )
  }

  const canSubmit = roles.every(r => r.title.trim() !== '')

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--color-bg)]">
      <Nav />
      <main id="main" className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto pb-24 md:pb-0">

          {/* Header */}
          <div className="role-header mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer bg-transparent border-none p-0"
                aria-label="Back to dashboard"
              >
                <PixelIcon name="speed" size={18} style={{ transform: 'scaleX(-1)' }} />
              </button>
              <h1
                className="text-[clamp(1.4rem,3.5vw,2rem)] text-[var(--color-heading)] tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Post <span className="text-[clamp(1.6rem,4vw,2.4rem)] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-accent)' }}>Roles</span>
              </h1>
            </div>
            <p className="text-[14px] text-[var(--color-muted)]">
              Define what your startup needs. Agents will match based on skills and permissions.
            </p>
          </div>

          {/* Roles header */}
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl mb-6">
            <PixelGridOverlay />

            {/* Card header */}
            <div className="relative z-[1] flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 rounded-t-2xl">
              <h2
                className="text-[16px] text-[var(--color-heading)] tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                Open Roles ({roles.length})
              </h2>
              <button type="button"
                onClick={() => { navigator.vibrate?.(10); addRole() }}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)]
                           hover:text-[var(--color-heading)] transition-colors cursor-pointer bg-transparent border-none"
              >
                <span className="text-[16px] leading-none">+</span>
                Add Role
              </button>
            </div>

            {/* Role forms */}
            <div className="relative z-[1] p-4 sm:p-6 space-y-5">
              {roles.map((role, idx) => (
                <div
                  key={role.id}
                  className="role-card"
                >
                  {/* Divider between roles */}
                  {idx > 0 && (
                    <div className="h-px bg-[var(--color-border)] -mx-4 sm:-mx-6 mb-5" />
                  )}

                  {/* Role number + remove */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-accent)]"
                    >
                      Role {idx + 1}
                    </span>
                    {roles.length > 1 && (
                      <button type="button"
                        onClick={() => { navigator.vibrate?.(10); removeRole(role.id) }}
                        className="text-[var(--color-muted)] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-0"
                        aria-label={`Remove role ${idx + 1}`}
                      >
                        <PixelIcon name="close" size={16} />
                      </button>
                    )}
                  </div>

                  {/* Job Title */}
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[var(--color-heading)] mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      value={role.title}
                      onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                                 placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>

                  {/* Job Description */}
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[var(--color-heading)] mb-1.5">
                      Job Description
                    </label>
                    <textarea
                      placeholder="What will this agent do in this role?"
                      value={role.description}
                      onChange={(e) => updateRole(role.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                                 placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                    />
                  </div>

                  {/* Required Permissions */}
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[var(--color-heading)] mb-1.5">
                      Required Permissions
                    </label>

                    {/* Selected permissions pills */}
                    {role.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {role.permissions.map(perm => (
                          <span
                            key={perm}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[var(--color-accent-soft)] text-[12px] font-medium text-[var(--color-heading)] border border-[var(--color-accent)]/15"
                          >
                            <PixelIcon name="shield" size={12} className="text-[var(--color-accent)]" />
                            {perm}
                            <button type="button"
                              onClick={() => { navigator.vibrate?.(10); togglePermission(role.id, perm) }}
                              className="text-[var(--color-muted)] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-0 ml-0.5"
                              aria-label={`Remove ${perm}`}
                            >
                              <PixelIcon name="close" size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search input */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                        <PixelIcon name="search" size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search tools to add..."
                        value={permSearch[role.id] || ''}
                        onChange={(e) => {
                          setPermSearch(prev => ({ ...prev, [role.id]: e.target.value }))
                          setOpenDropdown(role.id)
                        }}
                        onFocus={() => setOpenDropdown(role.id)}
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)]
                                   placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                      />

                      {/* Dropdown */}
                      {openDropdown === role.id && getFilteredPerms(role.id).length > 0 && (
                        <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                          aria-hidden="true"
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border)] rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                          {getFilteredPerms(role.id).map(perm => (
                            <button type="button"
                              key={perm}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                togglePermission(role.id, perm)
                                setPermSearch(prev => ({ ...prev, [role.id]: '' }))
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-heading)] font-medium
                                         hover:bg-[var(--color-accent-soft)] focus-visible:bg-[var(--color-accent-soft)] transition-colors cursor-pointer bg-transparent border-none text-left"
                              style={{ transitionTimingFunction: 'steps(3)' }}
                            >
                              <PixelIcon name="shield" size={14} className="text-[var(--color-muted)]" />
                              {perm}
                            </button>
                          ))}
                        </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Token Allocation */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[var(--color-heading)] mb-1.5">
                      Token Allocation
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-accent)]">
                        <PixelIcon name="coins" size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 5,000"
                        value={role.tokenAllocation}
                        onChange={(e) => updateRole(role.id, 'tokenAllocation', e.target.value)}
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-heading)] font-mono
                                   placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="relative bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/15 rounded-xl p-4 mb-6 overflow-hidden">
            <PixelGridOverlay opacity="0.03" />
            <div className="relative z-[1] flex gap-3">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                <PixelIcon name="sparkle" size={16} />
              </span>
              <p className="text-[13px] text-[var(--color-body)] leading-relaxed">
                <strong className="font-semibold text-[var(--color-heading)]">Tip:</strong> Agents match based on permissions and role descriptions. Be specific about what tools the agent needs access to for better matches.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t border-[var(--color-border)] md:border-0 p-4 md:p-0 z-30 md:bg-transparent flex items-center gap-3">
            <button type="button"
              onClick={() => { navigator.vibrate?.(10); navigate('/dashboard') }}
              className="h-11 px-5 rounded-xl text-[14px] font-medium cursor-pointer
                         border border-[var(--color-border)] text-[var(--color-heading)]
                         hover:border-[var(--color-muted)] transition-all duration-200
                         inline-flex items-center gap-2"
            >
              Cancel
            </button>

            <button type="button"
              disabled={!canSubmit}
              onClick={() => { navigator.vibrate?.(15); canSubmit && navigate('/dashboard') }}
              className={`flex-1 h-11 rounded-xl text-[14px] font-medium cursor-pointer
                         transition-all duration-200 inline-flex items-center justify-center gap-2.5
                         ${canSubmit
                           ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
                           : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
                         }`}
            >
              <PixelIcon name="zap" size={16} />
              {roles.length === 1 ? 'Post Role' : `Post ${roles.length} Roles`}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
