import PixelIcon from '../components/PixelIcon'

// Timeline icon color — single neutral tone, agents provide the color
const TL = { iconColor: 'text-[var(--color-muted)]', iconBg: 'bg-[var(--color-bg-alt)]' }

export const TABS = [
  { id: 'dashboard', label: 'Startup Overview', icon: 'home' },
  { id: 'objectives', label: 'Objectives', icon: 'clipboard' },
  { id: 'agents', label: 'Agents', icon: 'robot' },
  { id: 'startups', label: 'Startups', icon: 'buildings' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'chat', label: 'Chat', icon: 'message' },
]

export const STARTUPS = [
  { name: 'Acme AI Labs', initials: 'AA', color: '#6366f1', slug: 'acme-ai-labs', role: 'Owner' },
  { name: 'Neon Grid', initials: 'NG', color: '#10b981', slug: 'neon-grid' },
  { name: 'Code Forge', initials: 'CF', color: '#f59e0b', slug: 'code-forge' },
]

export const AGENTS = ['Scout', 'Forge', 'Relay', 'Cipher', 'Beacon']

export const FEED = [
  {
    type: 'file',
    icon: 'plus',
    ...TL,
    agent: 'Scout',
    time: '2 hours ago',
    content: <><span className="font-semibold">Scout</span> Added <span className="font-semibold">competitor_analysis.csv</span></>,
  },
  {
    type: 'task',
    icon: 'clipboard',
    ...TL,
    agent: 'Forge',
    time: '4 hours ago',
    content: <><span className="font-semibold">Forge</span> Completed task <span className="font-semibold">TSK-035</span></>,
    detail: 'Fixed auth token refresh logic — tokens now auto-renew 5 minutes before expiry. Tested across all OAuth providers.',
  },
  {
    type: 'review',
    icon: 'message',
    ...TL,
    agent: 'Cipher',
    time: '5 hours ago',
    content: <><span className="font-semibold">Cipher</span> Requested review on <span className="font-semibold">TSK-038</span></>,
    detail: 'Pull request #127 touches the payment service and needs a security review before merging. 3 files changed, 47 additions.',
    needsReview: true,
    thread: { count: 4, agents: ['Beacon', 'Scout'] },
  },
  {
    type: 'collapse',
    text: 'View 3 more updates from today',
  },
  {
    type: 'comment',
    icon: 'message',
    ...TL,
    agent: 'Beacon',
    time: '1 day ago',
    content: <><span className="font-semibold">Beacon</span> Mentioned you in a comment on <span className="font-semibold">TSK-032</span></>,
    detail: 'Monitoring alerts are now configured for all production endpoints. @team please review the threshold values before the next deploy.',
    mention: true,
    thread: { count: 6, agents: ['Forge', 'Relay'] },
  },
  {
    type: 'objective-complete',
    icon: 'check',
    iconColor: 'text-[#0d2000]',
    iconBg: 'bg-[var(--color-accent)]',
    agent: 'Forge',
    time: '1 day ago',
    content: <><span className="font-semibold">Objective completed</span> — <span className="font-semibold">Set up CI/CD pipeline & deploy staging</span></>,
    detail: 'All 8 tasks finished. Pipeline deploys on merge to main, staging auto-updates from develop. Total time: 3 days 4 hours.',
    objective: { title: 'Set up CI/CD pipeline & deploy staging', tasksCompleted: 8, agents: ['Forge', 'Relay', 'Cipher'], duration: '3d 4h' },
  },
  {
    type: 'assign',
    icon: 'arrow-right',
    ...TL,
    agent: 'Relay',
    time: '2 days ago',
    content: <><span className="font-semibold">Relay</span> was assigned to <span className="font-semibold">Deploy staging environment</span></>,
  },
  {
    type: 'tag',
    icon: 'plus',
    ...TL,
    agent: 'Cipher',
    time: '3 days ago',
    content: <><span className="font-semibold">Cipher</span> Applied <span className="font-semibold">Urgent</span> tag</>,
  },
  {
    type: 'closed',
    icon: 'close',
    ...TL,
    agent: 'Scout',
    time: '4 days ago',
    content: <>Objective closed by <span className="font-semibold">Scout</span></>,
  },
]

export const LIVE_EVENTS = [
  (agent) => ({
    type: 'task', icon: 'clipboard', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Completed task <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
  }),
  (agent) => ({
    type: 'file', icon: 'plus', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Added <span className="font-semibold">{['report.pdf', 'metrics.csv', 'schema.sql', 'config.yaml', 'readme.md'][Math.floor(Math.random() * 5)]}</span></>,
  }),
  (agent) => ({
    type: 'comment', icon: 'message', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Left a comment on <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
    detail: ['Looks good, shipping this.', 'Found an edge case — adding a fix now.', 'Dependencies updated, re-running tests.', 'Blocked by upstream API changes.'][Math.floor(Math.random() * 4)],
  }),
  (agent) => ({
    type: 'review', icon: 'message', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> Requested review on <span className="font-semibold">TSK-{String(Math.floor(Math.random() * 900) + 100)}</span></>,
    detail: ['Changes to the auth flow need a second pair of eyes.', 'New endpoint added — please verify the schema.', 'Refactored the caching layer, need perf review.'][Math.floor(Math.random() * 3)],
    needsReview: true,
  }),
  (agent) => ({
    type: 'assign', icon: 'arrow-right', ...TL, agent,
    content: <><span className="font-semibold">{agent}</span> was assigned to <span className="font-semibold">{['Update search index', 'Fix webhook retry logic', 'Migrate to new CDN', 'Audit rate limits'][Math.floor(Math.random() * 4)]}</span></>,
  }),
]

export const CONFETTI_COLORS = ['#9fe870', '#7ed957', '#b8f089', '#5cb83a', '#c5f5a0', '#6fcf45', '#a3e86e', '#2d5a1a', '#1a3d0f', '#3a7a28', '#244d15', '#1f4210']

export const OBJECTIVE = {
  id: 'OBJ-001',
  title: 'Scrape competitor pricing & generate weekly analysis report',
  description: 'Collect pricing data from top 5 competitors weekly, normalize into a unified schema, generate comparison charts and an executive summary with actionable insights.',
  status: 'in_progress',
  progress: 45,
  completed: 3,
  inProgress: 2,
  review: 2,
  pending: 3,
  total: 10,
  agents: ['Scout', 'Forge'],
}

export const TASKS = [
  {
    id: 'TSK-041', title: 'Scrape pricing data from CompetitorA', status: 'working', agent: 'Scout',
    detail: 'Crawling 47 product pages, extracting price + SKU. 32/47 done so far.',
    description: 'Use headless browser to crawl all product pages on CompetitorA\'s pricing section. Extract product name, SKU, price, currency, and availability. Handle pagination and rate limiting. Output as structured JSON.',
    votes: { up: 2, down: 0 }, comments: 1,
    created: 'Mar 21, 2:58 PM', assigned: 'Mar 21, 3:23 PM', pickedUp: 'Mar 21, 3:24 PM',
    duration: '~45min',
    files: [
      { name: 'competitorA_raw.json', size: '2.4 MB', status: 'in-progress' },
    ],
    updates: [
      { agent: 'Scout', time: '3:45 PM', text: 'Started crawling. Found 47 product pages across 4 categories.' },
      { agent: 'Scout', time: '4:02 PM', text: '32/47 pages scraped. Hit a rate limit on category 3, backing off 30s.' },
    ],
  },
  {
    id: 'TSK-042', title: 'Normalize scraped data into unified schema', status: 'working', agent: 'Forge',
    detail: 'Mapping 6 different price formats into a single CSV schema with currency conversion.',
    description: 'Take raw scraped data from all competitors and normalize into a unified schema: product_name, sku, price_usd, original_currency, availability, last_updated. Handle currency conversion using live rates. Validate data integrity.',
    votes: { up: 3, down: 1 }, comments: 4,
    created: 'Mar 21, 2:58 PM', assigned: 'Mar 21, 3:23 PM', pickedUp: 'Mar 21, 3:25 PM',
    duration: '~30min',
    files: [
      { name: 'unified_schema.csv', size: '1.1 MB', status: 'in-progress' },
      { name: 'currency_rates.json', size: '4 KB', status: 'complete' },
    ],
    updates: [
      { agent: 'Forge', time: '3:30 PM', text: 'Schema defined. Processing CompetitorA data first.' },
      { agent: 'Forge', time: '3:50 PM', text: 'Found 6 different price formats. Building parsers for each.' },
      { agent: 'Forge', time: '4:10 PM', text: 'Currency conversion applied. 3/5 competitors normalized.' },
    ],
  },
  { id: 'TSK-043', title: 'Build comparison dashboard template', status: 'pending', agent: null, description: 'Create an interactive HTML dashboard with charts comparing pricing across all competitors. Include filters by category, date range, and price delta highlights.' },
  { id: 'TSK-044', title: 'Set up weekly cron trigger', status: 'pending', agent: null, description: 'Configure a scheduled job to run the full scraping pipeline every Monday at 6 AM UTC. Include error notifications and retry logic.' },
  { id: 'TSK-045', title: 'Generate sample report for review', status: 'pending', agent: null, description: 'Compile all data into a PDF report with executive summary, charts, and recommendations. Submit for human review before finalizing.' },
  {
    id: 'TSK-035', title: 'Fix auth token refresh logic', status: 'completed', agent: 'Forge', completedAt: '2 hours ago',
    description: 'Tokens were expiring mid-request. Implemented auto-renewal 5 minutes before expiry with retry on 401.',
    duration: '25min',
    files: [
      { name: 'auth_refresh.patch', size: '3.2 KB', status: 'complete' },
      { name: 'test_results.log', size: '12 KB', status: 'complete' },
    ],
    updates: [
      { agent: 'Forge', time: '1:30 PM', text: 'Identified the race condition in token refresh. Implementing mutex.' },
      { agent: 'Forge', time: '1:55 PM', text: 'Fixed and tested across all OAuth providers. All green.' },
    ],
  },
  {
    id: 'TSK-032', title: 'Configure monitoring alerts', status: 'completed', agent: 'Beacon', completedAt: '1 day ago',
    description: 'Set up Datadog monitors for all production API endpoints. Alert on p99 latency > 500ms and error rate > 1%.',
    duration: '40min',
    files: [
      { name: 'monitors_config.yaml', size: '8 KB', status: 'complete' },
    ],
    updates: [
      { agent: 'Beacon', time: 'Yesterday 2:00 PM', text: 'Monitors configured for 12 endpoints. Testing alert routing.' },
      { agent: 'Beacon', time: 'Yesterday 2:40 PM', text: 'All monitors verified. Slack channel receiving alerts correctly.' },
    ],
  },
]

export const LOADING_STEPS = [
  'Reading objective...',
  'Breaking down tasks...',
  'Assigning agents...',
  'Getting ready to start...',
]
