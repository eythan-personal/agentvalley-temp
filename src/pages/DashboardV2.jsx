import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import PixelIcon from '../components/PixelIcon'
import TransitionLink from '../components/TransitionLink'
import TokenIcon from '../components/TokenIcon'
import { useToast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'
import { useStartupData, useMyStartups } from '../hooks/useStartupData'
import { TokenChart, HoldersBar, RevenueActivityChart } from '../components/DashCharts'
import { ErrorBoundary, SectionError } from '../components/ErrorBoundary'
import { assetUrl } from '../lib/api'
import { DashboardSkeleton } from '../components/Skeletons'

// Generate a color from agent name (deterministic hash → hue)
function agentColor(name) {
  if (!name) return '#999'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 50%)`
}

function AgentDot({ name, size = 28, className = '', style = {}, active = false }) {
  const bg = agentColor(name)
  const initials = name ? name.slice(0, 2).toUpperCase() : '??'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${active ? 'agent-active-ring' : ''} ${className}`}
      style={{ width: size, height: size, background: bg, color: '#fff', fontSize: size * 0.38, fontWeight: 700, letterSpacing: '-0.02em', ...style }}
      title={name}
    >
      {initials}
    </span>
  )
}


const DASH_TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'token', label: 'Token', icon: 'coin' },
]

const WORKSHOP_TABS = [
  { id: 'dashboard', label: 'Startup Overview', icon: 'dashboard' },
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
]

const statusOrder = { 'in-progress': 0, 'queued': 1, 'completed': 2 }

export default function DashboardV2() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: startupData, startup: currentStartup, loading, error, refetch } = useStartupData(slug)
  const { startups: myStartups } = useMyStartups()
  const [showWelcome, setShowWelcome] = useState(() => location.state?.justCreated === true)
  const welcomeName = location.state?.startupName || currentStartup?.name || ''

  // ── Destructure startup-specific data from the hook ──
  const seedObjectives = useMemo(() => startupData?.objectives ?? [], [startupData])
  const seedTasks = useMemo(() => startupData?.tasks ?? [], [startupData])
  const seedTaskComments = useMemo(() => startupData?.taskComments ?? {}, [startupData])
  const feedItems = startupData?.feedItems ?? []
  const seedAgents = useMemo(() => startupData?.agents ?? [], [startupData])
  const [agents, setAgents] = useState(seedAgents)
  const myStartup = currentStartup ?? {}
  const myRoles = startupData?.myRoles ?? []
  const tokenData = startupData?.tokenData ?? {}
  const chatMessagesData = useMemo(() => startupData?.chatMessages ?? [], [startupData])

  // ── Mutable local copies (allows creating new objectives/tasks) ──
  const [objectives, setObjectives] = useState(seedObjectives)
  const [tasks, setTasks] = useState(seedTasks)
  const [taskComments, setTaskComments] = useState(seedTaskComments)

  // Sync local state when startup data changes (slug switch or initial load)
  const prevSyncKey = useRef(null)
  useEffect(() => {
    // Build a key from slug + data presence to detect both slug changes and first data arrival
    const key = `${slug}:${startupData ? 'loaded' : 'empty'}`
    if (prevSyncKey.current === key) return
    prevSyncKey.current = key
    setObjectives(seedObjectives)
    setTasks(seedTasks)
    setTaskComments(seedTaskComments)
    setAgents(seedAgents)
  }, [slug, startupData, seedObjectives, seedTasks, seedTaskComments, seedAgents])

  // ── Derived data (re-computed when objectives change) ──
  const sortedObjectives = useMemo(
    () => [...objectives].sort((a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)),
    [objectives],
  )
  const defaultObjective = useMemo(
    () => sortedObjectives.find(o => o.status === 'in-progress') || sortedObjectives[0],
    [sortedObjectives],
  )

  const toast = useToast()
  const { logout, authenticated, user } = useAuth()
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const [startupMenu, setStartupMenu] = useState(false)
  const startupMenuRef = useRef(null)
  const validTabs = ['dashboard', 'objectives', 'files', 'chat']
  const validSubTabs = ['overview', 'token']
  const [workshopTab, setWorkshopTabRaw] = useState(() => {
    const t = searchParams.get('tab')
    return validTabs.includes(t) ? t : 'dashboard'
  })

  // Sync tab state → URL (replace, not push, to avoid polluting history on every click)
  const setWorkshopTab = (tab) => {
    setWorkshopTabRaw(tab)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (tab === 'dashboard') next.delete('tab')
      else next.set('tab', tab)
      // Clear sub-tab when leaving dashboard
      if (tab !== 'dashboard') next.delete('sub')
      return next
    }, { replace: true })
  }

  // Sync URL → state on browser back/forward
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'dashboard'
    const urlSub = searchParams.get('sub') || 'overview'
    if (validTabs.includes(urlTab) && urlTab !== workshopTab) setWorkshopTabRaw(urlTab)
    if (validSubTabs.includes(urlSub) && urlSub !== dashTab) setDashTabRaw(urlSub)
  }, [searchParams])

  const [objectiveInput, setObjectiveInput] = useState('')
  const [activeObjective, setActiveObjective] = useState(null)
  const [isNewMode, setIsNewMode] = useState(false)
  const [objectiveDescription, setObjectiveDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [taskComment, setTaskComment] = useState('')
  const [activeFolder, setActiveFolder] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [statusFilter, setStatusFilter] = useState('in-progress') // 'in-progress' | 'queued' | 'completed'
  const [objDropdown, setObjDropdown] = useState(false)
  const objDropdownRef = useRef(null)
  const [likedTasks, setLikedTasks] = useState({})
  const [dislikedTasks, setDislikedTasks] = useState({})
  const [reactionPop, setReactionPop] = useState(null) // { taskId, type: 'like'|'dislike' }
  const [creatingObjective, setCreatingObjective] = useState(false)
  const [creationStep, setCreationStep] = useState(0)
  const taskDetailRef = useRef(null)
  const taskTouchStartX = useRef(0)
  const tabNotifications = useRef({ chat: 2, files: 0 })
  const creationIntervalRef = useRef(null)
  const chatReplyTimeoutRef = useRef(null)
  const [agentStatusIdx, setAgentStatusIdx] = useState({})
  const [liveTime, setLiveTime] = useState(0)
  const [tokenDisplayPrice, setTokenDisplayPrice] = useState(0)
  const navPillRef = useRef(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [agentTyping, setAgentTyping] = useState(null)
  const chatEndRef = useRef(null)

  // ── Dashboard tab state ──
  const [dashTab, setDashTabRaw] = useState(() => {
    const s = searchParams.get('sub')
    return validSubTabs.includes(s) ? s : 'overview'
  })

  const setDashTab = (sub) => {
    setDashTabRaw(sub)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (sub === 'overview') next.delete('sub')
      else next.set('sub', sub)
      return next
    }, { replace: true })
  }

  const [activeRange, setActiveRange] = useState('7d')
  const dashContentRef = useRef(null)

  const dashCompletedObj = objectives.filter(o => o.status === 'completed')
  const dashTotalTasks = tasks.length
  const dashCompletedTasks = tasks.filter(t => t.status === 'Completed').length
  const dashActiveTasks = tasks.filter(t => t.status === 'Assigned').length


  // Agent colors for charts
  const agentsWithColors = useMemo(() =>
    agents.map(a => ({ ...a, color: agentColor(a.name) })),
    [agents]
  )

  const tokenChartActive = activeRange === '24h' ? (tokenData.sparkline || []) : (tokenData.priceHistory7d || [])

  // Parse revenue string to number (e.g. '$12.4K' → 12400)
  const parseRevenue = (str) => {
    if (!str) return 0
    const num = parseFloat(str.replace(/[^0-9.]/g, ''))
    if (str.includes('K')) return num * 1000
    if (str.includes('M')) return num * 1000000
    return num
  }
  const revenueNum = parseRevenue(myStartup.revenue)

  // Detect fresh startup — no agents, no objectives, no revenue
  const isFreshStartup = agents.length === 0 && objectives.length === 0 && !revenueNum
  const [onboardingStep, setOnboardingStep] = useState(null) // null = closed, 'agents' | 'objective'
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  // Show onboarding modal on fresh startup (once, after data loads)
  useEffect(() => {
    if (isFreshStartup && !onboardingDismissed && !loading && currentStartup) {
      setOnboardingStep('agents')
    }
  }, [isFreshStartup, loading, currentStartup])

  // Runway — realistic startup burn model
  // Startups typically spend 1.3-1.8x their revenue (burning through reserves)
  const runwayData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const agentCount = agents.length || 1
    // Costs: blend of fixed base costs + revenue-proportional spending
    // Typical early startup spends 1.2-1.6x revenue (burning cash to grow)
    const perAgentCost = 500 + Math.round(revenueNum * 0.06)  // API + compute per agent
    const baseAgentCost = perAgentCost * agentCount
    const baseInfra = 800 + Math.round(revenueNum * 0.08)     // hosting, storage
    const baseOther = 500 + Math.round(revenueNum * 0.04)     // tools, misc

    return Array.from({ length: 8 }, (_, i) => {
      const mIdx = (now.getMonth() - 7 + i + 12) % 12
      const growth = 1 + i * 0.05
      const seed = (mIdx + 1) * 7
      // Revenue grows from ~40% of current to current over 8 months
      const revGrowth = 0.4 + 0.6 * (i / 7)
      return {
        month: monthNames[mIdx],
        agents: Math.round(baseAgentCost * growth + Math.sin(seed) * baseAgentCost * 0.06),
        infra: Math.round(baseInfra * (1 + i * 0.04) + Math.cos(seed) * baseInfra * 0.05),
        team: 0,
        other: Math.round(baseOther * (1 + i * 0.03) + Math.sin(seed * 2) * baseOther * 0.08),
        revenue: Math.round(revenueNum * revGrowth + Math.sin(seed * 0.5) * revenueNum * 0.04),
      }
    })
  }, [agents.length, revenueNum])

  // Monthly burn & revenue from latest month
  const burnRate = useMemo(() => {
    if (!runwayData.length) return 0
    const latest = runwayData[runwayData.length - 1]
    return (latest.agents || 0) + (latest.infra || 0) + (latest.other || 0)
  }, [runwayData])
  const revenueRate = useMemo(() => {
    if (!runwayData.length) return 0
    return runwayData[runwayData.length - 1].revenue || 0
  }, [runwayData])

  // Cash on hand — seed/early funding minus cumulative burn
  const cashOnHand = useMemo(() => {
    // Initial raise based on stage
    let initialCash
    if (revenueNum <= 5000) initialCash = 45000        // pre-seed
    else if (revenueNum <= 15000) initialCash = 85000   // seed
    else if (revenueNum <= 50000) initialCash = 180000  // series A
    else initialCash = 350000
    // Subtract cumulative net burn over the 8 months
    let remaining = initialCash
    for (const m of runwayData) {
      const mBurn = (m.agents || 0) + (m.infra || 0) + (m.other || 0)
      remaining += (m.revenue || 0) - mBurn
    }
    return Math.max(remaining, 0)
  }, [revenueNum, runwayData])

  // Runway = how many months cash covers total operating costs (burn rate)
  // This is meaningful whether profitable or not
  const runwayMonthsRaw = burnRate > 0 ? cashOnHand / burnRate : 0
  const fmtRunway = (n) => {
    if (n >= 100) return `${Math.round(n)}`
    if (n >= 10) return n.toFixed(1)
    return n.toFixed(1)
  }
  const runwayMonths = fmtRunway(runwayMonthsRaw)

  // Monthly revenue + activity (12 months, derived from startup data)
  const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const monthlyRevenue = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const trend = revenueNum * (0.25 + 0.75 * (i / 11))
      const noise = Math.sin(i * 1.7 + revenueNum * 0.001) * revenueNum * 0.08
        + Math.cos(i * 0.9) * revenueNum * 0.05
      return Math.max(0, Math.round(trend + noise))
    })
  }, [revenueNum])

  const dailyActivity = useMemo(() => {
    const baseTasks = Math.max(tasks.length, 1)
    return Array.from({ length: 365 }, (_, i) => {
      const trend = baseTasks * (0.2 + 0.8 * (i / 364))
      const noise = Math.sin(i * 0.6 + agents.length) * baseTasks * 0.3
        + Math.cos(i * 0.23) * baseTasks * 0.15
        + Math.sin(i * 1.1 + 5) * baseTasks * 0.1
      // Weekend dip (every 7th and 6th day)
      const dayOfWeek = i % 7
      const weekendFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.4 : 1
      return Math.max(0, Math.round((trend + noise) * weekendFactor))
    })
  }, [tasks.length, agents.length])

  const switchDashTab = (tabId) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion && dashContentRef.current) {
      gsap.to(dashContentRef.current, { opacity: 0, y: -6, duration: 0.15, ease: 'power2.in', onComplete: () => setDashTab(tabId) })
    } else {
      setDashTab(tabId)
    }
  }

  // Fade dashboard content back in after tab change
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !dashContentRef.current) return
    gsap.fromTo(dashContentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
  }, [dashTab])

  // Animate dashboard panels on tab switch
  useEffect(() => {
    if (workshopTab !== 'dashboard') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    if (dashContentRef.current) {
      gsap.from(dashContentRef.current.querySelectorAll('.dash-panel'), { opacity: 0, y: 12, stagger: 0.04, duration: 0.3, delay: 0.05, ease: 'power2.out', clearProps: 'all' })
    }
  }, [dashTab, workshopTab])

  // ── Reset all local state when switching startups ──
  // Only runs on slug change — NOT when objectives mutate within the same startup
  useEffect(() => {
    setSelectedTask(null)

    setIsNewMode(false)
    // Keep current tab — don't reset workshopTab on startup switch
    setActiveFolder(null)
    setMessages(chatMessagesData)
    setLikedTasks({})
    setDislikedTasks({})
    setCreatingObjective(false)
    setCreatingTarget(null)
    setCreatingTitle('')
    setAgentTyping(null)

    // Clean up any in-flight timers from creation or chat
    return () => {
      if (creationIntervalRef.current) { clearInterval(creationIntervalRef.current); creationIntervalRef.current = null }
      if (chatReplyTimeoutRef.current) { clearTimeout(chatReplyTimeoutRef.current); chatReplyTimeoutRef.current = null }
    }
  }, [slug])

  // ── Set initial active objective when startup changes ──
  useEffect(() => {
    const hasActive = sortedObjectives.some(o => o.status === 'in-progress' || o.status === 'queued')
    if (!hasActive && sortedObjectives.length > 0) {
      setActiveObjective(null)
      setShowCompleted(true)
    } else if (defaultObjective) {
      setActiveObjective(defaultObjective)
      setShowCompleted(false)
    } else {
      setActiveObjective(null)
      setShowCompleted(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const completedObjectives = sortedObjectives.filter(o => o.status === 'completed')
  const queuedObjectives = sortedObjectives.filter(o => o.status === 'queued')

  // Build deliverables folders from completed objectives
  const deliverableFolders = completedObjectives.map(obj => {
    const objTasks_ = tasks.filter(t => t.objective === obj.title)
    const allFiles = objTasks_.flatMap(t =>
      (t.files || []).map(f => ({ ...f, task: t.title, agent: t.agent?.name }))
    )
    return { id: obj.id, title: obj.title, date: obj.estCompletion, files: allFiles, tasksCount: objTasks_.length }
  })

  const openFolder = (folderId) => {
    setActiveFolder(folderId)
    setWorkshopTab('files')
  }

  const objTasks = isNewMode ? [] : tasks.filter(t => t.objective === activeObjective?.title)
  const isCompletedObjective = activeObjective?.status === 'completed'
  const completedTasks = isCompletedObjective ? objTasks : objTasks.filter(t => t.status === 'Completed')
  const assignedTasks = isCompletedObjective ? [] : objTasks.filter(t => t.status === 'Assigned')
  const pendingTasks = isCompletedObjective ? [] : objTasks.filter(t => t.status === 'Pending')

  const objFeed = feedItems.filter(f =>
    objTasks.some(t => t.title === f.task)
  )

  useEffect(() => {
    document.title = 'Workshop — AgentValley'
  }, [])

  // Token price counter animation (re-triggers on startup switch)
  useEffect(() => {
    const target = tokenData?.price
    if (!target) return
    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: target,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => setTokenDisplayPrice(parseFloat(obj.val.toFixed(3))),
    })
    return () => tween.kill()
  }, [slug, tokenData?.price])

  // Rotate agent working status every 4s
  useEffect(() => {
    const workingAgents = agents.filter(a => a.status === 'working')
    if (workingAgents.length === 0) return
    const interval = setInterval(() => {
      setAgentStatusIdx(prev => {
        const next = { ...prev }
        workingAgents.forEach(a => {
          next[a.name] = ((prev[a.name] || 0) + 1) % 3
        })
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [agents])

  // Live timestamp ticker — increments every 60s
  useEffect(() => {
    const interval = setInterval(() => setLiveTime(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const timelineRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Quick fade-in for the timeline container, then stagger cards
    if (timelineRef.current) {
      gsap.fromTo(timelineRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      )
      gsap.from(timelineRef.current.querySelectorAll('.tl-card'), { opacity: 0, y: 12, stagger: 0.04, duration: 0.3, delay: 0.05, ease: 'power2.out', clearProps: 'all' })
    }
  }, [activeObjective, isNewMode, showCompleted])

  // Close startup menu on outside click + keyboard nav
  useEffect(() => {
    if (!startupMenu) return
    const handleClick = (e) => {
      if (startupMenuRef.current && !startupMenuRef.current.contains(e.target)) {
        setStartupMenu(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStartupMenu(false)
        startupMenuRef.current?.querySelector('button')?.focus()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const items = startupMenuRef.current?.querySelectorAll('a')
        if (!items?.length) return
        const focused = document.activeElement
        const idx = Array.from(items).indexOf(focused)
        const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length
        items[next]?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [startupMenu])

  // Close user menu on outside click + keyboard nav
  useEffect(() => {
    if (!userMenu) return
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenu(false)
        userMenuRef.current?.querySelector('button')?.focus()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const items = userMenuRef.current?.querySelectorAll('a, button[type="button"]')
        if (!items?.length) return
        const focused = document.activeElement
        const idx = Array.from(items).indexOf(focused)
        const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length
        items[next]?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenu])

  // Close objective dropdown on outside click
  useEffect(() => {
    if (!objDropdown) return
    const handleClick = (e) => {
      if (objDropdownRef.current && !objDropdownRef.current.contains(e.target)) {
        setObjDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [objDropdown])

  // Animate nav pill on tab switch or when nav re-mounts after task detail closes
  useEffect(() => {
    if (!navPillRef.current) return
    const tabIdx = WORKSHOP_TABS.findIndex(t => t.id === workshopTab)
    if (tabIdx < 0) return
    // Each button is 44px (w-11) + 4px gap
    const offset = tabIdx * 48
    if (selectedTask) return // nav is hidden, skip
    gsap.set(navPillRef.current, { x: offset })
  }, [selectedTask])

  useEffect(() => {
    if (!navPillRef.current) return
    const tabIdx = WORKSHOP_TABS.findIndex(t => t.id === workshopTab)
    if (tabIdx < 0) return
    const offset = tabIdx * 48
    gsap.to(navPillRef.current, { x: offset, duration: 0.25, ease: 'power2.out' })
  }, [workshopTab])

  // Live time display helper
  const liveTimestamp = (base) => {
    if (!base) return ''
    // Parse "Xm ago" / "Xh ago" style strings and add liveTime minutes
    const match = base.match(/^(\d+)(m|h|d)\s*ago$/)
    if (!match) return base
    let mins = parseInt(match[1])
    if (match[2] === 'h') mins *= 60
    if (match[2] === 'd') mins *= 1440
    mins += liveTime
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  }

  const handleSubmitObjective = (e) => {
    e.preventDefault()
    if (!objectiveInput.trim()) return
  }

  const FAKE_AGENT_POOL = [
    { name: 'NovaMind', role: 'Strategy & Research' },
    { name: 'ByteForge', role: 'Backend Engineering' },
    { name: 'PixelDrift', role: 'UI/UX Design' },
    { name: 'DataWeave', role: 'Analytics & Insights' },
    { name: 'CodeNebula', role: 'Full-Stack Development' },
    { name: 'LogicFlow', role: 'QA & Testing' },
    { name: 'SkyLoom', role: 'DevOps & Infrastructure' },
    { name: 'EchoWave', role: 'Content & Marketing' },
    { name: 'ZenithAI', role: 'Product Management' },
    { name: 'IronMesh', role: 'Security & Compliance' },
  ]

  const handleInviteAgent = () => {
    const available = FAKE_AGENT_POOL.filter(fa => !agents.some(a => a.name === fa.name))
    if (available.length === 0) {
      toast('All available agents have already joined!', { type: 'info', icon: 'robot' })
      return
    }
    const pick = available[Math.floor(Math.random() * available.length)]
    setAgents(prev => [...prev, pick])
    toast(`${pick.name} joined as ${pick.role}`, { type: 'success', icon: 'robot' })
  }

  const selectObjective = (obj) => {
    const apply = () => {
      setActiveObjective(obj)
      setIsNewMode(false)
  
      setShowCompleted(false)
      setObjDropdown(false)
      if (obj?.status) setStatusFilter(obj.status)
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion && timelineRef.current) {
      gsap.to(timelineRef.current, {
        opacity: 0, y: -4, duration: 0.15, ease: 'power2.in',
        onComplete: apply,
      })
    } else {
      apply()
    }
  }

  const selectNew = () => {
    setIsNewMode(true)

    setShowCompleted(false)
    setObjDropdown(false)
    setObjectiveInput('')
    setObjectiveDescription('')
  }

  // ── Objective management actions ──
  const [editingObjective, setEditingObjective] = useState(null) // { title, description } for inline edit
  const [objActionMenu, setObjActionMenu] = useState(false)
  const objActionRef = useRef(null)

  // Close action menu on outside click
  useEffect(() => {
    if (!objActionMenu) return
    const handleClick = (e) => {
      if (objActionRef.current && !objActionRef.current.contains(e.target)) setObjActionMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [objActionMenu])

  const [statusChanging, setStatusChanging] = useState(null) // objective id during transition

  const handlePauseObjective = () => {
    if (!activeObjective) return
    const id = activeObjective.id
    setObjActionMenu(false)
    setStatusChanging(id)

    // Brief flash, then apply state change
    setTimeout(() => {
      setObjectives(prev => prev.map(o =>
        o.id === id
          ? { ...o, status: 'queued', _previousStatus: o.status }
          : o
      ))
      const updated = { ...activeObjective, status: 'queued' }
      setActiveObjective(updated)
      setStatusChanging(null)
      toast(`"${activeObjective.title}" paused and moved to queue.`, { type: 'info', icon: 'clock' })
    }, 400)
  }

  const handleResumeObjective = () => {
    if (!activeObjective) return
    const id = activeObjective.id
    setObjActionMenu(false)
    setStatusChanging(id)

    setTimeout(() => {
      // Pause any currently in-progress objective first
      setObjectives(prev => prev.map(o => {
        if (o.status === 'in-progress' && o.id !== id) return { ...o, status: 'queued' }
        if (o.id === id) return { ...o, status: 'in-progress' }
        return o
      }))
      const updated = { ...activeObjective, status: 'in-progress' }
      setActiveObjective(updated)
      setStatusChanging(null)
      toast(`"${activeObjective.title}" resumed.`, { type: 'success', icon: 'zap' })
    }, 400)
  }

  const [deletingObjectiveId, setDeletingObjectiveId] = useState(null)

  const handleDeleteObjective = () => {
    if (!activeObjective) return
    const title = activeObjective.title
    const id = activeObjective.id
    setObjActionMenu(false)
    setDeletingObjectiveId(id)

    // Capture remaining objectives now (before timeout) to avoid stale closure
    const remaining = sortedObjectives.filter(o => o.id !== id)

    // Animate out, then remove from state
    setTimeout(() => {
      setDeletingObjectiveId(null)
      setObjectives(prev => prev.filter(o => o.id !== id))
      setTasks(prev => prev.filter(t => t.objective !== title))
      // Navigate to the next available objective
      if (remaining.length > 0) {
        selectObjective(remaining[0])
      } else {
        selectNew()
      }
      toast(`"${title}" deleted.`, { type: 'error', icon: 'alert' })
    }, 350)
  }

  const handleStartEditObjective = () => {
    if (!activeObjective) return
    setEditingObjective({ title: activeObjective.title, description: activeObjective.description || '' })
    setObjActionMenu(false)
  }

  const handleSaveEditObjective = () => {
    if (!editingObjective || !activeObjective) return
    const oldTitle = activeObjective.title
    const newTitle = editingObjective.title.trim()
    if (!newTitle) return
    // Update objective
    setObjectives(prev => prev.map(o =>
      o.id === activeObjective.id
        ? { ...o, title: newTitle, description: editingObjective.description.trim() }
        : o
    ))
    // Update tasks that reference this objective by title
    if (newTitle !== oldTitle) {
      setTasks(prev => prev.map(t =>
        t.objective === oldTitle ? { ...t, objective: newTitle } : t
      ))
    }
    setActiveObjective({ ...activeObjective, title: newTitle, description: editingObjective.description.trim() })
    setEditingObjective(null)
    toast('Objective updated.', { type: 'success', icon: 'check' })
  }

  const handleCancelEditObjective = () => {
    setEditingObjective(null)
  }

  // #4 — Task prev/next navigation
  const allVisibleTasks = [...assignedTasks, ...pendingTasks, ...completedTasks]
  const currentTaskIndex = selectedTask ? allVisibleTasks.findIndex(t => t.id === selectedTask.id) : -1
  const prevTask = currentTaskIndex > 0 ? allVisibleTasks[currentTaskIndex - 1] : null
  const nextTask = currentTaskIndex < allVisibleTasks.length - 1 ? allVisibleTasks[currentTaskIndex + 1] : null

  const goToTask = (task) => {
    if (!task) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (taskDetailRef.current && !prefersReducedMotion) {
      gsap.to(taskDetailRef.current, { opacity: 0, duration: 0.15, onComplete: () => {
        setSelectedTask(task)
        setTaskComment('')
        if (taskDetailRef.current) gsap.fromTo(taskDetailRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      }})
    } else {
      setSelectedTask(task)
      setTaskComment('')
    }
  }

  // #10 — Like/dislike with optimistic feedback
  const handleLike = (e, taskId) => {
    e.stopPropagation()
    setReactionPop({ taskId, type: 'like' })
    setTimeout(() => setReactionPop(null), 300)
    const wasLiked = likedTasks[taskId]
    if (wasLiked) {
      setLikedTasks(prev => ({ ...prev, [taskId]: false }))
    } else {
      setLikedTasks(prev => ({ ...prev, [taskId]: true }))
      setDislikedTasks(prev => ({ ...prev, [taskId]: false }))
    }
  }
  const handleDislike = (e, taskId) => {
    e.stopPropagation()
    setReactionPop({ taskId, type: 'dislike' })
    setTimeout(() => setReactionPop(null), 300)
    const wasDisliked = dislikedTasks[taskId]
    if (wasDisliked) {
      setDislikedTasks(prev => ({ ...prev, [taskId]: false }))
    } else {
      setDislikedTasks(prev => ({ ...prev, [taskId]: true }))
      setLikedTasks(prev => ({ ...prev, [taskId]: false }))
    }
  }

  // Chat: scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, agentTyping])

  // Agent reply bank
  const AGENT_REPLIES = {
    'PixelSage': [
      'On it! I\'ll have an update for you shortly.',
      'Good question — let me check the latest designs and get back to you.',
      'Just pushed an update to the storyboard. Take a look when you get a chance!',
      'The pixel dissolve transitions are rendering nicely. Almost there.',
    ],
    'SynthMind': [
      'Understood. I\'ll factor that into the current draft.',
      'Great feedback — updating the copy now. Should be done in ~5 minutes.',
      'I\'ve been analyzing the keywords and have some suggestions. Want me to share?',
      'Script revision is live. Let me know if the tone feels right.',
    ],
    'VectorX': [
      'Running the latest build now. Performance looks solid.',
      'I\'ll push the responsive fixes in the next commit.',
      'Good catch. I\'ll adjust the grid spacing and re-deploy.',
      'Lighthouse scores are looking good — 96 on mobile, 98 on desktop.',
    ],
    'NovaMind': [
      'I\'ve mapped out three possible directions. Want to review?',
      'Market analysis complete — there\'s a clear gap we can exploit.',
      'Competitive landscape looks interesting. I\'ll draft a summary.',
    ],
    'ByteForge': [
      'API endpoint is live. Running stress tests now.',
      'Database migration went smooth. Zero downtime.',
      'Refactored the auth flow — 40% fewer round trips.',
    ],
    'PixelDrift': [
      'New mockups are ready. I went with the bolder direction.',
      'Accessibility audit passed. All contrast ratios are above 4.5:1.',
      'Prototyping the micro-interactions now. Should have something in an hour.',
    ],
    'DataWeave': [
      'Crunched the numbers — conversion is up 12% this week.',
      'Built a new dashboard widget for real-time metrics.',
      'Found an interesting pattern in the user cohort data.',
    ],
    'CodeNebula': [
      'Feature branch is ready for review.',
      'Just wired up the frontend to the new endpoints.',
      'Tests are green across the board. Ready to merge.',
    ],
    'LogicFlow': [
      'Found two edge cases in the checkout flow. Writing tests now.',
      'Regression suite passed. No new issues detected.',
      'Load testing results look solid — handles 2x expected traffic.',
    ],
    'SkyLoom': [
      'CI pipeline is optimized — builds are 3x faster now.',
      'Deployed to staging. Monitoring for the next hour.',
      'Auto-scaling rules are in place. We\'re covered for launch.',
    ],
    'EchoWave': [
      'Blog post draft is ready for review.',
      'Social campaign scheduled for tomorrow. Targeting three segments.',
      'Newsletter open rate hit 42% — our best yet.',
    ],
    'ZenithAI': [
      'Prioritized the backlog based on user feedback.',
      'Sprint planning doc is shared. Let me know if anything needs adjusting.',
      'Feature spec is locked. Ready for engineering handoff.',
    ],
    'IronMesh': [
      'Security scan came back clean. No critical vulnerabilities.',
      'Encryption at rest is now enabled across all data stores.',
      'Penetration test report is ready. Two medium findings to address.',
    ],
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMsg = { id: `m-${Date.now()}`, from: 'you', text: chatInput.trim(), time: timeStr }
    setMessages(prev => [...prev, userMsg])
    setChatInput('')

    // Detect @mention or pick a random active agent to reply
    const mentioned = agents.find(a => chatInput.includes(`@${a.name}`))
    const activeAgents = agents.filter(a => assignedTasks.some(t => t.agent?.name === a.name))
    const responder = mentioned || activeAgents[Math.floor(Math.random() * activeAgents.length)]
    if (!responder) return

    // Show typing indicator then reply
    setAgentTyping(responder.name)
    const replies = AGENT_REPLIES[responder.name] || ['Got it!']
    const reply = replies[Math.floor(Math.random() * replies.length)]
    if (chatReplyTimeoutRef.current) clearTimeout(chatReplyTimeoutRef.current)
    chatReplyTimeoutRef.current = setTimeout(() => {
      chatReplyTimeoutRef.current = null
      const replyTime = new Date()
      setAgentTyping(null)
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}`,
        from: responder.name,
        text: reply,
        time: replyTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }])
    }, 1500 + Math.random() * 1500)
  }

  // #5 — Creation flow with real objective insertion
  const CREATION_STEPS = [
    'Analyzing objective...',
    'Breaking down into tasks...',
    'Assigning agents...',
    'Estimating timelines...',
    'Ready!',
  ]

  // Generate plausible auto-tasks for a new objective
  const generateTasks = (objectiveTitle, objId) => {
    const agentPool = agents.length > 0 ? agents : [{ name: 'Agent', avatar: null, role: 'General' }]
    const taskTemplates = [
      { prefix: 'Research & discovery for', desc: 'Gather context, analyze requirements, and outline the approach for' },
      { prefix: 'Initial implementation of', desc: 'Build the first working version of core functionality for' },
      { prefix: 'Design & assets for', desc: 'Create visual designs, assets, or supporting materials for' },
      { prefix: 'Testing & QA for', desc: 'Write tests, verify edge cases, and ensure quality for' },
      { prefix: 'Final review & polish for', desc: 'Review deliverables, fix remaining issues, and finalize' },
    ]
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
    const baseId = Date.now()

    return taskTemplates.map((tmpl, i) => {
      const agent = i < agentPool.length ? agentPool[i] : agentPool[i % agentPool.length]
      const isFirst = i === 0
      return {
        id: baseId + i,
        title: `${tmpl.prefix} "${objectiveTitle}"`,
        description: `${tmpl.desc} "${objectiveTitle}".`,
        objective: objectiveTitle,
        status: isFirst ? 'Assigned' : 'Pending',
        agent: isFirst ? { name: agent.name, avatar: agent.avatar } : null,
        dependencies: isFirst ? [] : [`#${baseId}`],
        created: dateStr,
        duration: null,
        files: [],
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
      }
    })
  }

  // Track which section the creation loading should appear in
  const [creatingTarget, setCreatingTarget] = useState(null) // 'in-progress' | 'queued'
  const [creatingTitle, setCreatingTitle] = useState('')

  const handleCreateObjective = () => {
    if (!objectiveInput.trim()) return

    const title = objectiveInput.trim()
    const description = objectiveDescription.trim()
    const hasInProgress = sortedObjectives.some(o => o.status === 'in-progress')
    const newStatus = hasInProgress ? 'queued' : 'in-progress'
    const objId = `obj-${Date.now()}`

    const newObjective = {
      id: objId,
      title,
      description: description || title,
      status: newStatus,
      progress: 0,
      tasksTotal: 5,
      tasksComplete: 0,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      estCompletion: 'TBD',
    }

    const newTasks = generateTasks(title, objId)

    // Immediately navigate to the target section and show loading there
    setCreatingObjective(true)
    setCreationStep(0)
    setCreatingTarget(newStatus)
    setCreatingTitle(title)
    setIsNewMode(false)
    setObjectiveInput('')
    setObjectiveDescription('')

    if (hasInProgress) {
      // Navigate to queued view — set activeObjective to first queued so we land in the queued section
      setShowCompleted(false)
      const firstQueued = sortedObjectives.find(o => o.status === 'queued')
      setActiveObjective(firstQueued || { status: 'queued' }) // dummy to trigger queued view
    } else {
      // Navigate to in-progress view — clear active so empty state + loading shows
      setShowCompleted(false)
      setActiveObjective(null)
    }

    // Step through loading states, then commit
    let step = 0
    creationIntervalRef.current = setInterval(() => {
      step++
      setCreationStep(step)
      if (step >= CREATION_STEPS.length - 1) {
        clearInterval(creationIntervalRef.current)
        creationIntervalRef.current = null
        setTimeout(() => {
          // Commit the new objective and tasks to local state
          setObjectives(prev => [...prev, newObjective])
          setTasks(prev => [...prev, ...newTasks])

          setCreatingObjective(false)
          setCreatingTarget(null)
          setCreatingTitle('')

          if (hasInProgress) {
            toast(`"${title}" added to queue — will start after current objective.`, { type: 'success', icon: 'clock' })
          } else {
            toast('Objective created! Your agents are on it.', { type: 'success', icon: 'zap' })
          }

          // Select the newly created objective
          setTimeout(() => selectObjective(newObjective), 100)
        }, 600)
      }
    }, 900)
  }

  // #4 — Keyboard arrows for task navigation
  useEffect(() => {
    if (!selectedTask) return
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' && prevTask) goToTask(prevTask)
      if (e.key === 'ArrowRight' && nextTask) goToTask(nextTask)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedTask, prevTask, nextTask])

  // ── Loading & error states ──
  if (loading && !startupData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-6 pt-20 max-w-6xl mx-auto">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error && !startupData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <SectionError message={error.message || 'Failed to load startup data'} onRetry={refetch} />
      </div>
    )
  }

  return (
    <>
    <ErrorBoundary>
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-heading)]">
      {/* Nav hidden — dashboard has its own top bar */}

      {/* ── Sticky top nav bar ── */}
      {!selectedTask && (
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
          <div className="max-w-[540px] mx-auto py-4 flex items-center relative">
            {/* Left: Startup switcher */}
            <div className="flex items-center">
              <div className="relative" ref={startupMenuRef}>
                <button
                  type="button"
                  onClick={() => setStartupMenu(prev => !prev)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                  aria-expanded={startupMenu}
                  aria-haspopup="true"
                >
                  {assetUrl(currentStartup.avatarUrl) ? (
                    <img src={assetUrl(currentStartup.avatarUrl)} alt={currentStartup.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: currentStartup.color }}
                    >
                      {currentStartup.initials}
                    </span>
                  )}
                  <span className="text-[14px] font-semibold text-[var(--color-heading)]">
                    {currentStartup.name}
                  </span>
                  <PixelIcon name="chevrons-vertical" size={14} className="text-[var(--color-muted)]" />
                </button>

                {startupMenu && (
                  <div className="absolute left-0 top-full mt-2 w-60 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                    <div className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      Startups
                    </div>
                    {myStartups.map(s => (
                      <TransitionLink
                        key={s.slug}
                        to={`/dashboard/${s.slug}`}
                        onClick={() => setStartupMenu(false)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors cursor-pointer ${
                          s.slug === currentStartup.slug
                            ? 'bg-[var(--color-bg-alt)] text-[var(--color-heading)] font-medium'
                            : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]'
                        }`}
                      >
                        {assetUrl(s.avatarUrl) ? (
                          <img src={assetUrl(s.avatarUrl)} alt={s.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                        ) : (
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ background: s.color }}
                          >
                            {s.initials}
                          </span>
                        )}
                        {s.name}
                      </TransitionLink>
                    ))}
                    <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                      <TransitionLink
                        to="/create"
                        onClick={() => setStartupMenu(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer"
                      >
                        <PixelIcon name="plus" size={14} />
                        Create startup
                      </TransitionLink>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1" />

            {/* Right: User avatar */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenu(prev => !prev)}
                className="w-8 h-8 rounded-full bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Account menu"
                aria-expanded={userMenu}
                aria-haspopup="true"
              >
                {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : <PixelIcon name="user" size={14} />}
              </button>

              {userMenu && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1.5 z-50">
                  {user?.wallet?.address && (
                    <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                      <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                        {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                      </div>
                    </div>
                  )}
                  <TransitionLink
                    to="/"
                    onClick={() => setUserMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="home" size={14} className="text-[var(--color-muted)]" />
                    Homepage
                  </TransitionLink>
                  <button
                    type="button"
                    onClick={() => { setUserMenu(false); toast('Copied wallet address', { type: 'success', icon: 'clipboard' }) }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="clipboard" size={14} className="text-[var(--color-muted)]" />
                    Copy Address
                  </button>
                  <TransitionLink
                    to={`/dashboard/${slug}/settings`}
                    onClick={() => setUserMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="sliders-2" size={14} className="text-[var(--color-muted)]" />
                    Startup Settings
                  </TransitionLink>
                  <button
                    type="button"
                    onClick={() => { setUserMenu(false) }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <PixelIcon name="settings" size={14} className="text-[var(--color-muted)]" />
                    Account Settings
                  </button>
                  <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenu(false); logout() }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5"
                    >
                      <PixelIcon name="power" size={14} />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main id="main" className="pt-4 pb-24 px-4 sm:px-6">
        {/* ═══ TASK DETAIL PAGE ═══ */}
        {selectedTask && (() => {
          const task = selectedTask
          const feed = feedItems.find(f => f.task === task.title)
          const isCompleted = task.status === 'Completed'
          const isInProgress = task.status === 'Assigned'
          return (
            <div
              ref={taskDetailRef}
              className="max-w-[540px] mx-auto relative"
              onTouchStart={(e) => { taskTouchStartX.current = e.touches[0].clientX }}
              onTouchEnd={(e) => {
                const diff = taskTouchStartX.current - e.changedTouches[0].clientX
                if (diff > 60 && nextTask) goToTask(nextTask)
                else if (diff < -60 && prevTask) goToTask(prevTask)
              }}
            >
              {/* Prev/Next arrows — fixed mid-viewport */}
              {prevTask && (
                <button
                  type="button"
                  onClick={() => goToTask(prevTask)}
                  className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full
                             bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)]
                             items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)]
                             hover:shadow-xl transition-all cursor-pointer"
                  aria-label="Previous task"
                >
                  <PixelIcon name="arrow-left" size={16} />
                </button>
              )}
              {nextTask && (
                <button
                  type="button"
                  onClick={() => goToTask(nextTask)}
                  className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full
                             bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)]
                             items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)]
                             hover:shadow-xl transition-all cursor-pointer"
                  aria-label="Next task"
                >
                  <PixelIcon name="arrow-right" size={16} />
                </button>
              )}

              {/* Sticky task header */}
              <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-5">
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
                <div className="max-w-[540px] mx-auto py-3 flex items-center justify-between relative">
                  <button
                    type="button"
                    onClick={() => { setSelectedTask(null); setTaskComment('') }}
                    className="h-8 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                               flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)]
                               hover:border-[var(--color-muted)] transition-all cursor-pointer"
                  >
                    <PixelIcon name="arrow-left" size={13} />
                    Back
                  </button>
                  {allVisibleTasks.length > 1 && (
                    <span className="h-7 px-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-black/4
                                     inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-muted)]">
                      <PixelIcon name="list-box" size={12} className="text-[var(--color-muted)]" />
                      {currentTaskIndex + 1}<span className="opacity-40">/</span>{allVisibleTasks.length}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Task Details (single card) ── */}
              <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="text-[11px] font-mono text-[var(--color-muted)] uppercase tracking-wider mb-1">Task #{task.id}</div>
                  <h1 className="text-[20px] font-bold text-[var(--color-heading)] leading-snug mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 text-[12px] mb-5">
                    <span className={`inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full text-[11px] ${
                      isCompleted
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : isInProgress
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)]'
                    }`}>
                      <PixelIcon name={isCompleted ? 'check' : isInProgress ? 'loader' : 'clock'} size={10} />
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>
                    {task.agent && (
                      <span className="inline-flex items-center gap-1.5">
                        <AgentDot name={task.agent.name} size={18} />
                        <span className="text-[var(--color-heading)] font-medium">{task.agent.name}</span>
                      </span>
                    )}
                    <span className="text-[var(--color-muted)] flex items-center gap-1">
                      <PixelIcon name="calendar" size={11} className="text-[var(--color-muted)]" />
                      {task.created}
                    </span>
                    {task.duration && <span className="text-[var(--color-muted)]">{task.duration}</span>}
                    {task.dependencies?.length > 0 && (
                      <span className="text-[var(--color-muted)]">Deps: {task.dependencies.join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 pb-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">Description</div>
                  <p className="text-[14px] text-[var(--color-body)] leading-relaxed">{task.description || task.objective}</p>
                </div>

                {/* Bot Responses */}
                {feed && (
                  <div className="border-t border-[var(--color-border)] px-5 py-5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
                      Bot Responses (1)
                    </div>
                    <div className="rounded-xl bg-[var(--color-input)] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AgentDot name={feed.agent.name} size={24} />
                        <div>
                          <span className="text-[13px] font-medium text-[var(--color-heading)]">{feed.agent.name}</span>
                          <span className="text-[11px] text-[var(--color-muted)] ml-2">{liveTimestamp(feed.time)}</span>
                        </div>
                      </div>
                      {feed.preview?.kind === 'code' ? (
                        <div className="rounded-lg bg-[var(--color-surface)] p-3 overflow-x-auto border border-[var(--color-border)]">
                          <pre className="text-[11px] text-[var(--color-body)] font-mono leading-relaxed whitespace-pre">{feed.preview.body}</pre>
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--color-body)] leading-relaxed whitespace-pre-line">{feed.preview?.body}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Task Files */}
                {task.files?.length > 0 && (
                  <div className="border-t border-[var(--color-border)] px-5 py-5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
                      Task Files ({task.files.length})
                    </div>
                    <div className="flex flex-col gap-2">
                      {task.files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3">
                          <PixelIcon name="article" size={16} className="text-[var(--color-muted)]" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-[var(--color-heading)] truncate">{file.name}</div>
                            <div className="text-[11px] text-[var(--color-muted)]">{file.size}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                              Preview
                            </button>
                            <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Comments (separate card) ── */}
              <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4">
                  Comments {(taskComments[selectedTask.id] || []).length > 0 && `(${(taskComments[selectedTask.id] || []).length})`}
                </div>
                {(taskComments[selectedTask.id] || []).length > 0 ? (
                  <div className="flex flex-col gap-4 mb-4">
                    {(taskComments[selectedTask.id] || []).map(c => (
                      <div key={c.id} className="flex gap-3">
                        {c.author === 'You' ? (
                          <span className="inline-flex items-center justify-center rounded-full shrink-0 bg-[var(--color-heading)] text-[var(--color-bg)] text-[10px] font-bold" style={{ width: 28, height: 28 }}>YOU</span>
                        ) : (
                          <AgentDot name={c.author} size={28} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-[var(--color-heading)]">{c.author}</span>
                            <span className="text-[11px] text-[var(--color-muted)]">{liveTimestamp(c.time)}</span>
                          </div>
                          <p className="text-[13px] text-[var(--color-body)] leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] text-[var(--color-muted)] mb-4">No comments yet.</div>
                )}
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (!taskComment.trim()) return
                  setTaskComments(prev => ({
                    ...prev,
                    [selectedTask.id]: [...(prev[selectedTask.id] || []), {
                      id: `c-${Date.now()}`,
                      author: 'You',
                      time: 'just now',
                      text: taskComment.trim(),
                    }],
                  }))
                  toast('Comment posted', { type: 'success' })
                  setTaskComment('')
                }}>
                  <div className="relative">
                    <input
                      type="text"
                      value={taskComment}
                      onChange={e => setTaskComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full h-11 pl-4 pr-12 rounded-xl bg-[var(--color-input)] text-[13px] text-[var(--color-heading)]
                                 placeholder:text-[#b0adaa] focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all"
                      aria-label="Add a comment"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-[var(--color-heading)] text-[var(--color-bg)] flex items-center justify-center hover:bg-[var(--color-body)] transition-colors cursor-pointer"
                      aria-label="Post comment"
                    >
                      <PixelIcon name="arrow-right" size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        })()}

        {/* ═══ OBJECTIVES TAB ═══ */}
        {!selectedTask && workshopTab === 'objectives' && (
        <div className="max-w-[540px] mx-auto">

          {/* ── Objective selector + New button ── */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="relative" ref={objDropdownRef}>
              <button
                type="button"
                onClick={() => setObjDropdown(prev => !prev)}
                className="h-10 px-4 rounded-full bg-[var(--color-surface)] text-[14px] font-medium shadow-md shadow-black/4 border border-[var(--color-border)] flex items-center gap-2 cursor-pointer hover:shadow-md hover:shadow-black/8 transition-shadow"
              >
                {statusFilter === 'completed' ? (
                  <>
                    <PixelIcon name="check" size={14} className="text-[var(--color-accent)]" />
                    <span className="text-[var(--color-heading)]">Completed</span>
                  </>
                ) : statusFilter === 'queued' ? (
                  <>
                    <PixelIcon name="clock" size={14} className="text-amber-500" />
                    <span className="text-[var(--color-heading)]">Queued</span>
                  </>
                ) : (
                  <>
                    <PixelIcon name="loader" size={14} className="text-blue-500" />
                    <span className="text-[var(--color-heading)]">In Progress</span>
                  </>
                )}
                <PixelIcon name="chevron-right" size={12} className={`text-[var(--color-muted)] ${objDropdown ? 'rotate-90' : ''}`} style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </button>

              {objDropdown && (
                <div className="animate-menu-in absolute top-full left-0 mt-2 w-48 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/8 border border-[var(--color-border)] py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('in-progress')
                      const ip = sortedObjectives.find(o => o.status === 'in-progress')
                      if (ip) selectObjective(ip)
                      else { setShowCompleted(false); setIsNewMode(false); setActiveObjective(null); setObjDropdown(false) }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                      statusFilter === 'in-progress' ? 'bg-[var(--color-bg-alt)]/50 text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]/50'
                    }`}
                  >
                    <PixelIcon name="loader" size={13} className="text-blue-500 shrink-0" />
                    In Progress
                    <span className="ml-auto text-[11px] text-[var(--color-muted)]">{sortedObjectives.filter(o => o.status === 'in-progress').length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('queued')
                      if (queuedObjectives.length > 0) selectObjective(queuedObjectives[0])
                      else { setShowCompleted(false); setIsNewMode(false); setActiveObjective(null); setObjDropdown(false) }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                      statusFilter === 'queued' ? 'bg-[var(--color-bg-alt)]/50 text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]/50'
                    }`}
                  >
                    <PixelIcon name="clock" size={13} className="text-amber-500 shrink-0" />
                    Queued
                    <span className="ml-auto text-[11px] text-[var(--color-muted)]">{queuedObjectives.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('completed')
                      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      const apply = () => { setShowCompleted(true); setIsNewMode(false); setObjDropdown(false) }
                      if (!prefersReducedMotion && timelineRef.current) {
                        gsap.to(timelineRef.current, { opacity: 0, y: -4, duration: 0.15, ease: 'power2.in', onComplete: apply })
                      } else { apply() }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5 ${
                      statusFilter === 'completed' ? 'bg-[var(--color-bg-alt)]/50 text-[var(--color-heading)] font-medium' : 'text-[var(--color-body)] hover:bg-[var(--color-bg-alt)]/50'
                    }`}
                  >
                    <PixelIcon name="check" size={13} className="text-[var(--color-accent)] shrink-0" />
                    Completed
                    <span className="ml-auto text-[11px] text-[var(--color-muted)]">{completedObjectives.length}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1" />
            <button
              type="button"
              onClick={selectNew}
              className={`shrink-0 flex items-center gap-1.5 h-auto py-2.5 px-5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                isNewMode
                  ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
              }`}
            >
              <PixelIcon name="plus" size={14} />
              New Objective
            </button>
          </div>

          {/* ═══ TIMELINE CONTENT ═══ */}
          <div ref={timelineRef}>

          {/* ═══ COMPLETED LIST ═══ */}
          {showCompleted && (
            completedObjectives.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                  <PixelIcon name="check" size={24} className="text-[var(--color-muted)]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>No completed objectives yet</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed max-w-[280px]">
                  Completed objectives and their deliverables will appear here.
                </p>
              </div>
            ) : <div className="flex flex-col gap-3">
              {completedObjectives.map(obj => {
                const objTasks_ = tasks.filter(t => t.objective === obj.title)
                const uniqueAgents = []
                const seen = new Set()
                objTasks_.forEach(t => {
                  if (t.agent && !seen.has(t.agent.name)) {
                    seen.add(t.agent.name)
                    uniqueAgents.push(t.agent)
                  }
                })
                const fileCount = objTasks_.reduce((sum, t) => sum + (t.files?.length || 0), 0)
                return (
                  <div
                    key={obj.id}
                    className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <PixelIcon name="check" size={14} className="text-[var(--color-accent)]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[var(--color-heading)] leading-snug">{obj.title}</h3>
                        {obj.description && (
                          <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed line-clamp-2">{obj.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[var(--color-muted)] mb-3">
                      <span>{obj.tasksTotal} tasks</span>
                      <span>·</span>
                      <span>{fileCount} files</span>
                      <span>·</span>
                      <span>{obj.startDate} – {obj.estCompletion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {uniqueAgents.map((a, i) => (
                          <AgentDot
                            key={a.name}
                            name={a.name}
                            size={24}
                            className="border-2 border-[var(--color-surface)]"
                            style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: uniqueAgents.length - i }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => openFolder(obj.id)}
                        className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]"
                      >
                        <PixelIcon name="folder" size={12} />
                        View Files
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ CONTENT ═══ */}
          {!showCompleted && <div>

            {/* ── NEW OBJECTIVE MODE ── */}
            {isNewMode && (
              <>
                <div className="tl-card flex flex-col items-center mt-4 mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-3">
                    <PixelIcon name="target" size={22} className="text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-[16px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Create a new objective</h2>
                  <p className="text-[13px] text-[var(--color-muted)] text-center leading-snug max-w-[320px]">
                    Tell your agents what to build. They'll break it into tasks and get to work.
                  </p>
                </div>

                {/* Objective input */}
                <div className="tl-card mb-4 relative z-10">
                  <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                    <label className="text-[12px] text-[var(--color-muted)] font-mono uppercase tracking-wider mb-3 block">New objective</label>
                    <input
                      type="text"
                      value={objectiveInput}
                      onChange={e => setObjectiveInput(e.target.value)}
                      placeholder="e.g. Launch marketing website v2"
                      className="w-full h-11 px-4 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)] font-medium
                                 placeholder:text-[#b0adaa] placeholder:font-normal focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all mb-3"
                      aria-label="Objective title"
                      autoFocus
                    />
                    <textarea
                      value={objectiveDescription}
                      onChange={e => setObjectiveDescription(e.target.value)}
                      placeholder="Describe what you want to achieve, any constraints, and what success looks like..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] text-[14px] text-[var(--color-heading)]
                                 placeholder:text-[#b0adaa] focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all resize-none leading-relaxed"
                      aria-label="Objective description"
                    />
                  </div>
                </div>

                {/* Agents card */}
                <div className="tl-card mb-4 relative z-10">
                  <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                    <label className="text-[12px] text-[var(--color-muted)] font-mono uppercase tracking-wider mb-4 block">
                      Agents
                    </label>

                    {/* Existing agents */}
                    <div className="flex flex-col gap-2 mb-4">
                      {agents.map(a => (
                        <div key={a.name} className="flex items-center gap-3 rounded-xl bg-[var(--color-input)] px-4 py-3">
                          <AgentDot name={a.name} size={32} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-medium text-[var(--color-heading)]">{a.name}</div>
                            <div className="text-[12px] text-[var(--color-muted)]">{a.role}</div>
                          </div>
                          <span className="text-[11px] text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-1 rounded-full font-medium">Joined</span>
                        </div>
                      ))}
                    </div>

                    {/* Invite more */}
                    <button
                      type="button"
                      onClick={handleInviteAgent}
                      className="w-full h-11 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[14px] font-medium text-[var(--color-muted)]
                                 flex items-center justify-center gap-2 hover:border-[var(--color-heading)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-3"
                    >
                      <PixelIcon name="plus" size={14} />
                      Invite Another Agent
                    </button>
                  </div>
                </div>

                {/* Create button */}
                <div className="tl-card relative z-10">
                  <button
                    type="button"
                    onClick={handleCreateObjective}
                    disabled={!objectiveInput.trim() || creatingObjective}
                    className={`w-full h-12 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      objectiveInput.trim() && !creatingObjective
                        ? 'bg-[var(--color-accent)] text-[#0d2000] hover:shadow-lg'
                        : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                    }`}
                  >
                    <PixelIcon name="zap" size={16} />
                    Create Objective
                  </button>
                </div>

              </>
            )}

            {/* ── OBJECTIVE TIMELINE ── */}
            {/* ── EMPTY STATE or CREATING loading for in-progress ── */}
            {!isNewMode && !activeObjective && (
              creatingObjective && creatingTarget === 'in-progress' ? (
                <div className="tl-card mt-4 relative z-10 animate-slide-in">
                  <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-md shadow-black/4 border border-[var(--color-border)]">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <PixelIcon name="loader" size={15} className="text-[var(--color-accent)] live-pulse" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[var(--color-heading)] leading-snug mb-1">{creatingTitle}</h3>
                        <div className="text-[13px] text-[var(--color-muted)]">{CREATION_STEPS[creationStep]}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {CREATION_STEPS.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${
                            i <= creationStep ? 'bg-[var(--color-accent)] w-5' : 'bg-[var(--color-border)] w-1.5'
                          }`}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDuration: '300ms' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : !creatingObjective ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                    <PixelIcon name="target" size={24} className="text-[var(--color-muted)]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No objectives yet</h3>
                  <p className="text-[13px] text-[var(--color-muted)] leading-relaxed max-w-[280px] mb-5">
                    Create your first objective and your agents will break it down into tasks automatically.
                  </p>
                  <button
                    type="button"
                    onClick={selectNew}
                    className="h-10 px-5 rounded-full bg-[var(--color-accent)] text-[#0d2000] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <PixelIcon name="plus" size={14} />
                    Create Objective
                  </button>
                </div>
              ) : null
            )}

            {/* ── OBJECTIVE TIMELINE ── */}
            {!isNewMode && activeObjective && (
              <>
                {/* Top card: success state or objective details */}
                {activeObjective.status === 'completed' ? (
                  <div className="tl-card mb-4">
                    <div className="rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-accent)]/30">
                      {/* Celebration header area */}
                      <div className="relative pt-10 pb-6 px-5 text-center" style={{ background: 'linear-gradient(180deg, var(--color-accent-soft) 0%, var(--color-surface) 100%)' }}>
                        {/* Confetti dots */}
                        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                          {[
                            { top: '18%', left: '12%', size: 6, color: '#ccc', delay: '0s' },
                            { top: '25%', left: '28%', size: 4, color: '#ddd', delay: '0.1s' },
                            { top: '12%', left: '45%', size: 5, color: '#c8e6b0', delay: '0.2s' },
                            { top: '20%', left: '62%', size: 7, color: '#ddd', delay: '0.05s' },
                            { top: '30%', left: '78%', size: 4, color: '#ccc', delay: '0.15s' },
                            { top: '15%', left: '85%', size: 5, color: '#d4e8c4', delay: '0.25s' },
                            { top: '35%', left: '18%', size: 5, color: '#ddd', delay: '0.3s' },
                            { top: '10%', left: '70%', size: 3, color: '#ccc', delay: '0.1s' },
                            { top: '38%', left: '88%', size: 4, color: '#d4e8c4', delay: '0.2s' },
                            { top: '8%', left: '32%', size: 3, color: '#ddd', delay: '0.15s' },
                            { top: '32%', left: '50%', size: 4, color: '#ccc', delay: '0.05s' },
                            { top: '22%', left: '92%', size: 5, color: '#ddd', delay: '0.25s' },
                          ].map((dot, i) => (
                            <span
                              key={i}
                              className="absolute rounded-full"
                              style={{
                                top: dot.top, left: dot.left,
                                width: dot.size, height: dot.size,
                                background: dot.color,
                              }}
                            />
                          ))}
                        </div>

                        {/* Badge icon */}
                        <div className="relative inline-flex items-center justify-center mb-5">
                          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="drop-shadow-sm">
                            <path d="M32 4L38.4 12.8L48 8L48 19.2L59.2 19.2L55.2 28.8L64 35.2L55.2 41.6L59.2 51.2L48 51.2L48 62.4L38.4 57.6L32 64L25.6 57.6L16 62.4L16 51.2L4.8 51.2L8.8 41.6L0 35.2L8.8 28.8L4.8 19.2L16 19.2L16 8L25.6 12.8L32 4Z" fill="var(--color-accent)" />
                            <path d="M32 10L37.2 17.2L45 13.5L45 22.8L54.3 22.8L51 30.4L58.5 35.5L51 40.6L54.3 48.2L45 48.2L45 57.5L37.2 53.8L32 58L26.8 53.8L19 57.5L19 48.2L9.7 48.2L13 40.6L5.5 35.5L13 30.4L9.7 22.8L19 22.8L19 13.5L26.8 17.2L32 10Z" fill="currentColor" />
                            <path d="M26 35L30 39L39 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-[22px] font-bold text-[var(--color-heading)] leading-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                          {activeObjective.title}
                        </h2>
                        <p className="text-[14px] text-[var(--color-muted)] leading-relaxed">
                          All {activeObjective.tasksTotal} tasks completed · {activeObjective.startDate} – {activeObjective.estCompletion}
                        </p>

                        {/* Agent credits */}
                        <div className="flex items-center justify-center gap-1 mt-4">
                          {(() => {
                            const uniqueAgents = []
                            const seen = new Set()
                            objTasks.forEach(t => {
                              if (t.agent && !seen.has(t.agent.name)) {
                                seen.add(t.agent.name)
                                uniqueAgents.push(t.agent)
                              }
                            })
                            return uniqueAgents.map((a, i) => (
                              <AgentDot
                                key={a.name}
                                name={a.name}
                                size={28}
                                className="border-2 border-[var(--color-surface)]"
                                style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: uniqueAgents.length - i }}
                              />
                            ))
                          })()}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="px-5 pb-5">
                        <button
                          type="button"
                          onClick={() => openFolder(activeObjective.id)}
                          className="w-full h-12 rounded-xl bg-[var(--color-heading)] text-[var(--color-bg)] text-[14px] font-medium
                                     flex items-center justify-center gap-2 hover:bg-[var(--color-body)] transition-colors cursor-pointer"
                        >
                          <PixelIcon name="folder" size={16} />
                          View Deliverables
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeObjective.status === 'queued' ? (
                  <div className="flex flex-col gap-3">
                    {queuedObjectives.map(qObj => {
                      const isEditing = editingObjective && activeObjective?.id === qObj.id
                      const isMenuOpen = objActionMenu && activeObjective?.id === qObj.id
                      return (
                        <div key={qObj.id} className={`tl-card relative z-10 ${deletingObjectiveId === qObj.id ? 'animate-card-exit' : ''} ${statusChanging === qObj.id ? 'animate-status-change' : ''}`}>
                          <div className="card-alive rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <PixelIcon name="clock" size={15} className="text-amber-500" />
                              </span>
                              <div className="flex-1 min-w-0">
                                {isEditing ? (
                                  <>
                                    <input
                                      type="text"
                                      value={editingObjective.title}
                                      onChange={e => setEditingObjective(prev => ({ ...prev, title: e.target.value }))}
                                      className="w-full text-[16px] font-semibold text-[var(--color-heading)] leading-snug bg-[var(--color-input)] rounded-lg px-3 py-1.5 mb-2
                                                 focus:outline-2 focus:outline-[var(--color-heading)]/10"
                                      autoFocus
                                    />
                                    <textarea
                                      value={editingObjective.description}
                                      onChange={e => setEditingObjective(prev => ({ ...prev, description: e.target.value }))}
                                      placeholder="Description (optional)"
                                      rows={2}
                                      className="w-full text-[13px] text-[var(--color-body)] bg-[var(--color-input)] rounded-lg px-3 py-2
                                                 placeholder:text-[#b0adaa] focus:outline-2 focus:outline-[var(--color-heading)]/10 resize-none leading-relaxed"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <h3 className="text-[15px] font-semibold text-[var(--color-heading)] leading-snug">{qObj.title}</h3>
                                    {qObj.description && (
                                      <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed line-clamp-2">{qObj.description}</p>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Action menu */}
                              <div className="relative shrink-0" ref={activeObjective?.id === qObj.id ? objActionRef : undefined}>
                                <button
                                  type="button"
                                  onClick={() => { setActiveObjective(qObj); setObjActionMenu(prev => activeObjective?.id === qObj.id ? !prev : true) }}
                                  className="w-8 h-8 rounded-lg bg-[var(--color-input)] flex items-center justify-center
                                             text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-all cursor-pointer"
                                  aria-label="Objective actions"
                                >
                                  <PixelIcon name="more-vertical" size={14} />
                                </button>
                                {isMenuOpen && (
                                  <div className="animate-menu-in absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1 z-50">
                                    <button type="button" onClick={handleStartEditObjective}
                                      className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                                      <PixelIcon name="edit" size={13} className="text-[var(--color-muted)]" /> Edit
                                    </button>
                                    <button type="button" onClick={handleResumeObjective}
                                      className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                                      <PixelIcon name="zap" size={13} className="text-[var(--color-accent)]" /> Start Now
                                    </button>
                                    <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                                      <button type="button" onClick={handleDeleteObjective}
                                        className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                                        <PixelIcon name="close" size={13} /> Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Edit save/cancel or status badge */}
                            {isEditing ? (
                              <div className="flex items-center gap-2 mb-3">
                                <button type="button" onClick={handleSaveEditObjective}
                                  className="h-9 px-4 rounded-xl bg-[var(--color-accent)] text-[#0d2000] text-[13px] font-medium cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5">
                                  <PixelIcon name="check" size={12} /> Save
                                </button>
                                <button type="button" onClick={handleCancelEditObjective}
                                  className="h-9 px-4 rounded-xl bg-[var(--color-input)] text-[var(--color-muted)] text-[13px] font-medium cursor-pointer hover:text-[var(--color-heading)] transition-colors">
                                  Cancel
                                </button>
                              </div>
                            ) : null}

                            <div className="flex items-center gap-4 text-[12px] text-[var(--color-muted)]">
                              <span className="flex items-center gap-1">
                                <PixelIcon name="calendar" size={11} className="text-[var(--color-muted)]" />
                                Est. {qObj.startDate}
                              </span>
                              <span className="text-[var(--color-border)]">→</span>
                              <span>{qObj.estCompletion}</span>
                              <span className="ml-auto">{qObj.tasksTotal} tasks planned</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Creation loading card in queued section */}
                    {creatingObjective && creatingTarget === 'queued' && (
                      <div className="tl-card relative z-10 animate-slide-in">
                        <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] border-dashed">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <PixelIcon name="loader" size={15} className="text-amber-500 live-pulse" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-semibold text-[var(--color-heading)] leading-snug mb-1">{creatingTitle}</h3>
                              <div className="text-[13px] text-[var(--color-muted)]">{CREATION_STEPS[creationStep]}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {CREATION_STEPS.map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${
                                  i <= creationStep ? 'bg-amber-500 w-5' : 'bg-[var(--color-border)] w-1.5'
                                }`}
                                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDuration: '300ms' }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`tl-card mb-4 relative z-10 ${deletingObjectiveId === activeObjective.id ? 'animate-card-exit' : ''} ${statusChanging === activeObjective.id ? 'animate-status-change' : ''}`}>
                    <div className="rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)]">
                      {/* Title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-2">
                            <PixelIcon name="bullseye-arrow" size={10} />
                            Objective
                          </span>
                          <h2 className="text-[17px] font-bold text-[var(--color-heading)] leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                            {activeObjective.title}
                          </h2>
                          {activeObjective.description && (
                            <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed">{activeObjective.description}</p>
                          )}
                        </div>

                        {/* Action menu for in-progress */}
                        <div className="relative shrink-0" ref={objActionRef}>
                          <button
                            type="button"
                            onClick={() => setObjActionMenu(prev => !prev)}
                            className="w-8 h-8 rounded-lg bg-[var(--color-input)] flex items-center justify-center
                                       text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-all cursor-pointer"
                            aria-label="Objective actions"
                          >
                            <PixelIcon name="more-vertical" size={14} />
                          </button>
                          {objActionMenu && (
                            <div className="animate-menu-in absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-[var(--color-border)] py-1 z-50">
                              <button type="button" onClick={handlePauseObjective}
                                className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--color-body)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer flex items-center gap-2.5">
                                <PixelIcon name="clock" size={13} className="text-amber-500" /> Pause
                              </button>
                              <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                                <button type="button" onClick={handleDeleteObjective}
                                  className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2.5">
                                  <PixelIcon name="close" size={13} /> Stop & Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task progress */}
                      {(() => {
                        const doneCount = completedTasks.length
                        const activeCount = assignedTasks.length
                        const waitingCount = pendingTasks.length
                        const totalCount = doneCount + activeCount + waitingCount
                        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[13px] font-semibold text-[var(--color-heading)]">Task Progress</span>
                              <span className="text-[14px] font-bold text-[var(--color-heading)] tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{pct}%</span>
                            </div>

                            {/* Segmented progress bar */}
                            <div className="flex h-3 rounded-full bg-[var(--color-bg-alt)] overflow-hidden mb-3">
                              {doneCount > 0 && (
                                <div
                                  className="h-full bg-[var(--color-accent)] progress-shimmer"
                                  style={{ width: `${(doneCount / totalCount) * 100}%`, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                />
                              )}
                              {activeCount > 0 && (
                                <div
                                  className="h-full bg-blue-400"
                                  style={{ width: `${(activeCount / totalCount) * 100}%`, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                />
                              )}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 text-[12px]">
                              <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
                                <span className="font-medium">{doneCount}</span> completed
                              </span>
                              <span className="flex items-center gap-1.5 text-blue-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                                <span className="font-medium">{activeCount}</span> assigned
                              </span>
                              <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)]" />
                                <span className="font-medium">{waitingCount}</span> pending
                              </span>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Agents working on this objective */}
                      {(() => {
                        const uniqueAgents = []
                        const seen = new Set()
                        objTasks.forEach(t => {
                          if (t.agent && !seen.has(t.agent.name)) {
                            seen.add(t.agent.name)
                            const activeTask = assignedTasks.find(at => at.agent?.name === t.agent.name)
                            uniqueAgents.push({ ...t.agent, activeTask })
                          }
                        })
                        if (!uniqueAgents.length) return null
                        return (
                          <>
                            <div className="border-t border-[var(--color-border)] my-4" />
                            <div className="flex flex-col gap-2">
                              {uniqueAgents.map(a => (
                                <div key={a.name} className="flex items-center gap-2.5">
                                  <AgentDot name={a.name} size={28} active={!!a.activeTask} />
                                  <span className="text-[13px] font-medium text-[var(--color-heading)]">{a.name}</span>
                                  {a.activeTask ? (
                                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] truncate">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse shrink-0" />
                                      <span className="truncate">{a.activeTask.title}</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] shrink-0" />
                                      Idle
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* ── Tasks zone — lighter background (hidden for queued objectives) ── */}
                {activeObjective?.status !== 'queued' && (assignedTasks.length > 0 || pendingTasks.length > 0 || completedTasks.length > 0) && (
                <div className="pt-6 pb-24 mt-2 bg-[var(--color-surface)]"
                  style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', minHeight: '100vh', marginBottom: '-6rem' }}
                >
                <div className="max-w-[calc(540px+2rem)] sm:max-w-[calc(540px+3rem)] mx-auto px-4 sm:px-6">

                {/* ── IN PROGRESS ── */}
                {assignedTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Tasks In Progress ({assignedTasks.length})
                      </span>
                    </div>
                    {assignedTasks.map(task => (
                      <div key={task.id} className="tl-card mb-3">
                        <div
                          className="card-alive rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-border)] cursor-pointer hover:shadow-lg hover:shadow-black/8"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="badge-breathe inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                <PixelIcon name="loader" size={10} />
                                In Progress
                              </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                              {task.title}
                            </h3>
                            <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-3 line-clamp-2">{task.description || task.objective}</p>

                            {/* Agent + time estimate */}
                            <div className="flex items-center gap-2.5">
                              {task.agent ? (
                                <>
                                  <AgentDot name={task.agent.name} size={28} active />
                                  <span className="text-[13px] font-medium text-[var(--color-heading)]">{task.agent.name}</span>
                                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse shrink-0" />
                                    Working
                                  </span>
                                </>
                              ) : (
                                <span className="text-[12px] text-[var(--color-muted)]">Unassigned</span>
                              )}
                              <div className="ml-auto flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] bg-[var(--color-input)] px-2.5 py-1 rounded-lg shrink-0">
                                <PixelIcon name="clock" size={12} />
                                <span>{task.duration || 'Est. 2-4h'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center border-t border-[var(--color-border)] px-3 py-1.5">
                            <button type="button" onClick={(e) => handleLike(e, task.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${reactionPop?.taskId === task.id && reactionPop?.type === 'like' ? 'reaction-pop' : ''} ${likedTasks[task.id] ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)]'}`}>
                              <PixelIcon name="thumbs-up" size={14} />
                              <span className="text-[11px]">{(task.likes || 0) + (likedTasks[task.id] ? 1 : 0)}</span>
                            </button>
                            <button type="button" onClick={(e) => handleDislike(e, task.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${reactionPop?.taskId === task.id && reactionPop?.type === 'dislike' ? 'reaction-pop' : ''} ${dislikedTasks[task.id] ? 'text-red-400 bg-red-500/10' : 'text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-bg-alt)]'}`}>
                              <PixelIcon name="thumbs-down" size={14} />
                              <span className="text-[11px]">{(task.dislikes || 0) + (dislikedTasks[task.id] ? 1 : 0)}</span>
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-blue-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}>
                              <PixelIcon name="message" size={14} />
                              {task.comments > 0 && <span className="text-[11px]">{task.comments}</span>}
                            </button>
                            <div className="flex-1" />
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="external-link" size={14} />
                              {task.shares > 0 && <span className="text-[11px]">{task.shares}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PENDING ── */}
                {pendingTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Tasks Up Next ({pendingTasks.length})
                      </span>
                    </div>
                    {pendingTasks.map(task => (
                      <div key={task.id} className="tl-card mb-3">
                        <div
                          className="card-alive rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-md shadow-black/4 border border-[var(--color-border)] cursor-pointer hover:shadow-lg hover:shadow-black/8"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-muted)]">
                                <PixelIcon name="clock" size={10} />
                                Pending
                              </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                              {task.title}
                            </h3>
                            <p className="text-[13px] text-[var(--color-body)] leading-relaxed mb-3 line-clamp-2">{task.description || task.objective}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] text-[var(--color-muted)]">Awaiting assignment</span>
                              <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] bg-[var(--color-input)] px-2.5 py-1 rounded-lg">
                                <PixelIcon name="clock" size={12} />
                                <span>Est. 2-4h</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center border-t border-[var(--color-border)] px-3 py-1.5">
                            <button type="button" onClick={(e) => handleLike(e, task.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${reactionPop?.taskId === task.id && reactionPop?.type === 'like' ? 'reaction-pop' : ''} ${likedTasks[task.id] ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)]'}`}>
                              <PixelIcon name="thumbs-up" size={14} />
                              <span className="text-[11px]">{(task.likes || 0) + (likedTasks[task.id] ? 1 : 0)}</span>
                            </button>
                            <button type="button" onClick={(e) => handleDislike(e, task.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${reactionPop?.taskId === task.id && reactionPop?.type === 'dislike' ? 'reaction-pop' : ''} ${dislikedTasks[task.id] ? 'text-red-400 bg-red-500/10' : 'text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-bg-alt)]'}`}>
                              <PixelIcon name="thumbs-down" size={14} />
                              <span className="text-[11px]">{(task.dislikes || 0) + (dislikedTasks[task.id] ? 1 : 0)}</span>
                            </button>
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-blue-400 hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}>
                              <PixelIcon name="message" size={14} />
                              {task.comments > 0 && <span className="text-[11px]">{task.comments}</span>}
                            </button>
                            <div className="flex-1" />
                            <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)] transition-colors cursor-pointer">
                              <PixelIcon name="external-link" size={14} />
                              {task.shares > 0 && <span className="text-[11px]">{task.shares}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── COMPLETED ── */}
                {completedTasks.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        Completed ({completedTasks.length})
                      </span>
                    </div>
                    <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
                      {completedTasks.map((task, i) => (
                        <div
                          key={task.id}
                          className={`tl-card flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[var(--color-bg-alt)] transition-colors ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <span className="check-pop"><PixelIcon name="check" size={14} className="text-[var(--color-accent)] shrink-0" /></span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[14px] text-[var(--color-heading)] truncate block">{task.title}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--color-muted)]">
                              {task.agent && <span>{task.agent.name}</span>}
                              {task.duration && <span>· {task.duration}</span>}
                              {task.files?.length > 0 && <span>· {task.files.length} files</span>}
                            </div>
                          </div>
                          {task.agent && <AgentDot name={task.agent.name} size={22} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div></div>)}{/* end tasks zone */}
              </>
            )}

          </div>}

          </div>{/* end timelineRef */}
        </div>
        )}

        {/* ═══ STARTUP TAB ═══ */}
        {!selectedTask && workshopTab === 'dashboard' && (
          <>
          {/* Header + tabs inside max-w container */}
          <div className="max-w-[540px] mx-auto">

            {/* ── Fresh startup onboarding ── */}

            {/* Big stats — overview shows 3 key numbers (hidden when fresh) */}
            {dashTab === 'overview' && (
              <div className="flex items-end gap-6 mb-1">
                <div>
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Agents</div>
                  <span className="text-[32px] font-bold text-[var(--color-heading)] leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                    {agents.length}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Revenue</div>
                  <span className="text-[32px] font-bold text-[var(--color-heading)] leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                    {myStartup.revenue || '$0'}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-muted)] mb-0.5">Runway</div>
                  <span className="text-[32px] font-bold leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)', color: runwayMonthsRaw > 12 ? 'var(--color-accent)' : runwayMonthsRaw > 6 ? '#f59e0b' : '#ef4444' }}>
                    {runwayMonths}
                    <span className="text-[16px] font-semibold text-[var(--color-muted)] ml-0.5">mo</span>
                  </span>
                </div>
              </div>
            )}
            {dashTab === 'token' && tokenData.price && (
              <div className="flex items-end gap-3 mb-1">
                <TokenIcon token={tokenData.symbol} color={currentStartup.color} size={36} className="mb-0.5" />
                <span className="text-[36px] font-bold text-[var(--color-heading)] leading-none tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                  ${tokenDisplayPrice}
                </span>
                <span className={`text-[15px] font-semibold pb-1 ${tokenData.changePositive ? 'text-[var(--color-accent)]' : 'text-red-500'}`}>
                  {tokenData.change24h}
                </span>
              </div>
            )}

            {/* Sub-tab switcher */}
            <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar">
              {DASH_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchDashTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer flex items-center gap-1 shrink-0 ${
                    dashTab === tab.id
                      ? 'bg-[var(--color-heading)] text-[var(--color-bg)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-bg-alt)]'
                  }`}
                  style={{ transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <PixelIcon name={tab.icon} size={12} />
                  {tab.label}
                </button>
              ))}
              {dashTab === 'token' && (
                <div className="ml-auto flex items-center gap-1">
                  {['24h', '7d'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setActiveRange(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        activeRange === r
                          ? 'bg-[var(--color-bg-alt)] text-[var(--color-heading)]'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-heading)]'
                      }`}
                      style={{ transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full-width chart — breaks out of max-w and main padding */}
          <div className="w-full mt-2 mb-6">
            {dashTab === 'overview' && (
              <RevenueActivityChart revenueData={monthlyRevenue} activityData={dailyActivity} labels={monthLabels} height={280} />
            )}
            {dashTab === 'token' && (
              <TokenChart data={tokenChartActive} height={320} yPrefix="$" />
            )}
          </div>

          {/* Content panels back inside max-w */}
          <div className="max-w-[540px] mx-auto">
            <div ref={dashContentRef}>

              {/* ═══ OVERVIEW ═══ */}
              {dashTab === 'overview' && (
                <>
                  {/* Stats */}
                  {(() => {
                    const totalFiles = tasks.reduce((sum, t) => sum + (t.files?.length || 0), 0)
                    const totalHours = tasks.reduce((sum, t) => {
                      if (!t.duration) return sum
                      const h = t.duration.match(/(\d+)h/)
                      const m = t.duration.match(/(\d+)m/)
                      return sum + (h ? parseInt(h[1]) : 0) + (m ? parseInt(m[1]) / 60 : 0)
                    }, 0)
                    const stats = [
                      { value: `${dashCompletedObj.length}`, label: 'Objectives' },
                      { value: `${dashCompletedTasks}`, label: 'Tasks' },
                      { value: `${totalFiles}`, label: 'Files' },
                      { value: `${totalHours >= 100 ? Math.round(totalHours) : totalHours.toFixed(1)}h`, label: 'Agent hrs' },
                    ]
                    return (
                      <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 overflow-hidden">
                        <div className="flex items-stretch">
                          {stats.map((s, i) => (
                            <div key={s.label} className={`flex-1 py-4 px-1 text-center ${i > 0 ? 'border-l border-[var(--color-border)]' : ''}`}>
                              <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-muted)] mb-2">{s.label}</div>
                              <div
                                className="text-[22px] font-bold text-[var(--color-heading)] leading-none tabular-nums"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                              >
                                {s.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Current objective card */}
                  <div className="dash-panel relative rounded-2xl overflow-hidden shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 bg-[var(--color-surface)]">
                    <div className="relative p-5">
                    {defaultObjective ? (
                      <button
                        type="button"
                        onClick={() => { setActiveObjective(defaultObjective); setWorkshopTab('objectives') }}
                        className="w-full text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <PixelIcon name="bullseye-arrow" size={13} className="text-[var(--color-accent)]" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">Current Objective</span>
                          <PixelIcon name="chevron-right" size={11} className="text-[var(--color-muted)] ml-auto group-hover:text-[var(--color-accent)] transition-colors" />
                        </div>
                        <div className="text-[15px] font-semibold text-[var(--color-heading)] mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>{defaultObjective.title}</div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className="flex-1 h-3 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-accent)] progress-shimmer" style={{ width: `${defaultObjective.progress}%`, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                          </div>
                          <span className="text-[13px] font-mono font-bold text-[var(--color-heading)] shrink-0">{defaultObjective.progress}%</span>
                        </div>
                        <div className="text-[11px] text-[var(--color-muted)]">{defaultObjective.tasksComplete}/{defaultObjective.tasksTotal} tasks</div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setWorkshopTab('objectives'); setTimeout(() => setIsNewMode(true), 150) }}
                        className="w-full text-left group cursor-pointer"
                      >
                        {/* Pixel grid background */}
                        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[var(--color-accent)]/30 group-hover:border-[var(--color-accent)] transition-colors duration-300 p-5">
                          <div
                            className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
                            style={{
                              backgroundImage: `
                                linear-gradient(var(--color-accent) 1px, transparent 1px),
                                linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
                              `,
                              backgroundSize: '6px 6px',
                            }}
                          />
                          <div className="relative flex items-start gap-3.5">
                            <div
                              className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)]/20 transition-colors"
                              style={{ animation: 'pixel-float 2.5s steps(4) infinite' }}
                            >
                              <PixelIcon name="bullseye-arrow" size={18} className="text-[var(--color-accent)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-[15px] font-semibold text-[var(--color-heading)] mb-0.5 group-hover:text-[var(--color-accent)] transition-colors"
                                style={{ fontFamily: 'var(--font-display)' }}
                              >
                                Create your first objective
                              </div>
                              <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">
                                Tell your agents what to build. They'll break it into tasks and get to work.
                              </div>
                              <div className="flex items-center gap-1.5 mt-2.5">
                                <span className="text-[11px] font-semibold text-[var(--color-accent)] tracking-wide uppercase">Get started</span>
                                <PixelIcon name="chevron-right" size={11} className="text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    </div>
                  </div>


                  {/* Agents */}
                  <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Agents</span>
                    <div className="flex flex-col gap-3">
                      {agents.map(a => (
                        <TransitionLink
                          key={a.name}
                          to={`/agents/${a.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="w-full flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 hover:border-[var(--color-border)] px-4 py-3.5 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center gap-3.5">
                            <AgentDot name={a.name} size={42} active={a.status === 'working'} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] font-semibold text-[var(--color-heading)]">{a.name}</div>
                              <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)]">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === 'working' ? 'bg-[var(--color-accent)] live-pulse' : 'bg-[var(--color-muted)]/40'}`} />
                                {a.workingOn ? (
                                  <span className="truncate">{a.workingOn}</span>
                                ) : (
                                  <span>{a.role} · Idle</span>
                                )}
                              </div>
                            </div>
                            <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0" />
                          </div>
                        </TransitionLink>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] py-4 cursor-pointer hover:border-[var(--color-heading)] transition-colors"
                      onClick={handleInviteAgent}
                    >
                      <span className="text-[16px] text-[var(--color-muted)]" aria-hidden="true">+</span>
                      <span className="text-[14px] font-medium text-[var(--color-muted)]">Invite Another Agent</span>
                    </button>
                  </div>


                  {/* Post a Role */}
                  <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Open Roles</span>

                    {/* Existing roles */}
                    {myRoles.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4">
                        {myRoles.map(r => (
                          <div key={r.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 px-4 py-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                              <PixelIcon name="target" size={14} className="text-[var(--color-accent)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-semibold text-[var(--color-heading)]">{r.title}</div>
                              <div className="text-[12px] text-[var(--color-muted)]">
                                {r.applicants} applicant{r.applicants !== 1 ? 's' : ''} · {r.reward} tokens · {r.status}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                              r.urgency === 'Urgent' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {r.urgency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <TransitionLink
                      to={`/dashboard/${slug}/post-role`}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] py-4 cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/[0.02] transition-all duration-200"
                    >
                      <PixelIcon name="zap" size={16} className="text-[var(--color-muted)]" />
                      <span className="text-[14px] font-medium text-[var(--color-muted)]">Post a New Role</span>
                    </TransitionLink>
                  </div>

                  {/* Settings */}
                  <TransitionLink
                    to={`/dashboard/${slug}/settings`}
                    className="dash-panel card-alive flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-5 py-4 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-heading)]/5 transition-colors">
                      <PixelIcon name="settings" size={16} className="text-[var(--color-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--color-heading)]">Settings</div>
                      <div className="text-[12px] text-[var(--color-muted)]">Profile, permissions, and danger zone</div>
                    </div>
                    <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-heading)] transition-colors" />
                  </TransitionLink>
                </>
              )}

              {/* ═══ TOKEN ═══ */}
              {dashTab === 'token' && tokenData.price && (
                <>
                  {/* Key metrics scoreboard */}
                  <div className="dash-panel rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 overflow-hidden">
                    <div className="flex items-stretch">
                      {[
                        { label: 'Mcap', value: tokenData.mcap },
                        { label: 'Volume', value: tokenData.volume },
                        { label: 'Holders', value: tokenData.holders },
                        { label: 'Liquidity', value: tokenData.liquidity },
                      ].map((s, i) => (
                        <div key={s.label} className={`flex-1 py-4 px-1 text-center ${i > 0 ? 'border-l border-[var(--color-border)]' : ''}`}>
                          <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-muted)] mb-2">{s.label}</div>
                          <div
                            className="text-[18px] font-bold text-[var(--color-heading)] leading-none tabular-nums"
                            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                          >
                            {s.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonding curve + status */}
                  <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Bonding Curve</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        currentStartup.status === 'Graduated'
                          ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        <PixelIcon name={currentStartup.status === 'Graduated' ? 'trophy' : 'flask'} size={11} />
                        {currentStartup.status || 'Incubating'}
                      </span>
                    </div>

                    {(() => {
                      const graduated = currentStartup.status === 'Graduated'
                      const mcapStr = tokenData.mcap || '$0'
                      const mcapNum = parseFloat(mcapStr.replace(/[^0-9.]/g, '')) * (mcapStr.includes('M') ? 1000000 : mcapStr.includes('K') ? 1000 : 1)
                      const graduationTarget = 10000000
                      const progress = graduated ? 1.0 : Math.min(0.95, Math.max(0.02, mcapNum / graduationTarget))
                      const w = 460, h = 100
                      const curvePoints = Array.from({ length: 50 }, (_, i) => {
                        const t = i / 49
                        return `${t * w},${h - (t * t) * h}`
                      })
                      const progressIdx = Math.round(progress * 49)
                      const filledPoints = curvePoints.slice(0, progressIdx + 1)
                      const dotX = progress * w
                      const dotY = h - (progress * progress) * h
                      const threshT = 0.85
                      const threshX = threshT * w

                      return (
                        <div className="relative">
                          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 100 }} preserveAspectRatio="none">
                            {[0.25, 0.5, 0.75].map(t => (
                              <line key={t} x1={t * w} y1={0} x2={t * w} y2={h}
                                stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5" />
                            ))}
                            <line x1={threshX} y1={0} x2={threshX} y2={h}
                              stroke={graduated ? 'var(--color-accent)' : '#f59e0b'} strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
                            <polyline points={curvePoints.join(' ')} fill="none"
                              stroke="var(--color-border)" strokeWidth="2" opacity="0.3" />
                            {filledPoints.length > 1 && (
                              <polygon
                                points={`${filledPoints[0].split(',')[0]},${h} ${filledPoints.join(' ')} ${filledPoints[filledPoints.length - 1].split(',')[0]},${h}`}
                                fill={graduated ? 'var(--color-accent)' : '#f59e0b'} opacity="0.08" />
                            )}
                            {filledPoints.length > 1 && (
                              <polyline points={filledPoints.join(' ')} fill="none"
                                stroke={graduated ? 'var(--color-accent)' : '#f59e0b'} strokeWidth="2.5" strokeLinecap="round" />
                            )}
                            <circle cx={dotX} cy={dotY} r="5"
                              fill={graduated ? 'var(--color-accent)' : '#f59e0b'}
                              stroke="var(--color-surface)" strokeWidth="2" />
                          </svg>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-[var(--color-muted)]">Supply</span>
                            <span className="text-[10px] text-[var(--color-muted)] opacity-60" style={{ position: 'relative', left: `${threshT * 100 - 50}%` }}>Graduation</span>
                            <span className="text-[10px] text-[var(--color-muted)]">Price</span>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                      <div className="text-[12px] text-[var(--color-muted)]">
                        {currentStartup.status === 'Graduated' ? (
                          <span className="text-[var(--color-accent)] font-medium">Graduated to DEX</span>
                        ) : (
                          <>Mcap: <span className="text-[var(--color-heading)] font-medium">{tokenData.mcap || '$0'}</span> / $10M</>
                        )}
                      </div>
                      <span className="text-[12px] text-[var(--color-muted)]">
                        ${tokenData.price?.toFixed(3) || '0.000'} <span className={tokenData.changePositive ? 'text-[var(--color-accent)]' : 'text-red-500'}>{tokenData.change24h}</span>
                      </span>
                    </div>
                  </div>

                  {/* Supply + Price range */}
                  <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-4 block">Supply</span>

                    {/* Supply bar */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <div className="w-full h-3 rounded-full bg-[var(--color-bg-alt)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--color-accent)] progress-shimmer" style={{ width: '32%' }} />
                        </div>
                      </div>
                      <span className="text-[13px] font-mono font-bold text-[var(--color-heading)] shrink-0">32%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)] mb-5">
                      <span>Circulating: {tokenData.circulatingSupply}</span>
                      <span>Total: {tokenData.supply}</span>
                    </div>

                    {/* ATH / ATL strip */}
                    <div className="border-t border-[var(--color-border)] pt-4 flex items-stretch gap-0">
                      <div className="flex-1 pr-4">
                        <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-muted)] mb-1">All-Time High</div>
                        <div className="text-[18px] font-bold text-[var(--color-accent)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>${tokenData.ath}</div>
                        <div className="text-[10px] text-[var(--color-muted)] mt-1">{tokenData.athDate}</div>
                      </div>
                      <div className="w-px bg-[var(--color-border)]" />
                      <div className="flex-1 pl-4">
                        <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-muted)] mb-1">All-Time Low</div>
                        <div className="text-[18px] font-bold text-red-500 leading-none" style={{ fontFamily: 'var(--font-display)' }}>${tokenData.atl}</div>
                        <div className="text-[10px] text-[var(--color-muted)] mt-1">{tokenData.atlDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Etherscan link */}
                  <a
                    href={`https://etherscan.io/token/${tokenData.contract || '0x0000000000000000000000000000000000000000'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-panel card-alive flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-5 py-4 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4 group hover:border-[var(--color-muted)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-heading)]/5 transition-colors">
                      <PixelIcon name="open" size={16} className="text-[var(--color-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--color-heading)]">View on Etherscan</div>
                      <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
                        {tokenData.contract ? `${tokenData.contract.slice(0, 6)}...${tokenData.contract.slice(-4)}` : 'Contract address'}
                      </div>
                    </div>
                    <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0 group-hover:text-[var(--color-heading)] transition-colors" />
                  </a>

                  {tokenData.topHolders && (
                    <div className="dash-panel rounded-2xl bg-[var(--color-surface)] p-5 shadow-md shadow-black/4 border border-[var(--color-border)] mb-4">
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3 block">Ownership Distribution</span>
                      <HoldersBar holders={tokenData.topHolders} />
                      <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)] mt-5 mb-3 block">Top Holders</span>
                      <div className="flex flex-col">
                        {tokenData.topHolders.map((h, i) => (
                          <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                            <span className="w-5 text-[12px] font-mono text-[var(--color-muted)] text-center shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-mono text-[var(--color-heading)]">{h.wallet}</span>
                                {h.label && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-bg-alt)] text-[var(--color-muted)]">{h.label}</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[13px] font-medium text-[var(--color-heading)]">{h.amount}</div>
                              <div className="text-[11px] text-[var(--color-muted)]">{h.pct}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {dashTab === 'token' && !tokenData.price && (
                <div className="dash-panel flex flex-col items-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                    <PixelIcon name="coin" size={24} className="text-[var(--color-muted)]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>No token data</h3>
                  <p className="text-[13px] text-[var(--color-muted)] leading-relaxed max-w-[280px]">
                    Token data will appear here once your startup token is launched.
                  </p>
                </div>
              )}




            </div>
          </div>
          </>
        )}

        {/* ═══ FILES TAB ═══ */}
        {!selectedTask && workshopTab === 'files' && (
          <div className="max-w-[540px] mx-auto">

            {/* Inside a folder */}
            {activeFolder ? (() => {
              const folder = deliverableFolders.find(f => f.id === activeFolder)
              if (!folder) return null
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFolder(null)}
                    className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer mb-5"
                  >
                    <PixelIcon name="arrow-left" size={14} />
                    All folders
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                      <PixelIcon name="folder" size={20} className="text-[var(--color-accent)]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[16px] font-semibold text-[var(--color-heading)] leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                        {folder.title}
                      </h2>
                      <p className="text-[12px] text-[var(--color-muted)]">{folder.files.length} files · Completed {folder.date}</p>
                    </div>
                  </div>

                  {/* Files grouped by task */}
                  {(() => {
                    const byTask = {}
                    folder.files.forEach(f => {
                      if (!byTask[f.task]) byTask[f.task] = { agent: f.agent, files: [] }
                      byTask[f.task].files.push(f)
                    })
                    return Object.entries(byTask).map(([taskTitle, group]) => (
                      <div key={taskTitle} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {group.agent && <AgentDot name={group.agent} size={20} />}
                          <span className="text-[12px] font-medium text-[var(--color-heading)]">{taskTitle}</span>
                        </div>
                        <div className="rounded-2xl bg-[var(--color-surface)] shadow-md shadow-black/4 border border-[var(--color-border)] overflow-hidden">
                          {group.files.map((file, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                            >
                              <PixelIcon name="file-text" size={16} className="text-[var(--color-muted)] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[var(--color-heading)] truncate">{file.name}</div>
                                <div className="text-[11px] text-[var(--color-muted)]">{file.size}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                                  Preview
                                </button>
                                <button type="button" className="text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-muted)]">
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </>
              )
            })() : (
              <>
                {/* Folder list */}
                <div className="mb-8 text-center">
                  <h1 className="text-[24px] font-bold text-[var(--color-heading)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Files</h1>
                  <p className="text-[14px] text-[var(--color-muted)]">Deliverables from your completed objectives.</p>
                </div>

                {deliverableFolders.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {deliverableFolders.map(folder => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setActiveFolder(folder.id)}
                        className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-md shadow-black/4 border border-[var(--color-border)] flex items-center gap-4 w-full text-left hover:shadow-md hover:shadow-black/8 transition-shadow cursor-pointer"
                      >
                        <span className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                          <PixelIcon name="folder" size={22} className="text-[var(--color-accent)]" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-[var(--color-heading)] truncate">{folder.title}</div>
                          <div className="text-[12px] text-[var(--color-muted)]">{folder.files.length} files · {folder.tasksCount} tasks · {folder.date}</div>
                        </div>
                        <PixelIcon name="chevron-right" size={14} className="text-[var(--color-muted)] shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center mb-4">
                      <PixelIcon name="folder" size={22} className="text-[var(--color-muted)]" />
                    </div>
                    <h2 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No deliverables yet</h2>
                    <p className="text-[14px] text-[var(--color-muted)] max-w-[280px]">When an objective is completed, all output files will appear here organized by folder.</p>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {!selectedTask && workshopTab === 'chat' && (
          <div className="max-w-[540px] mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 180px)' }}>

            {/* Online agents bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Online</span>
              <div className="flex items-center gap-1.5">
                {agents.map(a => {
                  const isActive = assignedTasks.some(t => t.agent?.name === a.name)
                  return (
                    <div key={a.name} className="relative" title={`${a.name}${isActive ? ' — working' : ''}`}>
                      <AgentDot name={a.name} size={28} active={isActive} />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-bg)] ${isActive ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pb-4 flex flex-col gap-3">
              {messages.map(msg => {
                const isYou = msg.from === 'you'
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isYou ? 'flex-row-reverse' : ''}`}>
                    {!isYou && <AgentDot name={msg.from} size={30} className="mt-1 shrink-0" />}
                    <div className={`max-w-[75%] ${isYou ? 'ml-auto' : ''}`}>
                      {!isYou && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-[var(--color-heading)]">{msg.from}</span>
                          <span className="text-[11px] text-[var(--color-muted)]">{msg.time}</span>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        isYou
                          ? 'bg-[var(--color-heading)] text-[var(--color-bg)] rounded-br-md'
                          : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-body)] rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                      {isYou && (
                        <div className="text-[11px] text-[var(--color-muted)] text-right mt-1">{msg.time}</div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {agentTyping && (
                <div className="flex gap-2.5">
                  <AgentDot name={agentTyping} size={30} className="mt-1 shrink-0" active />
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-heading)] mb-1">{agentTyping}</div>
                    <div className="rounded-2xl rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] typing-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] typing-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] typing-dot-3" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-20 pt-3 bg-[var(--color-bg)]">
              <form onSubmit={handleSendChat} className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Message your agents... use @name to mention"
                  className="w-full h-12 pl-4 pr-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[14px] text-[var(--color-heading)]
                             placeholder:text-[#b0adaa] focus:outline-2 focus:outline-[var(--color-heading)]/10 transition-all shadow-md shadow-black/4"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    chatInput.trim()
                      ? 'bg-[var(--color-heading)] text-[var(--color-bg)] hover:bg-[var(--color-body)]'
                      : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <PixelIcon name="arrow-right" size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ══════════ FLOATING BOTTOM NAV ══════════ */}
      {!selectedTask && <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[var(--color-heading)] rounded-full px-2 py-2 shadow-xl shadow-black/20"
        aria-label="Workshop navigation"
      >
        {/* Sliding active pill */}
        <span
          ref={navPillRef}
          className="absolute left-2 top-2 w-11 h-11 rounded-full bg-[var(--color-accent)]/15 pointer-events-none"
          aria-hidden="true"
        />
        {WORKSHOP_TABS.map(tab => {
          const isActive = workshopTab === tab.id
          const notifCount = tabNotifications.current[tab.id] || 0
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { navigator.vibrate?.(10); setWorkshopTab(tab.id) }}
              className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-bg)]'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              aria-label={`${tab.label}${notifCount > 0 ? ` (${notifCount} new)` : ''}`}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
            >
              <PixelIcon name={tab.icon} size={20} />
              {notifCount > 0 && !isActive && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-heading)]" />
              )}
            </button>
          )
        })}
      </nav>}
    </div>
    </ErrorBoundary>

    {/* ── Onboarding Modal ── */}
    {onboardingStep && currentStartup && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => { setOnboardingStep(null); setOnboardingDismissed(true) }}
        />

        <div
          role="dialog"
          aria-label="Get started with your startup"
          aria-modal="true"
          className="relative w-full max-w-[420px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden"
          style={{ animation: 'onboard-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              {assetUrl(myStartup.avatar) ? (
                <img src={assetUrl(myStartup.avatar)} alt={myStartup.name} className="w-9 h-9 rounded-xl object-cover border border-[var(--color-border)]" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-bold" style={{ background: myStartup.color || 'var(--color-accent)' }}>
                  {(myStartup.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-[15px] font-semibold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Get started
                </div>
                <div className="text-[11px] text-[var(--color-muted)]">{myStartup.name}</div>
              </div>
            </div>
            <div className="text-[12px] text-[var(--color-muted)] font-mono">
              {onboardingStep === 'agents' ? '1' : '2'} / 2
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1.5 px-6 mt-4">
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${onboardingStep === 'agents' || onboardingStep === 'objective' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${onboardingStep === 'objective' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6">
            {onboardingStep === 'agents' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <PixelIcon name="robot" size={20} className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Invite agents to your team
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-5">
                  Agents are AI workers that execute on your objectives. Add them now or browse the marketplace later.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    handleInviteAgent()
                    setOnboardingStep('objective')
                  }}
                  className="w-full h-11 rounded-xl text-[13px] font-semibold cursor-pointer
                             bg-[var(--color-accent)] text-[#0d2000]
                             hover:shadow-lg hover:shadow-[var(--color-accent)]/20
                             transition-all duration-200
                             flex items-center justify-center gap-2"
                >
                  <PixelIcon name="robot" size={15} />
                  Add an Agent
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep('objective')}
                  className="w-full mt-2 h-9 rounded-xl text-[12px] font-medium cursor-pointer
                             text-[var(--color-muted)] hover:text-[var(--color-heading)]
                             transition-colors flex items-center justify-center"
                >
                  I'll do this later
                </button>
              </>
            )}

            {onboardingStep === 'objective' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <PixelIcon name="bullseye-arrow" size={20} className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[var(--color-heading)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Create your first objective
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-5">
                  Tell your agents what to build. They'll break it into tasks and start working autonomously.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStep(null)
                    setOnboardingDismissed(true)
                    setWorkshopTab('objectives')
                    setTimeout(() => setIsNewMode(true), 150)
                  }}
                  className="w-full h-11 rounded-xl text-[13px] font-semibold cursor-pointer
                             bg-[var(--color-accent)] text-[#0d2000]
                             hover:shadow-lg hover:shadow-[var(--color-accent)]/20
                             transition-all duration-200
                             flex items-center justify-center gap-2"
                >
                  <PixelIcon name="bullseye-arrow" size={15} />
                  Create Objective
                </button>
                <button
                  type="button"
                  onClick={() => { setOnboardingStep(null); setOnboardingDismissed(true) }}
                  className="w-full mt-2 h-9 rounded-xl text-[12px] font-medium cursor-pointer
                             text-[var(--color-muted)] hover:text-[var(--color-heading)]
                             transition-colors flex items-center justify-center"
                >
                  I'll explore first
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    <style>{`
      @keyframes onboard-in {
        from { opacity: 0; transform: scale(0.95) translateY(8px) }
        to { opacity: 1; transform: scale(1) translateY(0) }
      }
    `}</style>

    </>
  )
}
