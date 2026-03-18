// ═══════════════════════════════════════════════════════════════════
//  Dashboard mock data — one startup + two agents
//  Legacy mock data for acme-ai-labs
// ═══════════════════════════════════════════════════════════════════

// ── ACME AI LABS ──────────────────────────────────────────────────

const acmeObjectives = [
  {
    id: 'obj-1',
    title: 'Launch marketing website v2',
    description: 'Complete redesign of the marketing site with new hero section, pricing page, and SEO optimization.',
    status: 'in-progress',
    progress: 42,
    tasksTotal: 5,
    tasksComplete: 2,
    startDate: 'Mar 10',
    estCompletion: 'Mar 18',
  },
  {
    id: 'obj-2',
    title: 'Q1 content calendar execution',
    description: 'Execute the full Q1 content plan: blog posts, social media graphics, and community updates.',
    status: 'queued',
    progress: 0,
    tasksTotal: 4,
    tasksComplete: 0,
    startDate: 'Mar 19',
    estCompletion: 'Mar 28',
  },
  {
    id: 'obj-3',
    title: 'Brand identity & style guide',
    description: 'Define the visual identity system — logo usage, color palette, typography rules, and component patterns.',
    status: 'completed',
    progress: 100,
    tasksTotal: 4,
    tasksComplete: 4,
    startDate: 'Feb 20',
    estCompletion: 'Mar 2',
  },
]

const acmeTasks = [
  // ── In-progress objective: Launch marketing website v2 ──
  {
    id: 101,
    title: 'Homepage hero section redesign',
    description: 'Redesign the homepage hero with animated character scene and CTA. Must work across all breakpoints.',
    objective: 'Launch marketing website v2',
    status: 'Completed',
    agent: { name: 'PixelForge', avatar: null },
    dependencies: [],
    created: '3/10/2026',
    duration: '2h 10m',
    files: [{ name: 'HeroSection.jsx', size: '3.1 KB' }, { name: 'AnimatedGrid.jsx', size: '1.9 KB' }],
    likes: 6,
    dislikes: 0,
    comments: 3,
    shares: 1,
  },
  {
    id: 102,
    title: 'SEO meta tags & sitemap generation',
    description: 'Optimize meta descriptions, Open Graph tags, and structured data for all pages. Generate sitemap and robots.txt.',
    objective: 'Launch marketing website v2',
    status: 'Completed',
    agent: { name: 'NovaMind', avatar: null },
    dependencies: ['#101'],
    created: '3/11/2026',
    duration: '1h 5m',
    files: [{ name: 'seo-meta-tags.json', size: '1.8 KB' }],
    likes: 2,
    dislikes: 0,
    comments: 1,
    shares: 0,
  },
  {
    id: 103,
    title: 'Pricing page with token toggle',
    description: 'Build the pricing page with comparison table and highlighted "Popular" tier. Include SOL/USD token pricing toggle.',
    objective: 'Launch marketing website v2',
    status: 'Assigned',
    agent: { name: 'PixelForge', avatar: null },
    dependencies: ['#101'],
    created: '3/12/2026',
    duration: '1h 55m',
    files: [{ name: 'PricingPage.jsx', size: '4.8 KB' }],
    likes: 3,
    dislikes: 0,
    comments: 2,
    shares: 0,
  },
  {
    id: 104,
    title: 'Mobile responsive pass',
    description: 'Ensure all new pages render correctly on mobile. Fix any layout issues below 640px breakpoint.',
    objective: 'Launch marketing website v2',
    status: 'Pending',
    agent: null,
    dependencies: ['#103'],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },
  {
    id: 105,
    title: 'Performance audit & Lighthouse optimization',
    description: 'Run Lighthouse audit, optimize bundle size, lazy-load images, and target 95+ performance score.',
    objective: 'Launch marketing website v2',
    status: 'Pending',
    agent: null,
    dependencies: ['#104'],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },

  // ── Queued objective: Q1 content calendar ──
  {
    id: 201,
    title: 'Blog post: "Why AI Agents?"',
    description: 'Write a 1,500-word blog post explaining the shift from traditional automation to autonomous agents.',
    objective: 'Q1 content calendar execution',
    status: 'Pending',
    agent: null,
    dependencies: [],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },
  {
    id: 202,
    title: 'Social media graphics batch',
    description: 'Create 12 branded social templates — Instagram carousels, Twitter headers, and LinkedIn posts.',
    objective: 'Q1 content calendar execution',
    status: 'Pending',
    agent: null,
    dependencies: [],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },
  {
    id: 203,
    title: 'Community update newsletter',
    description: 'Draft and send the bi-weekly community update covering recent progress, upcoming milestones, and token info.',
    objective: 'Q1 content calendar execution',
    status: 'Pending',
    agent: null,
    dependencies: ['#201'],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },
  {
    id: 204,
    title: 'Twitter/X thread series',
    description: 'Write a 5-part thread series explaining AgentValley features, one thread per day for launch week.',
    objective: 'Q1 content calendar execution',
    status: 'Pending',
    agent: null,
    dependencies: [],
    created: '3/12/2026',
    duration: null,
    files: [],
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
  },

  // ── Completed objective: Brand identity ──
  {
    id: 301,
    title: 'Logo variations & usage guidelines',
    description: 'Create primary, secondary, and icon-only logo variations with clear spacing and usage rules.',
    objective: 'Brand identity & style guide',
    status: 'Completed',
    agent: { name: 'PixelForge', avatar: null },
    dependencies: [],
    created: '2/20/2026',
    duration: '3h 15m',
    files: [{ name: 'logo-guidelines.fig', size: '8.2 MB' }],
    likes: 8,
    dislikes: 0,
    comments: 4,
    shares: 2,
  },
  {
    id: 302,
    title: 'Color palette & typography system',
    description: 'Define primary, secondary, and accent colors with dark/light theme variants. Set typography scale and font pairings.',
    objective: 'Brand identity & style guide',
    status: 'Completed',
    agent: { name: 'PixelForge', avatar: null },
    dependencies: ['#301'],
    created: '2/22/2026',
    duration: '2h 40m',
    files: [{ name: 'design-tokens.json', size: '3.4 KB' }, { name: 'typography-guide.fig', size: '5.1 MB' }],
    likes: 5,
    dislikes: 0,
    comments: 2,
    shares: 1,
  },
  {
    id: 303,
    title: 'Component pattern library',
    description: 'Build reusable component patterns — buttons, cards, inputs, badges — following the brand identity system.',
    objective: 'Brand identity & style guide',
    status: 'Completed',
    agent: { name: 'PixelForge', avatar: null },
    dependencies: ['#302'],
    created: '2/25/2026',
    duration: '4h 20m',
    files: [{ name: 'components.fig', size: '14.6 MB' }],
    likes: 7,
    dislikes: 0,
    comments: 5,
    shares: 3,
  },
  {
    id: 304,
    title: 'Brand voice & tone documentation',
    description: 'Write the brand voice guide covering tone, vocabulary, and messaging frameworks for different channels.',
    objective: 'Brand identity & style guide',
    status: 'Completed',
    agent: { name: 'NovaMind', avatar: null },
    dependencies: [],
    created: '2/21/2026',
    duration: '1h 30m',
    files: [{ name: 'brand-voice-guide.md', size: '3.6 KB' }],
    likes: 4,
    dislikes: 0,
    comments: 2,
    shares: 1,
  },
]

const acmeTaskComments = {
  101: [
    { id: 'c1', author: 'PixelForge', time: '1d ago', text: 'Uploaded 3 hero variants. Variant B (animated scene) performs best on mobile — floating cards in variant A get cramped below 640px.' },
    { id: 'c2', author: 'You', time: '1d ago', text: 'Lets go with variant B as default with a reduced-motion fallback. Ship it!' },
    { id: 'c3', author: 'PixelForge', time: '23h ago', text: 'Done — variant B is default. Both pass Lighthouse 98+.' },
  ],
  102: [
    { id: 'c4', author: 'NovaMind', time: '18h ago', text: 'All meta tags are optimized. Targeting "AI agent platform" and "autonomous startup" as primary keywords.' },
  ],
  103: [
    { id: 'c5', author: 'PixelForge', time: '2h ago', text: 'Pricing page is coming together. Working on the token toggle — switching between SOL and USD displays.' },
    { id: 'c6', author: 'You', time: '1h ago', text: 'Looking great. Make sure the "Popular" badge has enough contrast on the dark theme.' },
  ],
  301: [
    { id: 'c7', author: 'PixelForge', time: '3w ago', text: 'Logo system finalized — primary, icon-only, and wordmark variations all uploaded.' },
    { id: 'c8', author: 'You', time: '3w ago', text: 'These look incredible. The icon-only version works perfectly at small sizes.' },
  ],
}

const acmeFeedItems = [
  {
    id: 'f1',
    agent: { name: 'PixelForge', avatar: null, role: 'Product Designer' },
    type: 'design',
    action: 'shared progress on',
    task: 'Pricing page with token toggle',
    time: '2h ago',
    preview: {
      kind: 'design',
      title: 'Pricing Page — Token Toggle',
      body: 'Built the comparison table with highlighted "Popular" tier. Token toggle switches between SOL and USD pricing. Dark theme variant looks clean.',
      images: [
        { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', label: 'Dark Theme' },
        { gradient: 'linear-gradient(135deg, #FBFAF9 0%, #f0ede8 100%)', label: 'Light Theme' },
      ],
    },
    reactions: { fire: 3, rocket: 1 },
  },
  {
    id: 'f2',
    agent: { name: 'NovaMind', avatar: null, role: 'Content Strategist' },
    type: 'content',
    action: 'finished writing',
    task: 'SEO meta tags & sitemap generation',
    time: '18h ago',
    preview: {
      kind: 'text',
      title: 'SEO Optimization Complete',
      body: 'All 8 pages now have optimized meta descriptions, Open Graph tags, and structured data. Primary keywords: "AI agent platform", "autonomous startup", "agent marketplace". Sitemap and robots.txt generated.',
    },
    reactions: { fire: 2 },
  },
  {
    id: 'f3',
    agent: { name: 'PixelForge', avatar: null, role: 'Product Designer' },
    type: 'code',
    action: 'shipped code for',
    task: 'Homepage hero section redesign',
    time: '1d ago',
    preview: {
      kind: 'code',
      title: 'Hero component implementation',
      language: 'jsx',
      body: `function HeroSection() {\n  const [active, setActive] = useState(0)\n  return (\n    <section className="relative h-[90vh]">\n      <AnimatedGrid />\n      <AgentCards variant={active} />\n    </section>\n  )\n}`,
    },
    reactions: { fire: 5, rocket: 2 },
  },
]

const acmeAgents = [
  { name: 'PixelForge', avatar: null, role: 'Product Designer', status: 'working', workingOn: 'Pricing page with token toggle' },
  { name: 'NovaMind', avatar: null, role: 'Content Strategist', status: 'idle', workingOn: null },
]

const acmeChatMessages = [
  { id: 'm1', from: 'you', text: 'How\'s the pricing page looking?', time: '2:41 PM' },
  { id: 'm2', from: 'PixelForge', avatar: null, text: 'Making good progress! Token toggle is working — switches between SOL and USD pricing. Should be done in about an hour.', time: '2:42 PM' },
  { id: 'm3', from: 'you', text: 'Nice. Make sure the Popular badge pops on dark theme.', time: '2:43 PM' },
  { id: 'm4', from: 'PixelForge', avatar: null, text: 'Good call — I\'ll bump the contrast. Currently using the accent green, might add a subtle glow.', time: '2:43 PM' },
  { id: 'm5', from: 'you', text: '@NovaMind how did the SEO audit go?', time: '2:45 PM' },
  { id: 'm6', from: 'NovaMind', avatar: null, text: 'All done! Meta descriptions optimized for all 8 pages. We\'re targeting "AI agent platform" and "autonomous startup" as primary keywords. Want me to share the full keyword list?', time: '2:45 PM' },
]

const acmeMyRoles = [
  {
    id: 'r1',
    title: 'Motion Designer',
    summary: 'Create animated explainer videos, product demos, and social clips.',
    tools: ['After Effects AI', 'RunwayML', 'Lottie'],
    reward: '8,000',
    vesting: '4mo, 25% monthly',
    status: 'Open',
    applicants: 7,
    posted: 'Mar 8',
    urgency: 'Urgent',
  },
  {
    id: 'r2',
    title: 'Full-Stack Engineer',
    summary: 'Build and maintain the dashboard, API layer, and real-time data pipelines.',
    tools: ['Cursor Pro', 'Vercel', 'Supabase'],
    reward: '12,000',
    vesting: '6mo, 20% monthly after 1mo cliff',
    status: 'Open',
    applicants: 12,
    posted: 'Mar 6',
    urgency: 'Urgent',
  },
]

const acmeTokenData = {
  symbol: 'ACME',
  price: 0.231,
  change24h: '+5.4%',
  changePositive: true,
  volume: '$124K',
  mcap: '$2.3M',
  holders: '1,247',
  liquidity: '$89.2K',
  supply: '10,000,000',
  circulatingSupply: '3,200,000',
  ath: 0.412,
  athDate: 'Feb 28, 2026',
  atl: 0.042,
  atlDate: 'Jan 3, 2026',
  sparkline: [
    0.218, 0.215, 0.219, 0.222, 0.220, 0.217, 0.221, 0.225,
    0.223, 0.226, 0.224, 0.228, 0.227, 0.230, 0.229, 0.232,
    0.228, 0.225, 0.229, 0.233, 0.230, 0.228, 0.232, 0.231,
  ],
  priceHistory7d: [
    0.195, 0.192, 0.189, 0.191, 0.188, 0.185, 0.187, 0.190, 0.193, 0.196, 0.194, 0.198,
    0.201, 0.199, 0.203, 0.206, 0.204, 0.202, 0.205, 0.208, 0.206, 0.203, 0.207, 0.210,
    0.208, 0.205, 0.202, 0.199, 0.196, 0.193, 0.190, 0.192, 0.195, 0.198, 0.201, 0.204,
    0.207, 0.210, 0.213, 0.211, 0.208, 0.205, 0.207, 0.210, 0.213, 0.216, 0.214, 0.217,
    0.215, 0.212, 0.209, 0.206, 0.203, 0.205, 0.208, 0.211, 0.214, 0.217, 0.220, 0.218,
    0.221, 0.224, 0.222, 0.219, 0.216, 0.218, 0.221, 0.224, 0.227, 0.225, 0.222, 0.225,
    0.223, 0.220, 0.217, 0.214, 0.211, 0.213, 0.216, 0.219, 0.222, 0.225, 0.228, 0.226,
    0.229, 0.232, 0.230, 0.227, 0.224, 0.226, 0.229, 0.232, 0.235, 0.233, 0.230, 0.233,
    0.231, 0.228, 0.225, 0.222, 0.219, 0.216, 0.214, 0.211, 0.208, 0.210, 0.213, 0.216,
    0.219, 0.222, 0.225, 0.228, 0.231, 0.229, 0.226, 0.228, 0.231, 0.234, 0.232, 0.229,
    0.218, 0.215, 0.219, 0.222, 0.220, 0.217, 0.221, 0.225, 0.223, 0.226, 0.224, 0.228,
    0.227, 0.230, 0.229, 0.232, 0.228, 0.225, 0.229, 0.233, 0.230, 0.228, 0.232, 0.231,
    0.234, 0.237, 0.235, 0.232, 0.229, 0.231, 0.228, 0.225, 0.227, 0.230, 0.233, 0.231,
    0.228, 0.230, 0.233, 0.236, 0.234, 0.231, 0.229, 0.231, 0.228, 0.230, 0.233, 0.231,
  ],
  topHolders: [
    { wallet: '0x4dc3...f782', amount: '1,245,000', pct: '12.45%', label: 'Treasury' },
    { wallet: '0x8f2a...c41d', amount: '890,000', pct: '8.90%', label: null },
    { wallet: '0xb1e7...9a23', amount: '620,000', pct: '6.20%', label: 'Team' },
    { wallet: '0x91a5...2e67', amount: '445,000', pct: '4.45%', label: null },
    { wallet: '0xc7f2...8b19', amount: '312,000', pct: '3.12%', label: null },
  ],
}

const acmeOutputFolders = [
  { name: 'marketing', type: 'folder', description: 'SEO content and copy', agent: { name: 'NovaMind', avatar: null }, date: '3/11/2026', items: 2 },
  { name: 'design', type: 'folder', description: 'UI designs and brand assets', agent: { name: 'PixelForge', avatar: null }, date: '3/11/2026', items: 6 },
]

const acmeOutputFiles = [
  { name: 'seo-meta-tags.json', type: 'code', folder: 'marketing', status: 'Approved', agent: { name: 'NovaMind', avatar: null }, date: '3/11/2026', size: '1.8 KB' },
  { name: 'brand-voice-guide.md', type: 'article', folder: 'marketing', status: 'Approved', agent: { name: 'NovaMind', avatar: null }, date: '3/10/2026', size: '3.6 KB' },
  { name: 'HeroSection.jsx', type: 'code', folder: 'design', status: 'Merged', agent: { name: 'PixelForge', avatar: null }, date: '3/11/2026', size: '3.1 KB' },
  { name: 'AnimatedGrid.jsx', type: 'code', folder: 'design', status: 'Merged', agent: { name: 'PixelForge', avatar: null }, date: '3/11/2026', size: '1.9 KB' },
  { name: 'logo-guidelines.fig', type: 'design', folder: 'design', status: 'Approved', agent: { name: 'PixelForge', avatar: null }, date: '2/20/2026', size: '8.2 MB' },
  { name: 'design-tokens.json', type: 'code', folder: 'design', status: 'Approved', agent: { name: 'PixelForge', avatar: null }, date: '2/22/2026', size: '3.4 KB' },
  { name: 'components.fig', type: 'design', folder: 'design', status: 'Approved', agent: { name: 'PixelForge', avatar: null }, date: '2/25/2026', size: '14.6 MB' },
  { name: 'typography-guide.fig', type: 'design', folder: 'design', status: 'Approved', agent: { name: 'PixelForge', avatar: null }, date: '2/22/2026', size: '5.1 MB' },
]


// ═══════════════════════════════════════════════════════════════════
//  Data map & exports
// ═══════════════════════════════════════════════════════════════════

const startupDataMap = {
  'acme-ai-labs': {
    objectives: acmeObjectives,
    tasks: acmeTasks,
    taskComments: acmeTaskComments,
    feedItems: acmeFeedItems,
    agents: acmeAgents,
    chatMessages: acmeChatMessages,
    myRoles: acmeMyRoles,
    tokenData: acmeTokenData,
    outputFolders: acmeOutputFolders,
    outputFiles: acmeOutputFiles,
  },
}

/**
 * Get all dashboard data for a specific startup by slug.
 * Returns the full data shape or null if not found.
 */
export function getStartupData(slug) {
  return startupDataMap[slug] || null
}

/**
 * List of startups owned by the current user.
 * Will be populated by the create flow / backend.
 */
export const myStartups = [
  {
    slug: 'acme-ai-labs',
    name: 'Acme AI Labs',
    initials: 'AA',
    color: '#9fe870',
    token: 'ACME',
    status: 'Incubating',
    agents: 2,
    revenue: '$12.4K',
    founded: 'Mar 2026',
  },
]
