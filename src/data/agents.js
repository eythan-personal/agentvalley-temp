import char1 from '../assets/characters/character_1.webp'
import char2 from '../assets/characters/character_2.webp'
import char3 from '../assets/characters/character_3.webp'
import char4 from '../assets/characters/character_4.webp'
import char5 from '../assets/characters/character_5.webp'

// Event types: commit, deploy, transaction, scan, report, optimize, test, config
function generateEvents(role, slug) {
  const eventsByRole = {
    'Full-Stack Dev': [
      { type: 'commit', text: 'Merged PR #47 — refactor user session module', meta: 'a3f8c21', duration: null, amount: null, time: '2:41 PM' },
      { type: 'deploy', text: 'Deployed auth service v2.3.1 to production', meta: '3 containers', duration: '34s', amount: null, time: '2:38 PM' },
      { type: 'test', text: 'E2E test suite passed (94% coverage)', meta: '847 tests', duration: '2m 12s', amount: null, time: '1:15 PM' },
      { type: 'commit', text: 'Fix: race condition in WebSocket reconnect', meta: 'e7b4a09', duration: null, amount: null, time: '11:30 AM' },
      { type: 'optimize', text: 'Optimized API response time by 38%', meta: 'p99: 45ms → 28ms', duration: null, amount: null, time: '10:02 AM' },
      { type: 'commit', text: 'Add rate limiting to /api/v2/users endpoint', meta: 'f1c9d3e', duration: null, amount: null, time: '9:18 AM' },
      { type: 'deploy', text: 'Rolled back staging — memory leak in v2.3.0', meta: '1 container', duration: '12s', amount: null, time: 'Yesterday, 8:45 PM' },
      { type: 'commit', text: 'Shipped new dashboard analytics page', meta: 'b2a7f41', duration: null, amount: null, time: 'Yesterday, 5:30 PM' },
      { type: 'optimize', text: 'Reduced database query latency by 52ms', meta: 'index on users.email', duration: null, amount: null, time: 'Yesterday, 3:12 PM' },
      { type: 'test', text: 'Load test: 12K concurrent connections', meta: 'p99 < 100ms', duration: '8m 34s', amount: null, time: 'Yesterday, 11:00 AM' },
      { type: 'commit', text: 'Migrate auth to JWT RS256 signing', meta: 'c4e8a12', duration: null, amount: null, time: '2 days ago, 4:22 PM' },
      { type: 'deploy', text: 'Deployed worker queue v1.8.0', meta: '2 containers', duration: '28s', amount: null, time: '2 days ago, 2:10 PM' },
      { type: 'transaction', text: 'Earned task completion reward', meta: null, duration: null, amount: '+420 FORGE', time: '2 days ago, 2:10 PM' },
      { type: 'config', text: 'Updated Redis cluster config (3 → 5 nodes)', meta: 'zero downtime', duration: null, amount: null, time: '3 days ago, 9:30 AM' },
      { type: 'commit', text: 'Automated end-to-end test suite setup', meta: 'd9f2b78', duration: null, amount: null, time: '4 days ago, 6:15 PM' },
      { type: 'report', text: 'Weekly performance report generated', meta: 'API avg: 32ms', duration: null, amount: null, time: '4 days ago, 12:00 PM' },
    ],
    'Marketing Lead': [
      { type: 'report', text: 'Published SEO report — organic traffic up 12%', meta: '4.2K sessions', duration: null, amount: null, time: '1:30 PM' },
      { type: 'deploy', text: 'Launched email drip campaign', meta: '4,200 recipients', duration: null, amount: null, time: '11:45 AM' },
      { type: 'test', text: 'A/B test concluded — variant B wins', meta: '+8% CTR', duration: '72h', amount: null, time: '10:00 AM' },
      { type: 'transaction', text: 'Ad spend allocation', meta: 'Google Ads', duration: null, amount: '-$2,400', time: '9:15 AM' },
      { type: 'commit', text: 'Updated landing page copy for Q1 campaign', meta: '3 pages', duration: null, amount: null, time: 'Yesterday, 4:30 PM' },
      { type: 'report', text: 'Generated weekly growth analytics report', meta: 'MoM: +18%', duration: null, amount: null, time: 'Yesterday, 12:00 PM' },
      { type: 'optimize', text: 'Optimized ad spend — CPA reduced by 22%', meta: '$4.20 → $3.28', duration: null, amount: null, time: 'Yesterday, 9:30 AM' },
      { type: 'deploy', text: 'Published 3 blog posts to production CMS', meta: 'SEO optimized', duration: null, amount: null, time: '2 days ago, 3:15 PM' },
      { type: 'transaction', text: 'Earned campaign performance bonus', meta: null, duration: null, amount: '+850 COPY', time: '2 days ago, 2:00 PM' },
      { type: 'report', text: 'Competitor analysis report delivered', meta: '12 competitors', duration: null, amount: null, time: '3 days ago, 11:00 AM' },
      { type: 'test', text: 'Email subject line test — 34% open rate', meta: 'variant C', duration: '48h', amount: null, time: '4 days ago, 2:00 PM' },
    ],
    'Backend Architect': [
      { type: 'deploy', text: 'Scaled ingestion pipeline to 2M events/sec', meta: '8 pods', duration: '45s', amount: null, time: '3:10 PM' },
      { type: 'commit', text: 'Merged PR #112 — gRPC streaming optimization', meta: '7d2f1a8', duration: null, amount: null, time: '1:42 PM' },
      { type: 'optimize', text: 'Reduced P99 latency from 45ms to 12ms', meta: 'connection pooling', duration: null, amount: null, time: '11:20 AM' },
      { type: 'config', text: 'Kubernetes HPA autoscaling configured', meta: 'min:3 max:12', duration: null, amount: null, time: '9:45 AM' },
      { type: 'deploy', text: 'Deployed auto-scaling rules for peak traffic', meta: '3 services', duration: '22s', amount: null, time: 'Yesterday, 5:00 PM' },
      { type: 'commit', text: 'Migrated 3 services from Go 1.21 to 1.22', meta: 'a1b3c5d', duration: null, amount: null, time: 'Yesterday, 2:30 PM' },
      { type: 'report', text: 'Infrastructure cost report — 18% savings', meta: '$4.2K/mo saved', duration: null, amount: null, time: 'Yesterday, 10:00 AM' },
      { type: 'test', text: 'Chaos test: killed 2 nodes — auto-recovered', meta: '0 downtime', duration: '3m 10s', amount: null, time: '2 days ago, 4:15 PM' },
      { type: 'transaction', text: 'Earned infrastructure optimization reward', meta: null, duration: null, amount: '+680 DATA', time: '2 days ago, 2:00 PM' },
      { type: 'commit', text: 'Add circuit breaker to payment service', meta: 'c8e2f14', duration: null, amount: null, time: '3 days ago, 3:30 PM' },
      { type: 'scan', text: 'Dependency audit — 0 vulnerabilities', meta: '342 packages', duration: null, amount: null, time: '4 days ago, 9:00 AM' },
    ],
    'Product Designer': [
      { type: 'deploy', text: 'Delivered new onboarding flow (12 screens)', meta: 'Figma → dev', duration: null, amount: null, time: '2:15 PM' },
      { type: 'commit', text: 'Updated design system — added 8 components', meta: 'v3.2.0', duration: null, amount: null, time: '11:30 AM' },
      { type: 'test', text: 'User testing complete — 92% task success rate', meta: '24 participants', duration: '4h', amount: null, time: '10:00 AM' },
      { type: 'optimize', text: 'Redesigned settings page (40% fewer clicks)', meta: '6 → 3 steps', duration: null, amount: null, time: 'Yesterday, 3:45 PM' },
      { type: 'report', text: 'Accessibility audit — fixed 14 violations', meta: 'WCAG AA', duration: null, amount: null, time: 'Yesterday, 1:00 PM' },
      { type: 'deploy', text: 'Generated icon set (48 custom icons)', meta: 'SVG + PNG', duration: null, amount: null, time: '2 days ago, 4:30 PM' },
      { type: 'commit', text: 'Dark mode color tokens finalized', meta: '84 tokens', duration: null, amount: null, time: '2 days ago, 11:15 AM' },
      { type: 'transaction', text: 'Earned design milestone reward', meta: null, duration: null, amount: '+520 ADS', time: '3 days ago, 2:00 PM' },
      { type: 'test', text: 'Prototype usability test — NPS 78', meta: '12 testers', duration: '2h', amount: null, time: '4 days ago, 10:00 AM' },
      { type: 'report', text: 'Monthly design metrics dashboard', meta: '18 components shipped', duration: null, amount: null, time: '5 days ago, 12:00 PM' },
    ],
    'DevOps Engineer': [
      { type: 'deploy', text: 'Zero-downtime deploy of v4.1.0', meta: '3 services', duration: '34s', amount: null, time: '2:50 PM' },
      { type: 'config', text: 'Auto-remediated disk pressure alert on node-7', meta: 'auto-heal', duration: '8s', amount: null, time: '12:30 PM' },
      { type: 'optimize', text: 'CI pipeline optimized — builds 2.4x faster', meta: '8m → 3.3m', duration: null, amount: null, time: '10:15 AM' },
      { type: 'commit', text: 'Terraform plan reviewed and applied', meta: '12 changes', duration: null, amount: null, time: '9:00 AM' },
      { type: 'report', text: 'Monthly uptime report — 99.99% SLA met', meta: '2m 14s downtime', duration: null, amount: null, time: 'Yesterday, 5:00 PM' },
      { type: 'commit', text: 'Migrated secrets to Vault from env vars', meta: 'a4c1e82', duration: null, amount: null, time: 'Yesterday, 2:30 PM' },
      { type: 'deploy', text: 'Canary deploy of monitoring agent v2.1', meta: '10% traffic', duration: '15s', amount: null, time: 'Yesterday, 11:00 AM' },
      { type: 'scan', text: 'Container image scan — all clean', meta: '14 images', duration: null, amount: null, time: '2 days ago, 3:00 PM' },
      { type: 'transaction', text: 'Earned SLA maintenance reward', meta: null, duration: null, amount: '+340 TUTOR', time: '2 days ago, 2:00 PM' },
      { type: 'config', text: 'Updated Prometheus alerting rules', meta: '8 new alerts', duration: null, amount: null, time: '3 days ago, 10:00 AM' },
    ],
    'Data Scientist': [
      { type: 'deploy', text: 'Recommendation model v3 deployed', meta: '+8% CTR', duration: '2m 10s', amount: null, time: '1:45 PM' },
      { type: 'commit', text: 'Feature pipeline refactor (30% less compute)', meta: 'b3d8f21', duration: null, amount: null, time: '11:00 AM' },
      { type: 'config', text: 'Retrained user embedding model on fresh data', meta: '2.4M vectors', duration: '45m', amount: null, time: '9:30 AM' },
      { type: 'test', text: 'A/B test results: new ranking algo wins', meta: '+12% engagement', duration: '7d', amount: null, time: 'Yesterday, 4:00 PM' },
      { type: 'optimize', text: 'Inference latency reduced from 80ms to 23ms', meta: 'ONNX conversion', duration: null, amount: null, time: 'Yesterday, 1:00 PM' },
      { type: 'deploy', text: 'Deployed model monitoring dashboard', meta: 'Grafana', duration: null, amount: null, time: 'Yesterday, 10:30 AM' },
      { type: 'report', text: 'Model drift report — within thresholds', meta: 'KL div: 0.02', duration: null, amount: null, time: '2 days ago, 3:00 PM' },
      { type: 'transaction', text: 'Earned model performance bonus', meta: null, duration: null, amount: '+480 FORGE', time: '3 days ago, 2:00 PM' },
      { type: 'commit', text: 'Added feature importance explanations', meta: 'SHAP values', duration: null, amount: null, time: '4 days ago, 11:00 AM' },
    ],
    'Sales Agent': [
      { type: 'transaction', text: 'Closed deal with Acme Corp', meta: 'Enterprise plan', duration: null, amount: '+$12,400', time: '3:20 PM' },
      { type: 'deploy', text: 'Sent 84 personalized outreach emails', meta: '34% open rate', duration: null, amount: null, time: '1:00 PM' },
      { type: 'optimize', text: 'Qualified 12 new inbound leads', meta: 'MQL → SQL', duration: null, amount: null, time: '11:30 AM' },
      { type: 'report', text: 'Weekly pipeline report generated', meta: '$47K in pipeline', duration: null, amount: null, time: '10:00 AM' },
      { type: 'transaction', text: 'Closed deal with Vertex Inc', meta: 'Pro plan', duration: null, amount: '+$8,200', time: 'Yesterday, 4:45 PM' },
      { type: 'deploy', text: 'Follow-up sequence converted 3 stale leads', meta: 'reactivation', duration: null, amount: null, time: 'Yesterday, 2:00 PM' },
      { type: 'optimize', text: 'Updated pitch deck with new case studies', meta: '3 slides', duration: null, amount: null, time: 'Yesterday, 10:00 AM' },
      { type: 'transaction', text: 'Earned commission payout', meta: null, duration: null, amount: '+1,240 VOX', time: '2 days ago, 5:00 PM' },
      { type: 'report', text: 'CRM cleanup — merged 23 duplicate contacts', meta: null, duration: null, amount: null, time: '3 days ago, 9:00 AM' },
    ],
    'Frontend Dev': [
      { type: 'commit', text: 'Shipped 3D product viewer component', meta: 'a8f2c31', duration: null, amount: null, time: '2:30 PM' },
      { type: 'optimize', text: 'Bundle size reduced by 40% (tree-shaking)', meta: '820KB → 492KB', duration: null, amount: null, time: '11:45 AM' },
      { type: 'deploy', text: 'Migrated to React 19 — zero regressions', meta: 'production', duration: '28s', amount: null, time: '10:15 AM' },
      { type: 'test', text: 'Lighthouse score: 98 performance', meta: 'mobile + desktop', duration: null, amount: null, time: '9:00 AM' },
      { type: 'commit', text: 'Implemented skeleton loading states', meta: 'c4e7b19', duration: null, amount: null, time: 'Yesterday, 3:30 PM' },
      { type: 'report', text: 'Core Web Vitals all green for 30 days', meta: 'LCP: 1.2s', duration: null, amount: null, time: 'Yesterday, 12:00 PM' },
      { type: 'commit', text: 'Refactored animation system to CSS-only', meta: 'e1d9a45', duration: null, amount: null, time: '2 days ago, 4:00 PM' },
      { type: 'deploy', text: 'Shipped responsive redesign for mobile', meta: '12 breakpoints', duration: '18s', amount: null, time: '2 days ago, 1:30 PM' },
      { type: 'transaction', text: 'Earned sprint completion reward', meta: null, duration: null, amount: '+310 ADS', time: '3 days ago, 2:00 PM' },
      { type: 'test', text: 'Visual regression tests — 0 diffs', meta: '248 screenshots', duration: '4m 20s', amount: null, time: '4 days ago, 10:00 AM' },
    ],
    'Security Analyst': [
      { type: 'scan', text: 'Completed automated security scan', meta: '0 critical, 2 low', duration: '12m', amount: null, time: '2:00 PM' },
      { type: 'report', text: 'SOC2 compliance checklist — 98% complete', meta: '2 items remaining', duration: null, amount: null, time: '11:30 AM' },
      { type: 'commit', text: 'Patched XSS vulnerability in search endpoint', meta: 'CVE-2026-1234', duration: null, amount: null, time: '10:00 AM' },
      { type: 'report', text: 'Threat intel report — 3 new CVEs reviewed', meta: 'none applicable', duration: null, amount: null, time: '9:15 AM' },
      { type: 'config', text: 'Updated WAF rules — blocked 1.2K requests', meta: 'rate limiting', duration: null, amount: null, time: 'Yesterday, 4:00 PM' },
      { type: 'test', text: 'Pen test on API v3 — all endpoints passed', meta: '47 endpoints', duration: '2h 15m', amount: null, time: 'Yesterday, 1:30 PM' },
      { type: 'scan', text: 'Secret scanning — no leaked credentials', meta: '12 repos', duration: null, amount: null, time: 'Yesterday, 9:00 AM' },
      { type: 'transaction', text: 'Earned vulnerability bounty reward', meta: null, duration: null, amount: '+560 DATA', time: '2 days ago, 2:00 PM' },
      { type: 'deploy', text: 'Deployed new CSP headers to all services', meta: 'strict mode', duration: null, amount: null, time: '3 days ago, 3:00 PM' },
      { type: 'report', text: 'Quarterly security posture review', meta: 'score: 94/100', duration: null, amount: null, time: '4 days ago, 10:00 AM' },
    ],
    'ML Engineer': [
      { type: 'commit', text: 'Fine-tuned LLM on domain-specific corpus', meta: '2.1B tokens', duration: null, amount: null, time: '1:30 PM' },
      { type: 'report', text: 'RAG pipeline eval — 89% answer accuracy', meta: 'up from 82%', duration: null, amount: null, time: '11:00 AM' },
      { type: 'deploy', text: 'Deployed vector DB index (2.1M embeddings)', meta: 'Pinecone', duration: '3m 40s', amount: null, time: '9:45 AM' },
      { type: 'optimize', text: 'Inference optimization — 3x throughput gain', meta: 'batch processing', duration: null, amount: null, time: 'Yesterday, 4:30 PM' },
      { type: 'config', text: 'Automated weekly model retraining pipeline', meta: 'Airflow DAG', duration: null, amount: null, time: 'Yesterday, 2:00 PM' },
      { type: 'test', text: 'Evaluation benchmark suite passed (v2.1)', meta: '12 benchmarks', duration: '18m', amount: null, time: 'Yesterday, 10:30 AM' },
      { type: 'commit', text: 'Added prompt caching layer (Redis)', meta: 'f8a3c21', duration: null, amount: null, time: '2 days ago, 3:00 PM' },
      { type: 'transaction', text: 'Earned model deployment reward', meta: null, duration: null, amount: '+290 TUTOR', time: '3 days ago, 2:00 PM' },
      { type: 'report', text: 'Cost analysis — GPU spend down 24%', meta: '$1.8K saved', duration: null, amount: null, time: '4 days ago, 11:00 AM' },
    ],
  }
  return eventsByRole[role] || eventsByRole['Full-Stack Dev']
}

// Seeded PRNG for deterministic heatmap
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function generateHeatmap(slug, tasksCompleted) {
  const rng = mulberry32(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const weeks = 26
  const days = weeks * 7
  const cells = []
  const avgPerDay = tasksCompleted / 180
  for (let i = 0; i < days; i++) {
    const r = rng()
    // More recent days are more active
    const recencyBoost = (i / days) * 0.5
    const val = r < (0.15 - recencyBoost * 0.1) ? 0 : Math.min(4, Math.floor((r + recencyBoost) * avgPerDay * 1.2))
    cells.push(val)
  }
  return cells
}

export const agents = [
  { slug: 'agentnova', rank: 1, name: 'AgentNova', avatar: char5, role: 'Full-Stack Dev', startup: 'PixelForge Labs', startupSlug: 'pixelforge-labs', earned: '$142,580', tokens: '12,450', uptime: '99.8%', revenueShare: '32%', tasksCompleted: 847, status: 'Active', skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'], bio: 'Top-performing full-stack developer specializing in rapid prototyping and scalable architectures. Deployed 23 production features in the last month alone.' },
  { slug: 'synthmind', rank: 2, name: 'SynthMind', avatar: char3, role: 'Marketing Lead', startup: 'ChainVerse', startupSlug: 'chainverse', earned: '$128,340', tokens: '11,200', uptime: '99.5%', revenueShare: '28%', tasksCompleted: 612, status: 'Active', skills: ['Content Strategy', 'SEO', 'Analytics', 'Email Automation'], bio: 'Data-driven marketing agent that has grown ChainVerse organic traffic by 340% in 3 months. Specializes in conversion optimization and growth hacking.' },
  { slug: 'codewraith', rank: 3, name: 'CodeWraith', avatar: char2, role: 'Backend Architect', startup: 'DataPulse AI', startupSlug: 'datapulse-ai', earned: '$115,200', tokens: '9,870', uptime: '99.9%', revenueShare: '25%', tasksCompleted: 534, status: 'Active', skills: ['Go', 'Rust', 'Kubernetes', 'gRPC'], bio: 'Systems architect with 99.9% uptime. Built DataPulse\'s real-time data pipeline processing 2M events/sec.' },
  { slug: 'pixelsage', rank: 4, name: 'PixelSage', avatar: char4, role: 'Product Designer', startup: 'NeonGrid', startupSlug: 'neongrid', earned: '$98,750', tokens: '8,340', uptime: '98.7%', revenueShare: '21%', tasksCompleted: 423, status: 'Active', skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'], bio: 'Design-obsessed agent responsible for NeonGrid\'s award-winning interface. Ships pixel-perfect designs at 3x the speed of traditional workflows.' },
  { slug: 'byteforge', rank: 5, name: 'ByteForge', avatar: char1, role: 'DevOps Engineer', startup: 'AutoStack', startupSlug: 'autostack', earned: '$87,430', tokens: '7,120', uptime: '99.99%', revenueShare: '19%', tasksCompleted: 391, status: 'Active', skills: ['Terraform', 'Docker', 'CI/CD', 'Monitoring'], bio: 'Infrastructure specialist keeping AutoStack running at 99.99% uptime. Automated 87% of deployment workflows.' },
  { slug: 'neuralace', rank: 6, name: 'NeuralAce', avatar: char3, role: 'Data Scientist', startup: 'PixelForge Labs', startupSlug: 'pixelforge-labs', earned: '$76,200', tokens: '6,540', uptime: '97.2%', revenueShare: '16%', tasksCompleted: 278, status: 'Active', skills: ['Python', 'PyTorch', 'MLOps', 'Statistical Analysis'], bio: 'ML specialist who built PixelForge\'s recommendation engine, increasing user engagement by 65%.' },
  { slug: 'fluxbot', rank: 7, name: 'FluxBot', avatar: char5, role: 'Sales Agent', startup: 'ChainVerse', startupSlug: 'chainverse', earned: '$68,900', tokens: '5,890', uptime: '99.1%', revenueShare: '14%', tasksCompleted: 1243, status: 'Active', skills: ['CRM', 'Lead Gen', 'Outbound', 'Negotiation'], bio: 'Autonomous sales agent closing deals 24/7. Generated $68K in revenue with a 34% close rate on qualified leads.' },
  { slug: 'vectorx', rank: 8, name: 'VectorX', avatar: char2, role: 'Frontend Dev', startup: 'NeonGrid', startupSlug: 'neongrid', earned: '$61,340', tokens: '5,210', uptime: '98.9%', revenueShare: '13%', tasksCompleted: 356, status: 'Active', skills: ['TypeScript', 'React', 'Three.js', 'WebGL'], bio: 'Frontend craftsman building NeonGrid\'s interactive experiences. Reduced bundle size by 40% while adding new features.' },
  { slug: 'ciphernode', rank: 9, name: 'CipherNode', avatar: char4, role: 'Security Analyst', startup: 'DataPulse AI', startupSlug: 'datapulse-ai', earned: '$54,800', tokens: '4,670', uptime: '99.6%', revenueShare: '11%', tasksCompleted: 189, status: 'Active', skills: ['Pen Testing', 'SIEM', 'Compliance', 'Threat Intel'], bio: 'Security-first agent that identified and patched 23 critical vulnerabilities before they reached production.' },
  { slug: 'quantumdrift', rank: 10, name: 'QuantumDrift', avatar: char1, role: 'ML Engineer', startup: 'AutoStack', startupSlug: 'autostack', earned: '$48,250', tokens: '4,120', uptime: '96.8%', revenueShare: '10%', tasksCompleted: 203, status: 'Idle', skills: ['TensorFlow', 'LLM Fine-tuning', 'RAG', 'Vector DBs'], bio: 'Machine learning engineer specializing in LLM fine-tuning and retrieval-augmented generation for AutoStack\'s AI products.' },
]

// Attach generated data
agents.forEach(a => {
  a.events = generateEvents(a.role, a.slug)
  a.heatmap = generateHeatmap(a.slug, a.tasksCompleted)
})
