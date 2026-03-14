import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ── Users ──
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  walletAddress: text('wallet_address').notNull().unique(),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Startups ──
export const startups = sqliteTable('startups', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  initials: text('initials').notNull().default(''),
  color: text('color').notNull().default('#9fe870'),
  category: text('category').notNull().default('Other'),
  website: text('website'),
  visibility: text('visibility').notNull().default('public'), // public | private
  status: text('status').notNull().default('Incubating'), // Incubating | Graduated
  avatarUrl: text('avatar_url'),
  bannerUrl: text('banner_url'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Startup members (who can access the dashboard) ──
export const startupMembers = sqliteTable('startup_members', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('owner'), // owner | member
  joinedAt: text('joined_at').notNull().default('(datetime())'),
})

// ── Token config (one per startup, optional) ──
export const tokens = sqliteTable('tokens', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id).unique(),
  symbol: text('symbol').notNull(),
  iconUrl: text('icon_url'),
  vesting: text('vesting').notNull().default(''),
  price: real('price').notNull().default(0),
  change24h: text('change_24h').notNull().default('+0%'),
  changePositive: integer('change_positive', { mode: 'boolean' }).notNull().default(true),
  volume: text('volume').notNull().default('$0'),
  mcap: text('mcap').notNull().default('$0'),
  holders: text('holders').notNull().default('0'),
  liquidity: text('liquidity').notNull().default('$0'),
  supply: text('supply').notNull().default('0'),
  circulatingSupply: text('circulating_supply').notNull().default('0'),
  ath: real('ath').notNull().default(0),
  athDate: text('ath_date'),
  atl: real('atl').notNull().default(0),
  atlDate: text('atl_date'),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Objectives ──
export const objectives = sqliteTable('objectives', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('queued'), // in-progress | queued | completed
  progress: integer('progress').notNull().default(0),
  tasksTotal: integer('tasks_total').notNull().default(0),
  tasksComplete: integer('tasks_complete').notNull().default(0),
  startDate: text('start_date'),
  estCompletion: text('est_completion'),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Agents ──
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default(''),
  status: text('status').notNull().default('idle'), // working | idle
  workingOn: text('working_on'),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Tasks ──
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  objectiveId: text('objective_id').references(() => objectives.id),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('Pending'), // Completed | Assigned | Pending
  agentId: text('agent_id').references(() => agents.id),
  dependencies: text('dependencies').notNull().default('[]'), // JSON array of task IDs
  duration: text('duration'),
  files: text('files').notNull().default('[]'), // JSON array of { name, size }
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Task comments ──
export const taskComments = sqliteTable('task_comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  authorType: text('author_type').notNull().default('user'), // user | agent
  authorId: text('author_id').notNull(), // user.id or agent.id
  authorName: text('author_name').notNull(),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Feed items ──
export const feedItems = sqliteTable('feed_items', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  agentId: text('agent_id').references(() => agents.id),
  type: text('type').notNull().default('content'), // design | content | code
  action: text('action').notNull().default(''),
  taskTitle: text('task_title'),
  preview: text('preview').notNull().default('{}'), // JSON: { kind, title, body, images?, language? }
  reactions: text('reactions').notNull().default('{}'), // JSON: { fire: 3, rocket: 1 }
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Chat messages ──
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  fromType: text('from_type').notNull().default('user'), // user | agent
  fromId: text('from_id').notNull(),
  fromName: text('from_name').notNull(),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Roles (open positions) ──
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  tools: text('tools').notNull().default('[]'), // JSON array of strings
  reward: text('reward').notNull().default(''),
  vesting: text('vesting').notNull().default(''),
  status: text('status').notNull().default('Open'),
  applicants: integer('applicants').notNull().default(0),
  urgency: text('urgency').notNull().default('Normal'),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Output folders ──
export const outputFolders = sqliteTable('output_folders', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  agentId: text('agent_id').references(() => agents.id),
  items: integer('items').notNull().default(0),
  createdAt: text('created_at').notNull().default('(datetime())'),
})

// ── Output files ──
export const outputFiles = sqliteTable('output_files', {
  id: text('id').primaryKey(),
  startupId: text('startup_id').notNull().references(() => startups.id),
  folderId: text('folder_id').references(() => outputFolders.id),
  name: text('name').notNull(),
  type: text('type').notNull().default('code'), // code | article | design
  status: text('status').notNull().default('In Review'),
  agentId: text('agent_id').references(() => agents.id),
  size: text('size').notNull().default('0 KB'),
  createdAt: text('created_at').notNull().default('(datetime())'),
})
