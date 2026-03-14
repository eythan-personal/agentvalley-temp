import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import { useAuth } from '../hooks/useAuth'
import { useStartupData } from '../hooks/useStartupData'
import { api, assetUrl } from '../lib/api'
import { useToast } from '../components/Toast'

const CATEGORIES = ['AI/ML', 'DeFi', 'Gaming', 'Social', 'Infrastructure', 'DAO', 'NFT', 'Other']

export default function StartupSettings() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { logout, user } = useAuth()
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const { data: startupData, startup: currentStartup, loading, refetch } = useStartupData(slug)
  const myStartup = startupData?.startup ?? {}

  // Expandable sections
  const [openSection, setOpenSection] = useState(null)
  const toggleSection = (s) => setOpenSection(prev => prev === s ? null : s)

  // Edit profile form
  const [profileForm, setProfileForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const avatarFileRef = useRef(null)
  const bannerFileRef = useRef(null)

  // Initialize profile form when startup data loads
  useEffect(() => {
    if (currentStartup && !profileForm) {
      setProfileForm({
        name: currentStartup.name || '',
        description: startupData?.description || currentStartup.description || '',
        website: currentStartup.website || '',
        category: currentStartup.category || '',
        color: currentStartup.color || '#9fe870',
        avatarPreview: assetUrl(currentStartup.avatarUrl) || null,
        bannerPreview: assetUrl(currentStartup.bannerUrl) || null,
      })
    }
  }, [currentStartup, startupData])

  // Notifications state
  const [notifications, setNotifications] = useState({
    agentUpdates: true,
    taskAlerts: true,
    tokenEvents: false,
  })

  // Danger zone
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pausing, setPausing] = useState(false)

  useEffect(() => {
    if (currentStartup?.name) {
      document.title = `Settings — ${currentStartup.name} — AgentValley`
    }
  }, [currentStartup?.name])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    gsap.from('.dash-panel', { opacity: 0, y: 20, stagger: 0.06, duration: 0.35, delay: 0.15, clearProps: 'all' })
  }, [])

  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenu])

  if (loading || !currentStartup) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[var(--color-accent)] live-pulse">
            <PixelIcon name="loader" size={32} />
          </span>
          <span className="text-[13px] text-[var(--color-muted)]">Loading...</span>
        </div>
      </div>
    )
  }

  const handleFileSelect = (field) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (field === 'avatar') {
      avatarFileRef.current = file
      setProfileForm(prev => ({ ...prev, avatarPreview: URL.createObjectURL(file) }))
    } else {
      bannerFileRef.current = file
      setProfileForm(prev => ({ ...prev, bannerPreview: URL.createObjectURL(file) }))
    }
  }

  const uploadFile = async (file) => {
    if (!file) return undefined
    const formData = new FormData()
    formData.append('file', file)
    const result = await api.upload('/uploads', formData)
    return result.url
  }

  const handleSaveProfile = async () => {
    if (!profileForm || saving) return
    setSaving(true)
    try {
      const updates = {
        name: profileForm.name.trim(),
        description: profileForm.description.trim(),
        website: profileForm.website.trim() || null,
        category: profileForm.category,
        color: profileForm.color,
      }

      if (avatarFileRef.current) {
        updates.avatarUrl = await uploadFile(avatarFileRef.current)
        avatarFileRef.current = null
      }
      if (bannerFileRef.current) {
        updates.bannerUrl = await uploadFile(bannerFileRef.current)
        bannerFileRef.current = null
      }

      await api.patch(`/startups/${slug}`, updates)
      toast('Profile updated', { type: 'success', icon: 'check' })
      refetch()
      setOpenSection(null)
    } catch (err) {
      toast(err.message || 'Failed to save', { type: 'error', icon: 'alert' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async (vis) => {
    try {
      await api.patch(`/startups/${slug}`, { visibility: vis })
      toast(`Visibility set to ${vis}`, { type: 'success', icon: 'check' })
      refetch()
    } catch (err) {
      toast(err.message || 'Failed to update', { type: 'error', icon: 'alert' })
    }
  }

  const handlePause = async () => {
    setPausing(true)
    try {
      const newStatus = currentStartup.status === 'Paused' ? 'Incubating' : 'Paused'
      await api.patch(`/startups/${slug}`, { status: newStatus })
      toast(newStatus === 'Paused' ? 'Startup paused' : 'Startup resumed', { type: 'success', icon: newStatus === 'Paused' ? 'pause' : 'play' })
      refetch()
    } catch (err) {
      toast(err.message || 'Failed to update', { type: 'error', icon: 'alert' })
    } finally {
      setPausing(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/startups/${slug}`)
      toast('Startup deleted', { type: 'success', icon: 'check' })
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Failed to delete', { type: 'error', icon: 'alert' })
      setDeleting(false)
    }
  }

  const isPaused = currentStartup.status === 'Paused'
  const startupSecret = `ak_live_${slug}_${currentStartup.initials?.toLowerCase() || 'xx'}`.slice(0, 32)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">

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
            to={`/dashboard/${slug}`}
            className="h-8 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                       flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)]
                       hover:border-[var(--color-muted)] transition-all"
          >
            <PixelIcon name="arrow-left" size={13} />
            Workshop
          </TransitionLink>

          <div className="flex-1" />

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
              <div className="animate-menu-in absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                {user?.wallet?.address && (
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </div>
                  </div>
                )}
                <button type="button" onClick={() => { navigator.clipboard.writeText(user?.wallet?.address || ''); setUserMenu(false); toast('Address copied', { type: 'success', icon: 'clipboard' }) }} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                  <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                  Copy Address
                </button>
                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                  <button type="button" onClick={() => { setUserMenu(false); logout() }} className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                    <PixelIcon name="power" size={14} />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-[540px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            {assetUrl(currentStartup.avatarUrl) ? (
              <img src={assetUrl(currentStartup.avatarUrl)} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            ) : (
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                style={{ background: currentStartup.color }}
              >
                {currentStartup.initials}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-[var(--color-heading)]">{currentStartup.name}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isPaused
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                }`}>
                  {currentStartup.status || 'Incubating'}
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-[var(--color-heading)] mt-4" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 pt-4 pb-24">
        <div className="max-w-[540px] mx-auto">

          {/* ═══ GENERAL ═══ */}
          <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">General</span>
            <div className="flex flex-col gap-2">

              {/* ── Edit Profile ── */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('profile')}
                  className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
                >
                  <PixelIcon name="edit-box" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Edit Profile</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Name, description, logo, and links</div>
                  </div>
                  <PixelIcon name={openSection === 'profile' ? 'chevron-down' : 'chevron-right'} size={14} className="text-[var(--color-muted)]" />
                </button>

                {openSection === 'profile' && profileForm && (
                  <div className="mt-3 px-1 flex flex-col gap-4">
                    {/* Avatar & Banner */}
                    <div>
                      <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleFileSelect('banner')} className="hidden" />
                      <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleFileSelect('avatar')} className="hidden" />
                      <div
                        role="button" tabIndex={0}
                        onClick={() => bannerInputRef.current?.click()}
                        className="relative h-24 rounded-xl overflow-hidden cursor-pointer group border border-[var(--color-border)]"
                      >
                        {profileForm.bannerPreview ? (
                          <img src={profileForm.bannerPreview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: profileForm.color }}>
                            <span className="text-white/60 text-[12px]">Click to upload banner</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PixelIcon name="image" size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="flex items-end gap-3 -mt-6 ml-3 relative z-10">
                        <div
                          role="button" tabIndex={0}
                          onClick={() => avatarInputRef.current?.click()}
                          className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer group border-2 border-[var(--color-surface)] shrink-0"
                        >
                          {profileForm.avatarPreview ? (
                            <img src={profileForm.avatarPreview} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[16px] font-bold text-white" style={{ background: profileForm.color }}>
                              {currentStartup.initials}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-10 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] px-3 text-[14px] text-[var(--color-heading)] focus:border-[var(--color-accent)] outline-none transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Description</label>
                      <textarea
                        value={profileForm.description}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-2.5 text-[14px] text-[var(--color-heading)] focus:border-[var(--color-accent)] outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Website</label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://"
                        className="w-full h-10 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] px-3 text-[14px] text-[var(--color-heading)] focus:border-[var(--color-accent)] outline-none transition-colors"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setProfileForm(prev => ({ ...prev, category: cat }))}
                            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer border ${
                              profileForm.category === cat
                                ? 'bg-[var(--color-accent)] text-[#0d2000] border-[var(--color-accent)]'
                                : 'bg-[var(--color-input)] text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-heading)]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Brand Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profileForm.color}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[13px] font-mono text-[var(--color-muted)]">{profileForm.color}</span>
                      </div>
                    </div>

                    {/* Save */}
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="h-10 rounded-lg bg-[var(--color-accent)] text-[#0d2000] text-[13px] font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <><PixelIcon name="loader" size={14} className="live-pulse" /> Saving...</>
                      ) : (
                        <><PixelIcon name="check" size={14} /> Save Changes</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Access & Permissions ── */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('access')}
                  className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
                >
                  <PixelIcon name="lock" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Access & Permissions</div>
                    <div className="text-[12px] text-[var(--color-muted)]">API keys, agent permissions, visibility</div>
                  </div>
                  <PixelIcon name={openSection === 'access' ? 'chevron-down' : 'chevron-right'} size={14} className="text-[var(--color-muted)]" />
                </button>

                {openSection === 'access' && (
                  <div className="mt-3 px-1 flex flex-col gap-4">
                    {/* Startup Secret */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">Startup Secret</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={startupSecret}
                          readOnly
                          className="flex-1 h-10 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] px-3 text-[13px] font-mono text-[var(--color-muted)]"
                        />
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(startupSecret); toast('Secret copied', { type: 'success', icon: 'clipboard' }) }}
                          className="h-10 px-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] hover:border-[var(--color-heading)] transition-colors cursor-pointer"
                        >
                          <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--color-muted)] mt-1.5">Used by AI agents to authenticate with your startup.</p>
                    </div>

                    {/* Visibility */}
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2 block">Visibility</label>
                      <div className="flex gap-2">
                        {['public', 'private'].map(vis => (
                          <button
                            key={vis}
                            type="button"
                            onClick={() => handleToggleVisibility(vis)}
                            className={`flex-1 h-10 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border ${
                              (currentStartup.visibility || 'public') === vis
                                ? 'bg-[var(--color-accent)] text-[#0d2000] border-[var(--color-accent)]'
                                : 'bg-[var(--color-input)] text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-heading)]'
                            }`}
                          >
                            <PixelIcon name={vis === 'public' ? 'globe' : 'lock'} size={14} className="inline mr-1.5" />
                            {vis.charAt(0).toUpperCase() + vis.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Notifications ── */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('notifications')}
                  className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3 w-full text-left hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
                >
                  <PixelIcon name="notification" size={16} className="text-[var(--color-muted)]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[var(--color-heading)]">Notifications</div>
                    <div className="text-[12px] text-[var(--color-muted)]">Agent updates, task alerts, token events</div>
                  </div>
                  <PixelIcon name={openSection === 'notifications' ? 'chevron-down' : 'chevron-right'} size={14} className="text-[var(--color-muted)]" />
                </button>

                {openSection === 'notifications' && (
                  <div className="mt-3 px-1 flex flex-col gap-2">
                    {[
                      { key: 'agentUpdates', label: 'Agent Updates', desc: 'When agents complete tasks or need attention' },
                      { key: 'taskAlerts', label: 'Task Alerts', desc: 'New tasks, status changes, and deadlines' },
                      { key: 'tokenEvents', label: 'Token Events', desc: 'Price alerts, holder changes, and transactions' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                        <div>
                          <div className="text-[14px] font-medium text-[var(--color-heading)]">{item.label}</div>
                          <div className="text-[12px] text-[var(--color-muted)]">{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                            notifications[item.key] ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                          }`}
                        >
                          <span
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{ transform: notifications[item.key] ? 'translateX(20px)' : 'translateX(0)' }}
                          />
                        </button>
                      </div>
                    ))}
                    <p className="text-[11px] text-[var(--color-muted)] mt-1 px-1">
                      Notification preferences are saved locally for now.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ DANGER ZONE ═══ */}
          <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-red-500/20 mb-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-red-400 mb-4 block">Danger Zone</span>
            <div className="flex flex-col gap-2">
              {/* Pause */}
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-heading)]">{isPaused ? 'Resume Startup' : 'Pause Startup'}</div>
                  <div className="text-[12px] text-[var(--color-muted)]">
                    {isPaused ? 'Resume all agent activity' : 'Temporarily stop all agent activity'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={pausing}
                  className={`text-[12px] font-medium transition-colors cursor-pointer px-3 py-1.5 rounded-lg border ${
                    isPaused
                      ? 'text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5'
                      : 'text-red-500 border-red-500/20 hover:bg-red-500/5'
                  } disabled:opacity-50`}
                >
                  {pausing ? '...' : isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>

              {/* Delete */}
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-input)] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-heading)]">Delete Startup</div>
                  <div className="text-[12px] text-[var(--color-muted)]">Permanently remove this startup and all data</div>
                </div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
