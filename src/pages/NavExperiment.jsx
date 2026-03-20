import { useState, useEffect } from 'react'
import PixelIcon from '../components/PixelIcon'
import { BottomNav, TopBar } from '../components/ui'

const TABS = [
  { id: 'dashboard', label: 'Startup Overview', icon: 'dashboard' },
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
]

const STARTUPS = [
  { name: 'Acme AI Labs', initials: 'AA', color: '#6366f1', slug: 'acme-ai-labs', role: 'Owner' },
  { name: 'Neon Grid', initials: 'NG', color: '#10b981', slug: 'neon-grid' },
  { name: 'Code Forge', initials: 'CF', color: '#f59e0b', slug: 'code-forge' },
]

export default function NavExperiment() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentSlug, setCurrentSlug] = useState('acme-ai-labs')

  useEffect(() => { document.title = 'Nav Experiment — AgentValley' }, [])

  const currentStartup = STARTUPS.find(s => s.slug === currentSlug)

  const addItems = [
    { label: 'New Objective', icon: 'bullseye-arrow', iconColor: 'text-[var(--color-accent)]', onAction: () => console.log('New Objective') },
    { label: 'Invite Agent', icon: 'robot', iconColor: 'text-blue-500', onAction: () => console.log('Invite Agent') },
    { label: 'Post a Role', icon: 'target', iconColor: 'text-amber-500', onAction: () => console.log('Post Role') },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">
      <TopBar
        currentStartup={currentStartup}
        startups={STARTUPS}
        onStartupChange={setCurrentSlug}
        avatarUrl="/profile_pic.jpg"
        profile={{ name: 'Eythan D\'Amico', email: 'eythan@agentvalley.com' }}
        profileItems={[
          { label: 'Settings', icon: 'settings', onAction: () => console.log('Settings') },
          { label: 'Support', icon: 'message', onAction: () => console.log('Support') },
          { label: 'Feedback', icon: 'mail', onAction: () => console.log('Feedback') },
          { label: 'Log out', icon: 'logout', danger: true, onAction: () => console.log('Logout') },
        ]}
      />

      <div className="max-w-[540px] mx-auto px-4 sm:px-6 pt-24 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Nav Experiment</h1>
          <p className="text-[14px] text-[var(--color-muted)]">Experiment with the bottom navigation bar</p>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
            <PixelIcon name={TABS.find(t => t.id === activeTab)?.icon || 'dashboard'} size={28} className="text-[var(--color-accent)]" />
          </div>
          <div className="text-[18px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </div>
          <div className="text-[13px] text-[var(--color-muted)]">
            Active tab: <code className="text-[var(--color-accent)]">{activeTab}</code>
            {' · '}
            Startup: <code className="text-[var(--color-accent)]">{currentSlug}</code>
          </div>
        </div>
      </div>

      <BottomNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        addItems={addItems}
        avatarUrl="/profile_pic.jpg"
        profile={{ name: 'Eythan D\'Amico', email: 'eythan@agentvalley.com' }}
        profileItems={[
          { label: 'Settings', icon: 'settings', onAction: () => console.log('Settings') },
          { label: 'Support', icon: 'message', onAction: () => console.log('Support') },
          { label: 'Feedback', icon: 'mail', onAction: () => console.log('Feedback') },
          { label: 'Log out', icon: 'logout', danger: true, onAction: () => console.log('Logout') },
        ]}
        chatTabId="chat"
        onSendMessage={(msg) => console.log('Send:', msg)}
      />
    </div>
  )
}
