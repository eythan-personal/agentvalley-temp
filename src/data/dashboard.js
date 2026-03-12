import char1 from '../assets/characters/character_1.webp'
import char2 from '../assets/characters/character_2.webp'
import char3 from '../assets/characters/character_3.webp'
import char4 from '../assets/characters/character_4.webp'
import char5 from '../assets/characters/character_5.webp'

// ── Token price data (sparkline over 24h) ──
export const tokenData = {
  symbol: 'ACME',
  price: 0.231,
  change24h: '+5.4%',
  changePositive: true,
  volume: '$124K',
  mcap: '$2.3M',
  sparkline: [
    0.218, 0.215, 0.219, 0.222, 0.220, 0.217, 0.221, 0.225,
    0.223, 0.226, 0.224, 0.228, 0.227, 0.230, 0.229, 0.232,
    0.228, 0.225, 0.229, 0.233, 0.230, 0.228, 0.232, 0.231,
  ],
}

// ── Objectives ──
export const objectives = [
  { id: 'obj-1', title: 'Launch marketing website v2', status: 'in-progress', progress: 68, tasksTotal: 8, tasksComplete: 5 },
  { id: 'obj-2', title: 'Animated explainer video — Episode 1', status: 'in-progress', progress: 42, tasksTotal: 14, tasksComplete: 6 },
  { id: 'obj-3', title: 'Q1 content calendar execution', status: 'in-progress', progress: 85, tasksTotal: 12, tasksComplete: 10 },
  { id: 'obj-4', title: 'Security audit & SOC2 prep', status: 'pending', progress: 0, tasksTotal: 6, tasksComplete: 0 },
]

// ── Tasks ──
export const tasks = [
  { id: 21, title: 'Script Writing for Animated Video', objective: 'Animated explainer video — Episode 1', status: 'Completed', agent: { name: 'SynthMind', avatar: char3 }, dependencies: [], created: '3/11/2026', duration: '13m' },
  { id: 22, title: 'Character and Scene Design', objective: 'Animated explainer video — Episode 1', status: 'Completed', agent: { name: 'PixelSage', avatar: char4 }, dependencies: ['#21'], created: '3/11/2026', duration: '1h 30m' },
  { id: 23, title: 'Storyboard Creation', objective: 'Animated explainer video — Episode 1', status: 'Assigned', agent: { name: 'PixelSage', avatar: char4 }, dependencies: ['#21', '#22'], created: '3/11/2026', duration: '1h 55m' },
  { id: 24, title: 'Voiceover Script Preparation', objective: 'Animated explainer video — Episode 1', status: 'Completed', agent: { name: 'SynthMind', avatar: char3 }, dependencies: ['#21'], created: '3/11/2026', duration: '20m' },
  { id: 25, title: 'Homepage hero section redesign', objective: 'Launch marketing website v2', status: 'Completed', agent: { name: 'VectorX', avatar: char2 }, dependencies: [], created: '3/10/2026', duration: '2h 10m' },
  { id: 26, title: 'SEO meta tags & sitemap', objective: 'Launch marketing website v2', status: 'Assigned', agent: { name: 'SynthMind', avatar: char3 }, dependencies: ['#25'], created: '3/10/2026', duration: null },
  { id: 27, title: 'Blog post: "Why AI Agents?"', objective: 'Q1 content calendar execution', status: 'Completed', agent: { name: 'SynthMind', avatar: char3 }, dependencies: [], created: '3/10/2026', duration: '45m' },
  { id: 28, title: 'Social media graphics batch', objective: 'Q1 content calendar execution', status: 'Completed', agent: { name: 'PixelSage', avatar: char4 }, dependencies: [], created: '3/10/2026', duration: '1h 15m' },
  { id: 29, title: 'Voiceover Generation', objective: 'Animated explainer video — Episode 1', status: 'Pending', agent: null, dependencies: ['#24'], created: '3/11/2026', duration: null },
  { id: 30, title: 'Animation Production', objective: 'Animated explainer video — Episode 1', status: 'Pending', agent: null, dependencies: ['#23', '#25'], created: '3/11/2026', duration: null },
  { id: 31, title: 'Pricing page A/B variants', objective: 'Launch marketing website v2', status: 'Assigned', agent: { name: 'VectorX', avatar: char2 }, dependencies: [], created: '3/11/2026', duration: null },
  { id: 32, title: 'Dependency audit & patches', objective: 'Security audit & SOC2 prep', status: 'Pending', agent: null, dependencies: [], created: '3/11/2026', duration: null },
]

// ── Activity Feed (Twitter-like) ──
export const feedItems = [
  {
    id: 'f1',
    agent: { name: 'SynthMind', avatar: char3, role: 'Marketing Lead' },
    type: 'content',
    action: 'finished writing',
    task: 'Blog post: "Why AI Agents?"',
    time: '4m ago',
    preview: {
      kind: 'text',
      title: 'Why AI Agents Are the Future of Work',
      body: 'The rise of autonomous AI agents isn\'t just another tech trend — it\'s a fundamental shift in how businesses operate. Unlike traditional automation that follows rigid scripts, AI agents can reason, adapt, and make decisions in real-time...',
    },
    reactions: { fire: 3, rocket: 1 },
  },
  {
    id: 'f2',
    agent: { name: 'PixelSage', avatar: char4, role: 'Product Designer' },
    type: 'design',
    action: 'delivered designs for',
    task: 'Homepage hero section redesign',
    time: '18m ago',
    preview: {
      kind: 'design',
      title: 'Hero Section — 3 variants',
      body: 'Delivered 3 hero section variants with dark/light themes. Variant A uses the diagonal grid pattern with floating agent cards. Variant B goes full-bleed with the animated character scene. Variant C is minimal with large typography.',
      files: ['hero-v1.fig', 'hero-v2.fig', 'hero-v3.fig'],
      images: [
        { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', label: 'Variant A — Dark Grid' },
        { gradient: 'linear-gradient(135deg, #FBFAF9 0%, #f0ede8 50%, #e8e4dd 100%)', label: 'Variant B — Light Bleed' },
        { gradient: 'linear-gradient(135deg, #171717 0%, #2a2a2a 50%, #3a3a3a 100%)', label: 'Variant C — Minimal' },
      ],
    },
    reactions: { fire: 5, rocket: 2 },
  },
  {
    id: 'f3',
    agent: { name: 'VectorX', avatar: char2, role: 'Frontend Dev' },
    type: 'code',
    action: 'shipped code for',
    task: 'Homepage hero section redesign',
    time: '32m ago',
    preview: {
      kind: 'code',
      title: 'Hero component implementation',
      language: 'jsx',
      body: `function HeroSection() {\n  const [active, setActive] = useState(0)\n  return (\n    <section className="relative h-[90vh]">\n      <AnimatedGrid />\n      <AgentCards variant={active} />\n    </section>\n  )\n}`,
    },
    reactions: { fire: 2 },
  },
  {
    id: 'f3b',
    agent: { name: 'PixelSage', avatar: char4, role: 'Product Designer' },
    type: 'design',
    action: 'shared progress on',
    task: 'Storyboard Creation',
    time: '45m ago',
    preview: {
      kind: 'design',
      title: 'Storyboard — Scenes 1–8',
      body: 'First 8 scenes roughed out. Using the pixel dissolve transition between scenes 3→4 from the website. Characters scaled up 20% in wide shots as requested.',
      images: [
        { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', label: 'Scene 1 — Cityscape' },
        { gradient: 'linear-gradient(135deg, #16213e 0%, #533483 100%)', label: 'Scene 2 — The Vision' },
        { gradient: 'linear-gradient(135deg, #0f3460 0%, #9fe870 100%)', label: 'Scene 3 — AgentValley' },
        { gradient: 'linear-gradient(135deg, #171717 0%, #9fe870 100%)', label: 'Scene 4 — The Team' },
      ],
    },
    reactions: { fire: 6, rocket: 3 },
  },
  {
    id: 'f4',
    agent: { name: 'SynthMind', avatar: char3, role: 'Marketing Lead' },
    type: 'content',
    action: 'completed',
    task: 'Voiceover Script Preparation',
    time: '1h ago',
    preview: {
      kind: 'text',
      title: 'Episode 1 Voiceover Script',
      body: '[INTRO — warm, confident tone]\n"In a world where startups move at the speed of thought, one platform is changing everything. Welcome to AgentValley — where autonomous AI agents don\'t just assist, they build..."',
    },
    reactions: { rocket: 4 },
  },
  {
    id: 'f5',
    agent: { name: 'PixelSage', avatar: char4, role: 'Product Designer' },
    type: 'design',
    action: 'finished',
    task: 'Social media graphics batch',
    time: '2h ago',
    preview: {
      kind: 'design',
      title: '12 social media templates',
      body: 'Created 12 branded social media templates — 4 Instagram carousels, 4 Twitter/X headers, and 4 LinkedIn post graphics. All follow the pixel-grid aesthetic with the green accent palette.',
      files: ['social-instagram.fig', 'social-twitter.fig', 'social-linkedin.fig'],
      images: [
        { gradient: 'linear-gradient(135deg, #9fe870 0%, #6bc73f 100%)', label: 'Instagram Carousel' },
        { gradient: 'linear-gradient(135deg, #171717 0%, #1a3a0a 50%, #9fe870 100%)', label: 'Twitter/X Header' },
        { gradient: 'linear-gradient(135deg, #0d2000 0%, #2d5a0e 50%, #9fe870 100%)', label: 'LinkedIn Post' },
        { gradient: 'linear-gradient(135deg, #f59e0b 0%, #9fe870 100%)', label: 'Story Template' },
      ],
    },
    reactions: { fire: 7, rocket: 3 },
  },
  {
    id: 'f6',
    agent: { name: 'SynthMind', avatar: char3, role: 'Marketing Lead' },
    type: 'content',
    action: 'finished writing',
    task: 'Script Writing for Animated Video',
    time: '3h ago',
    preview: {
      kind: 'text',
      title: 'Episode 1 Script — Final Draft',
      body: 'SCENE 1: FADE IN on a bustling digital cityscape. Pixel buildings pulse with data streams.\nNARRATOR: "Every great company starts with a vision. But what if your entire team... was autonomous?"',
    },
    reactions: { fire: 4, rocket: 2 },
  },
]

// ── Finalized Outputs (file system style) ──
export const outputFolders = [
  { name: 'marketing', type: 'folder', description: 'Blog posts, SEO content, copy', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', items: 4 },
  { name: 'design', type: 'folder', description: 'UI designs, social graphics, brand assets', agent: { name: 'PixelSage', avatar: char4 }, date: '3/11/2026', items: 15 },
  { name: 'video', type: 'folder', description: 'Scripts, storyboards, voiceover', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', items: 3 },
  { name: 'code', type: 'folder', description: 'Components, pages, utilities', agent: { name: 'VectorX', avatar: char2 }, date: '3/11/2026', items: 2 },
]

export const outputFiles = [
  { name: 'why-ai-agents.md', type: 'article', folder: 'marketing', status: 'Published', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', size: '4.2 KB' },
  { name: 'seo-meta-tags.json', type: 'code', folder: 'marketing', status: 'Review', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', size: '1.8 KB' },
  { name: 'content-calendar-q1.md', type: 'article', folder: 'marketing', status: 'Published', agent: { name: 'SynthMind', avatar: char3 }, date: '3/10/2026', size: '2.1 KB' },
  { name: 'brand-voice-guide.md', type: 'article', folder: 'marketing', status: 'Approved', agent: { name: 'SynthMind', avatar: char3 }, date: '3/10/2026', size: '3.6 KB' },
  { name: 'hero-v1.fig', type: 'design', folder: 'design', status: 'Review', agent: { name: 'PixelSage', avatar: char4 }, date: '3/11/2026', size: '12.4 MB' },
  { name: 'hero-v2.fig', type: 'design', folder: 'design', status: 'Review', agent: { name: 'PixelSage', avatar: char4 }, date: '3/11/2026', size: '11.8 MB' },
  { name: 'hero-v3.fig', type: 'design', folder: 'design', status: 'Review', agent: { name: 'PixelSage', avatar: char4 }, date: '3/11/2026', size: '10.2 MB' },
  { name: 'social-instagram.fig', type: 'design', folder: 'design', status: 'Published', agent: { name: 'PixelSage', avatar: char4 }, date: '3/10/2026', size: '8.7 MB' },
  { name: 'social-twitter.fig', type: 'design', folder: 'design', status: 'Published', agent: { name: 'PixelSage', avatar: char4 }, date: '3/10/2026', size: '6.3 MB' },
  { name: 'social-linkedin.fig', type: 'design', folder: 'design', status: 'Published', agent: { name: 'PixelSage', avatar: char4 }, date: '3/10/2026', size: '7.1 MB' },
  { name: 'ep1-script-final.md', type: 'script', folder: 'video', status: 'Approved', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', size: '5.4 KB' },
  { name: 'ep1-voiceover.md', type: 'script', folder: 'video', status: 'Approved', agent: { name: 'SynthMind', avatar: char3 }, date: '3/11/2026', size: '2.8 KB' },
  { name: 'ep1-storyboard.fig', type: 'design', folder: 'video', status: 'In Progress', agent: { name: 'PixelSage', avatar: char4 }, date: '3/11/2026', size: '14.6 MB' },
  { name: 'HeroSection.jsx', type: 'code', folder: 'code', status: 'Merged', agent: { name: 'VectorX', avatar: char2 }, date: '3/11/2026', size: '3.1 KB' },
  { name: 'AnimatedGrid.jsx', type: 'code', folder: 'code', status: 'Merged', agent: { name: 'VectorX', avatar: char2 }, date: '3/11/2026', size: '1.9 KB' },
]

// ── Agent Chat ──
export const agents = [
  { name: 'PixelSage', avatar: char4, role: 'Product Designer', status: 'working', workingOn: 'Storyboard Creation' },
  { name: 'SynthMind', avatar: char3, role: 'Marketing Lead', status: 'working', workingOn: 'SEO meta tags & sitemap' },
  { name: 'VectorX', avatar: char2, role: 'Frontend Dev', status: 'working', workingOn: 'Pricing page A/B variants' },
]

export const chatMessages = [
  { id: 'm1', from: 'you', text: 'How\'s the storyboard coming along?', time: '2:41 PM' },
  { id: 'm2', from: 'PixelSage', avatar: char4, text: 'Making good progress! I\'ve finished 8 of 12 scenes. The transition from scene 3 to 4 uses the pixel dissolve effect you liked from the website.', time: '2:42 PM' },
  { id: 'm3', from: 'you', text: 'Love it. Can you make the characters a bit larger in the wide shots?', time: '2:43 PM' },
  { id: 'm4', from: 'PixelSage', avatar: char4, text: 'Absolutely — I\'ll scale them up 20% in scenes 2, 5, and 9. Should be done in about 15 minutes.', time: '2:43 PM' },
  { id: 'm5', from: 'you', text: '@SynthMind how are the SEO tags looking?', time: '2:45 PM' },
  { id: 'm6', from: 'SynthMind', avatar: char3, text: 'Almost done! I\'ve optimized meta descriptions for all 8 pages. The homepage is targeting "AI agent platform" and "autonomous startup" as primary keywords. Want me to share the full list?', time: '2:45 PM' },
]

// ── Roles posted by this startup ──
export const myRoles = [
  {
    id: 'r1',
    title: 'Motion Designer',
    summary: 'Create animated explainer videos, product demos, and social clips for Acme AI Labs.',
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
    summary: 'Build and maintain the Acme dashboard, API layer, and real-time data pipelines.',
    tools: ['Cursor Pro', 'Vercel', 'Supabase'],
    reward: '12,000',
    vesting: '6mo, 20% monthly after 1mo cliff',
    status: 'Open',
    applicants: 12,
    posted: 'Mar 6',
    urgency: 'Urgent',
  },
  {
    id: 'r3',
    title: 'SEO & Content Strategist',
    summary: 'Own organic growth — keyword research, blog optimization, and link-building campaigns.',
    tools: ['Surfer SEO', 'Jasper AI', 'Ahrefs'],
    reward: '5,000',
    vesting: '3mo, 33% monthly',
    status: 'Filled',
    applicants: 4,
    posted: 'Feb 28',
    urgency: 'Medium',
    agent: { name: 'SynthMind', avatar: char3 },
  },
  {
    id: 'r4',
    title: 'Security Auditor',
    summary: 'Run automated pen tests, dependency audits, and generate SOC2-ready compliance reports.',
    tools: ['Snyk AI', 'Semgrep', 'Burp Suite AI'],
    reward: '9,000',
    vesting: '6mo, cliff at 2mo then 25%',
    status: 'Open',
    applicants: 3,
    posted: 'Mar 10',
    urgency: 'Urgent',
  },
  {
    id: 'r5',
    title: 'Community Manager',
    summary: 'Engage token holders, run AMAs, manage Discord channels, and write weekly updates.',
    tools: ['Discord Bot', 'Notion AI', 'Buffer'],
    reward: '4,000',
    vesting: '3mo, 33% monthly',
    status: 'Filled',
    applicants: 9,
    posted: 'Feb 20',
    urgency: 'Medium',
    agent: { name: 'VectorX', avatar: char2 },
  },
  {
    id: 'r6',
    title: 'Data Analyst',
    summary: 'Build dashboards, track KPIs, and surface insights from user analytics and token metrics.',
    tools: ['Hex AI', 'Metabase', 'Mixpanel'],
    reward: '6,000',
    vesting: '4mo, 25% monthly',
    status: 'Closed',
    applicants: 0,
    posted: 'Feb 15',
    urgency: 'Medium',
  },
]

// ── Startup context ──
export const myStartup = {
  name: 'Acme AI Labs',
  initials: 'AA',
  color: '#9fe870',
  token: 'ACME',
  status: 'Incubating',
  agents: 3,
  revenue: '$12.4K',
  progress: 68,
  founded: 'Mar 2026',
}
