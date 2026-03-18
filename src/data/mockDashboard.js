// ═══════════════════════════════════════════════════════════════════
//  Mock dashboard data generator
//  Enable via localStorage: localStorage.setItem('av:dev:mock', '1')
//  Disable: localStorage.removeItem('av:dev:mock')
// ═══════════════════════════════════════════════════════════════════

// Seeded PRNG for deterministic data per slug
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// ── Agent names pool ──
const AGENT_NAMES = [
  'PixelForge', 'NovaMind', 'CodeWraith', 'SynthMind', 'ByteForge',
  'NeuralAce', 'FluxBot', 'VectorX', 'CipherNode', 'QuantumDrift',
  'AtlasCore', 'IronPulse', 'NebulaOps', 'ZeroFrame', 'SkyLoom',
]

const AGENT_ROLES = [
  'Full-Stack Dev', 'Product Designer', 'Content Strategist', 'Backend Architect',
  'Marketing Lead', 'DevOps Engineer', 'Data Scientist', 'Security Analyst',
  'Frontend Dev', 'ML Engineer', 'Sales Agent',
]

const OBJECTIVE_TEMPLATES = [
  { title: 'Launch marketing website v2', desc: 'Complete redesign of the marketing site with new hero, pricing page, and SEO.' },
  { title: 'Build user onboarding flow', desc: 'Create a 3-step onboarding wizard with email verification and wallet setup.' },
  { title: 'Ship mobile-responsive dashboard', desc: 'Ensure the dashboard is fully usable on phones and tablets.' },
  { title: 'Integrate payment processing', desc: 'Set up Stripe/SOL payment flow for premium tiers and token purchases.' },
  { title: 'Q1 content calendar execution', desc: 'Execute blog posts, social media, newsletters, and community updates.' },
  { title: 'Brand identity & style guide', desc: 'Define logo system, color palette, typography, and component patterns.' },
  { title: 'API v2 migration', desc: 'Migrate all endpoints to v2 schema with proper auth and rate limiting.' },
  { title: 'Security audit & hardening', desc: 'Run pen tests, fix vulnerabilities, implement CSP headers and WAF rules.' },
  { title: 'Analytics dashboard', desc: 'Build real-time analytics with engagement, revenue, and agent performance charts.' },
  { title: 'Token launch preparation', desc: 'Finalize tokenomics, vesting schedules, and liquidity pool setup.' },
]

const TASK_TEMPLATES = [
  'Homepage hero section redesign', 'SEO meta tags & sitemap generation',
  'Pricing page with comparison table', 'Mobile responsive pass', 'Performance audit & Lighthouse optimization',
  'Blog post: "Why AI Agents?"', 'Social media graphics batch', 'Community update newsletter',
  'API endpoint documentation', 'Unit test coverage to 90%', 'Database migration scripts',
  'User authentication flow', 'Email template system', 'File upload & storage',
  'Real-time notifications', 'Search & filter implementation', 'Dark mode support',
  'Accessibility audit fixes', 'CI/CD pipeline setup', 'Load testing & optimization',
  'Logo variations & usage guide', 'Color palette & typography system', 'Component pattern library',
  'Brand voice documentation', 'Design system tokens export',
]

const FILE_NAMES = [
  'HeroSection.jsx', 'AnimatedGrid.jsx', 'PricingPage.jsx', 'seo-meta-tags.json',
  'brand-voice-guide.md', 'logo-guidelines.fig', 'design-tokens.json', 'components.fig',
  'typography-guide.fig', 'auth-flow.ts', 'api-routes.ts', 'migration-001.sql',
  'Dashboard.tsx', 'analytics-utils.ts', 'chart-components.tsx', 'test-suite.spec.ts',
  'deploy-config.yml', 'security-audit.pdf', 'performance-report.md', 'README.md',
]

const CHAT_MESSAGES = [
  { from: 'you', text: 'How\'s the progress looking?' },
  { from: 'agent', text: 'Making good progress! Should be done in about an hour.' },
  { from: 'you', text: 'Nice. Make sure it works on mobile too.' },
  { from: 'agent', text: 'Already tested on 375px — looks clean. I\'ll do a final pass.' },
  { from: 'you', text: 'What\'s the status on the API integration?' },
  { from: 'agent', text: 'Endpoints are live. Running load tests now — averaging 32ms response time.' },
  { from: 'you', text: 'Can you bump the contrast on the dark theme?' },
  { from: 'agent', text: 'Done — contrast ratio is now 7.2:1, well above AA standards.' },
  { from: 'you', text: 'How did the security scan go?' },
  { from: 'agent', text: '0 critical vulnerabilities. 2 low-severity items that I\'ve already patched.' },
  { from: 'you', text: 'Let\'s prioritize the search feature next.' },
  { from: 'agent', text: 'On it. I\'ll use ElasticSearch for full-text with fuzzy matching. Should have a prototype by end of day.' },
]

const COMMENT_TEMPLATES = [
  'Uploaded 3 variants. Variant B performs best on mobile.',
  'All done — tests passing with 98% coverage.',
  'Optimized the bundle size by 40%. LCP is now under 1.2s.',
  'Fixed the accessibility issues flagged in the audit.',
  'Deployed to staging for review. Let me know if anything needs tweaking.',
  'This took longer than expected but the result is solid.',
  'Refactored to use CSS variables so theming is much cleaner now.',
  'Added error handling for edge cases we discussed.',
]

const FEED_TYPES = ['design', 'content', 'code']
const FEED_ACTIONS = ['shared progress on', 'finished working on', 'shipped code for', 'completed review of']

const TOKEN_SYMBOLS = ['ACME', 'FORGE', 'NOVA', 'PULSE', 'GRID', 'FLUX', 'BYTE', 'CORE', 'MINT', 'DRIFT']

// ═══════════════════════════════════════════════════════════════════

export function isMockEnabled() {
  try {
    return localStorage.getItem('av:dev:mock') === '1'
  } catch {
    return false
  }
}

export function generateMockDashboard(slug) {
  const rng = mulberry32(hashStr(slug || 'default'))

  // ── Agents (2-4) ──
  const agentCount = 2 + Math.floor(rng() * 3)
  const usedNames = new Set()
  const agents = Array.from({ length: agentCount }, () => {
    let name
    do { name = pick(rng, AGENT_NAMES) } while (usedNames.has(name))
    usedNames.add(name)
    const role = pick(rng, AGENT_ROLES)
    return {
      name,
      avatar: null,
      role,
      status: rng() > 0.3 ? 'working' : 'idle',
      workingOn: rng() > 0.3 ? pick(rng, TASK_TEMPLATES) : null,
    }
  })

  // ── Objectives (2-4: 1 in-progress, 0-1 queued, 1-2 completed) ──
  const objPool = [...OBJECTIVE_TEMPLATES].sort(() => rng() - 0.5)
  const objectives = [
    {
      id: 'obj-1',
      ...objPool[0],
      status: 'in-progress',
      progress: 20 + Math.floor(rng() * 60),
      tasksTotal: 4 + Math.floor(rng() * 3),
      tasksComplete: 1 + Math.floor(rng() * 3),
      startDate: 'Mar 10',
      estCompletion: 'Mar 22',
    },
    {
      id: 'obj-2',
      ...objPool[1],
      status: 'completed',
      progress: 100,
      tasksTotal: 4,
      tasksComplete: 4,
      startDate: 'Feb 20',
      estCompletion: 'Mar 5',
    },
  ]

  if (rng() > 0.4) {
    objectives.push({
      id: 'obj-3',
      ...objPool[2],
      status: 'queued',
      progress: 0,
      tasksTotal: 3 + Math.floor(rng() * 3),
      tasksComplete: 0,
      startDate: 'Mar 23',
      estCompletion: 'Apr 2',
    })
  }

  if (rng() > 0.5) {
    objectives.push({
      id: 'obj-4',
      ...objPool[3],
      status: 'completed',
      progress: 100,
      tasksTotal: 3,
      tasksComplete: 3,
      startDate: 'Feb 10',
      estCompletion: 'Feb 22',
    })
  }

  // ── Tasks ──
  const taskPool = [...TASK_TEMPLATES].sort(() => rng() - 0.5)
  let taskId = 100
  const tasks = []
  for (const obj of objectives) {
    const count = obj.tasksTotal
    for (let i = 0; i < count; i++) {
      const isCompleted = i < obj.tasksComplete
      const isAssigned = !isCompleted && i === obj.tasksComplete
      const agent = (isCompleted || isAssigned) ? pick(rng, agents) : null
      const fileCount = isCompleted ? 1 + Math.floor(rng() * 2) : 0
      const files = Array.from({ length: fileCount }, () => ({
        name: pick(rng, FILE_NAMES),
        size: `${(rng() * 15 + 0.5).toFixed(1)} KB`,
      }))
      const hours = isCompleted ? Math.floor(rng() * 5) : 0
      const mins = isCompleted ? Math.floor(rng() * 50) + 10 : 0

      tasks.push({
        id: ++taskId,
        title: taskPool[tasks.length % taskPool.length],
        description: `Task for objective: ${obj.title}`,
        objective: obj.title,
        status: isCompleted ? 'Completed' : isAssigned ? 'Assigned' : 'Pending',
        agent: agent ? { name: agent.name, avatar: null } : null,
        dependencies: i > 0 ? [`#${taskId - 1}`] : [],
        created: '3/10/2026',
        duration: isCompleted ? `${hours}h ${mins}m` : null,
        files,
        likes: isCompleted ? Math.floor(rng() * 10) : 0,
        dislikes: 0,
        comments: isCompleted ? Math.floor(rng() * 5) : 0,
        shares: isCompleted ? Math.floor(rng() * 3) : 0,
      })
    }
  }

  // ── Task comments ──
  const taskComments = {}
  for (const t of tasks) {
    if (t.status === 'Completed' && rng() > 0.4) {
      const count = 1 + Math.floor(rng() * 3)
      taskComments[t.id] = Array.from({ length: count }, (_, i) => ({
        id: `c-${t.id}-${i}`,
        author: i % 2 === 0 ? (t.agent?.name || 'Agent') : 'You',
        time: `${Math.floor(rng() * 48) + 1}h ago`,
        text: pick(rng, COMMENT_TEMPLATES),
      }))
    }
  }

  // ── Feed items ──
  const completedTasks = tasks.filter(t => t.status === 'Completed')
  const feedItems = completedTasks.slice(0, 3).map((t, i) => {
    const agent = agents.find(a => a.name === t.agent?.name) || agents[0]
    const type = pick(rng, FEED_TYPES)
    return {
      id: `f-${i}`,
      agent: { name: agent.name, avatar: null, role: agent.role },
      type,
      action: pick(rng, FEED_ACTIONS),
      task: t.title,
      time: `${Math.floor(rng() * 24) + 1}h ago`,
      preview: type === 'code' ? {
        kind: 'code',
        title: t.title,
        language: 'jsx',
        body: `function Component() {\n  const [data, setData] = useState(null)\n  useEffect(() => {\n    fetchData().then(setData)\n  }, [])\n  return <div>{data}</div>\n}`,
      } : type === 'design' ? {
        kind: 'design',
        title: t.title,
        body: `Completed the ${t.title.toLowerCase()}. All variants tested on mobile and desktop.`,
        images: [
          { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', label: 'Dark' },
          { gradient: 'linear-gradient(135deg, #FBFAF9 0%, #f0ede8 100%)', label: 'Light' },
        ],
      } : {
        kind: 'text',
        title: t.title,
        body: `Finished ${t.title.toLowerCase()}. All items reviewed and approved. Ready for deployment.`,
      },
      reactions: { fire: Math.floor(rng() * 8), rocket: Math.floor(rng() * 4) },
    }
  })

  // ── Chat messages ──
  const msgPool = [...CHAT_MESSAGES].sort(() => rng() - 0.5)
  const chatMessages = msgPool.slice(0, 6 + Math.floor(rng() * 4)).map((m, i) => ({
    id: `m-${i}`,
    from: m.from === 'agent' ? agents[i % agents.length].name : 'you',
    avatar: null,
    text: m.text,
    time: `${1 + Math.floor(i / 2)}:${String(10 + (i * 7) % 50).padStart(2, '0')} PM`,
  }))

  // ── Roles ──
  const myRoles = [
    {
      id: 'r-1',
      title: pick(rng, AGENT_ROLES),
      summary: 'Join the team and contribute to ongoing objectives.',
      tools: ['Cursor Pro', 'Vercel', 'GitHub Copilot'],
      reward: `${(2 + Math.floor(rng() * 10)) * 1000}`,
      vesting: pick(rng, ['3mo, 33% monthly', '4mo, 25% monthly', '6mo, 20% monthly']),
      status: 'Open',
      applicants: Math.floor(rng() * 15) + 2,
      posted: 'Mar 8',
      urgency: rng() > 0.5 ? 'Urgent' : 'Medium',
    },
  ]

  if (rng() > 0.4) {
    myRoles.push({
      id: 'r-2',
      title: pick(rng, AGENT_ROLES),
      summary: 'Scaling the team for the next phase of growth.',
      tools: ['Supabase', 'Railway', 'Postman AI'],
      reward: `${(3 + Math.floor(rng() * 12)) * 1000}`,
      vesting: pick(rng, ['4mo, 25% monthly', '6mo, cliff at 2mo then 25%']),
      status: 'Open',
      applicants: Math.floor(rng() * 20) + 1,
      posted: 'Mar 6',
      urgency: rng() > 0.5 ? 'Urgent' : 'Medium',
    })
  }

  // ── Token data ──
  const symbol = pick(rng, TOKEN_SYMBOLS)
  const basePrice = 0.05 + rng() * 0.5
  const sparkline = Array.from({ length: 24 }, (_, i) => {
    const noise = (rng() - 0.5) * basePrice * 0.08
    const trend = basePrice * (0.92 + 0.16 * (i / 23))
    return parseFloat((trend + noise).toFixed(4))
  })
  const priceHistory7d = Array.from({ length: 168 }, (_, i) => {
    const noise = (rng() - 0.5) * basePrice * 0.1
    const trend = basePrice * (0.8 + 0.4 * (i / 167))
    return parseFloat((trend + noise).toFixed(4))
  })
  const price = sparkline[sparkline.length - 1]
  const prevPrice = sparkline[0]
  const changePct = ((price - prevPrice) / prevPrice * 100).toFixed(1)
  const mcapNum = price * 10000000
  const mcap = mcapNum >= 1000000 ? `$${(mcapNum / 1000000).toFixed(1)}M` : `$${(mcapNum / 1000).toFixed(0)}K`

  const tokenData = {
    symbol,
    price: parseFloat(price.toFixed(3)),
    change24h: `${changePct >= 0 ? '+' : ''}${changePct}%`,
    changePositive: changePct >= 0,
    volume: `$${Math.floor(50 + rng() * 200)}K`,
    mcap,
    holders: `${Math.floor(500 + rng() * 2000)}`,
    liquidity: `$${Math.floor(30 + rng() * 150)}K`,
    supply: '10,000,000',
    circulatingSupply: `${Math.floor(2000000 + rng() * 4000000).toLocaleString()}`,
    ath: parseFloat((price * (1.3 + rng() * 0.8)).toFixed(3)),
    athDate: 'Feb 28, 2026',
    atl: parseFloat((price * (0.15 + rng() * 0.25)).toFixed(3)),
    atlDate: 'Jan 3, 2026',
    sparkline,
    priceHistory7d,
    contract: `0x${hashStr(slug).toString(16).padStart(8, '0')}...${hashStr(slug + 'end').toString(16).slice(0, 4)}`,
    topHolders: [
      { wallet: `0x4dc3...f782`, amount: `${Math.floor(800000 + rng() * 500000).toLocaleString()}`, pct: `${(8 + rng() * 5).toFixed(2)}%`, label: 'Treasury' },
      { wallet: `0x8f2a...c41d`, amount: `${Math.floor(500000 + rng() * 400000).toLocaleString()}`, pct: `${(5 + rng() * 4).toFixed(2)}%`, label: null },
      { wallet: `0xb1e7...9a23`, amount: `${Math.floor(300000 + rng() * 300000).toLocaleString()}`, pct: `${(3 + rng() * 3).toFixed(2)}%`, label: 'Team' },
      { wallet: `0x91a5...2e67`, amount: `${Math.floor(200000 + rng() * 250000).toLocaleString()}`, pct: `${(2 + rng() * 2.5).toFixed(2)}%`, label: null },
      { wallet: `0xc7f2...8b19`, amount: `${Math.floor(100000 + rng() * 200000).toLocaleString()}`, pct: `${(1 + rng() * 2).toFixed(2)}%`, label: null },
    ],
  }

  // ── Output folders & files ──
  const outputFolders = [
    { name: 'marketing', type: 'folder', description: 'Content and copy', agent: { name: agents[agents.length - 1].name, avatar: null }, date: '3/11/2026', items: 2 },
    { name: 'design', type: 'folder', description: 'UI designs and brand assets', agent: { name: agents[0].name, avatar: null }, date: '3/11/2026', items: 4 },
    { name: 'engineering', type: 'folder', description: 'Code and configs', agent: { name: agents[0].name, avatar: null }, date: '3/12/2026', items: 3 },
  ]

  const outputFiles = [
    { name: 'seo-meta-tags.json', type: 'code', folder: 'marketing', status: 'Approved', agent: { name: agents[agents.length - 1].name, avatar: null }, date: '3/11/2026', size: '1.8 KB' },
    { name: 'brand-voice-guide.md', type: 'article', folder: 'marketing', status: 'Approved', agent: { name: agents[agents.length - 1].name, avatar: null }, date: '3/10/2026', size: '3.6 KB' },
    { name: 'HeroSection.jsx', type: 'code', folder: 'design', status: 'Merged', agent: { name: agents[0].name, avatar: null }, date: '3/11/2026', size: '3.1 KB' },
    { name: 'design-tokens.json', type: 'code', folder: 'design', status: 'Approved', agent: { name: agents[0].name, avatar: null }, date: '3/10/2026', size: '3.4 KB' },
    { name: 'components.fig', type: 'design', folder: 'design', status: 'Approved', agent: { name: agents[0].name, avatar: null }, date: '3/9/2026', size: '14.6 MB' },
    { name: 'logo-guidelines.fig', type: 'design', folder: 'design', status: 'Approved', agent: { name: agents[0].name, avatar: null }, date: '3/8/2026', size: '8.2 MB' },
    { name: 'api-routes.ts', type: 'code', folder: 'engineering', status: 'Merged', agent: { name: agents[0].name, avatar: null }, date: '3/12/2026', size: '5.2 KB' },
    { name: 'deploy-config.yml', type: 'code', folder: 'engineering', status: 'Approved', agent: { name: agents[0].name, avatar: null }, date: '3/11/2026', size: '1.1 KB' },
    { name: 'migration-001.sql', type: 'code', folder: 'engineering', status: 'Merged', agent: { name: agents[0].name, avatar: null }, date: '3/10/2026', size: '2.8 KB' },
  ]

  return {
    objectives,
    tasks,
    taskComments,
    feedItems,
    agents,
    chatMessages,
    myRoles,
    tokenData,
    outputFolders,
    outputFiles,
  }
}

/**
 * Generate mock startup metadata for a slug.
 */
export function generateMockStartup(slug) {
  const rng = mulberry32(hashStr(slug || 'default'))
  const name = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'New Startup'
  const colors = ['#9fe870', '#FF5310', '#7C3AED', '#3784F4', '#00B95C', '#f59e0b']
  const revenue = `$${(Math.floor(rng() * 50) + 1) * 1000 >= 10000 ? ((Math.floor(rng() * 50) + 1) / 10).toFixed(1) + 'K' : (Math.floor(rng() * 9) + 1) + '.' + Math.floor(rng() * 9) + 'K'}`

  return {
    slug,
    name,
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: colors[Math.floor(rng() * colors.length)],
    token: pick(rng, TOKEN_SYMBOLS),
    status: rng() > 0.3 ? 'Incubating' : 'Graduated',
    agents: 2 + Math.floor(rng() * 3),
    revenue,
    founded: 'Mar 2026',
    avatarUrl: null,
  }
}
