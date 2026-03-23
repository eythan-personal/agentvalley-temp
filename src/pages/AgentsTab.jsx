import { useState } from 'react'
import PixelIcon from '../components/PixelIcon'
import { AgentDot } from '../components/ui'

const TIERS = [
  { min: 0, label: 'Rookie', color: 'var(--color-muted)' },
  { min: 1, label: 'Proven', color: 'oklch(0.77 0.12 253.03)' },
  { min: 3, label: 'Veteran', color: 'oklch(0.82 0.18 80)' },
  { min: 6, label: 'Elite', color: '#3d7a1c' },
]

function getTier(graduations) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (graduations >= TIERS[i].min) return TIERS[i]
  }
  return TIERS[0]
}

const MOCK_AGENTS = [
  { name: 'Scout', role: 'Market research, competitive analysis, evaluation', status: 'active', graduations: 7, activeTasks: 1, skills: ['web-research', 'competitive-analysis', 'report-writing', 'data-extraction', 'trend-analysis'] },
  { name: 'Forge', role: 'Full-stack engineering, API design, deployment', status: 'active', graduations: 5, activeTasks: 2, skills: ['typescript', 'react', 'node', 'database-design', 'ci-cd', 'testing'] },
  { name: 'Relay', role: 'Webhooks, integrations, communication pipelines', status: 'active', graduations: 3, activeTasks: 1, skills: ['api-integration', 'webhooks', 'message-queues'] },
  { name: 'Cipher', role: 'Security auditing, code review, compliance', status: 'idle', graduations: 4, activeTasks: 0, skills: ['security-audit', 'code-review', 'penetration-testing', 'compliance'] },
  { name: 'Beacon', role: 'Monitoring, alerting, incident response', status: 'idle', graduations: 1, activeTasks: 0, skills: ['monitoring', 'alerting'] },
]

const CARD_SHADOW = '0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)'
const CARD_SHADOW_HOVER = '0 8px 16px -4px rgba(0,0,0,0.1), 0 4px 6px -3px rgba(0,0,0,0.06)'

function AgentRow({ children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="rounded-2xl bg-[var(--color-surface)] cursor-pointer"
      style={{
        boxShadow: hovered ? CARD_SHADOW_HOVER : CARD_SHADOW,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}

export default function AgentsTab() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = MOCK_AGENTS.filter(a => {
    const matchesSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const activeCount = MOCK_AGENTS.filter(a => a.status === 'active').length

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-24 sm:pt-[20vh] pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Agents</h1>
          <span className="text-[12px] text-[var(--color-muted)]">{activeCount}/{MOCK_AGENTS.length} active</span>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="h-10 px-4 rounded-xl text-[12px] font-medium bg-[var(--color-heading)] text-[var(--color-bg)] cursor-pointer transition-[scale] duration-150 active:scale-[0.96] flex items-center gap-2"
        >
          <PixelIcon name="plus" size={14} aria-hidden="true" />
          Invite Agent
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            <PixelIcon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-heading)] placeholder-[var(--color-muted)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        {['all', 'active', 'idle'].map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterStatus(f)}
            className={`h-10 px-3 rounded-xl text-[12px] font-medium cursor-pointer transition-[color,background-color,scale] duration-150 active:scale-[0.96] capitalize
              ${filterStatus === f
                ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
              }`}
            style={filterStatus !== f ? { outline: '1px solid var(--color-border)', outlineOffset: '-1px' } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Agent list */}
      <div className="space-y-2">
        {filtered.map((agent) => {
          const tier = getTier(agent.graduations)
          const isActive = agent.status === 'active'
          const maxTags = 3
          const visibleSkills = agent.skills.slice(0, maxTags)
          const extraSkills = agent.skills.length - maxTags
          return (
            <AgentRow key={agent.name}>
              <div className="px-5 pt-4 pb-3">
                {/* Top: avatar + name + status */}
                <div className="flex items-center gap-3 mb-2">
                  <AgentDot name={agent.name} size={40} inactive={!isActive} thinking={isActive} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>{agent.name}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `color-mix(in srgb, ${tier.color} 15%, var(--color-surface))`, color: tier.color }}>
                        {tier.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-[var(--color-muted)] truncate">{agent.role}</div>
                  </div>
                  {/* Status dot */}
                  <div className="flex-shrink-0" title={isActive ? 'Active' : 'Idle'}>
                    <span className={`block w-3 h-3 rounded-full border-2 ${isActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-muted)] bg-transparent'}`}>
                      {isActive && <span className="block w-full h-full rounded-full bg-[var(--color-accent)] animate-ping opacity-40" />}
                    </span>
                  </div>
                </div>

                {/* Skill tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {visibleSkills.map(skill => (
                    <span key={skill} className="text-[11px] font-mono text-[var(--color-muted)] px-2.5 py-1 rounded-lg bg-[var(--color-bg-alt)]">{skill}</span>
                  ))}
                  {extraSkills > 0 && (
                    <span className="text-[11px] font-mono text-[var(--color-muted)] px-2.5 py-1 rounded-lg bg-[var(--color-bg-alt)]">+{extraSkills}</span>
                  )}
                </div>
              </div>

              {/* Footer strip */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-border)] text-[11px] text-[var(--color-muted)]">
                <span>{isActive ? `${agent.activeTasks} active task${agent.activeTasks !== 1 ? 's' : ''}` : 'No active tasks'}</span>
                <span>{agent.skills.length} skill{agent.skills.length !== 1 ? 's' : ''}</span>
              </div>
            </AgentRow>
          )
        })}
      </div>

      {/* Invite Agent Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center" onClick={() => setInviteOpen(false)}>
          <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: 'blur(8px)' }} />
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-[var(--color-surface)] p-6"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>Invite Agent</h2>
              <button type="button" onClick={() => setInviteOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] cursor-pointer transition-colors">
                <PixelIcon name="close" size={16} />
              </button>
            </div>
            <p className="text-[13px] text-[var(--color-muted)] mb-4">Browse available agents from the marketplace or invite by name.</p>
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                <PixelIcon name="search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-heading)] placeholder-[var(--color-muted)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            {/* Sample available agents */}
            <div className="space-y-2 mb-4">
              {[
                { name: 'Nexus', role: 'Analytics & Reporting', graduations: 4 },
                { name: 'Prism', role: 'Design & Frontend', graduations: 2 },
                { name: 'Volt', role: 'Performance & Optimization', graduations: 6 },
              ].map(a => {
                const tier = getTier(a.graduations)
                return (
                  <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer group">
                    <AgentDot name={a.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[var(--color-heading)]">{a.name}</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `color-mix(in srgb, ${tier.color} 15%, var(--color-surface))`, color: tier.color }}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--color-muted)]">{a.role} · {a.graduations} graduations</div>
                    </div>
                    <button type="button" className="h-8 px-3 rounded-lg text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] cursor-pointer transition-colors opacity-0 group-hover:opacity-100" style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}>
                      Invite
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              className="w-full h-10 rounded-xl text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] cursor-pointer transition-colors"
              style={{ outline: '1px solid var(--color-border)', outlineOffset: '-1px' }}
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
