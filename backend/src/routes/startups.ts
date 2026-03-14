import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import {
  startups, startupMembers, tokens, objectives, tasks, agents,
  taskComments, feedItems, chatMessages, roles, outputFolders, outputFiles,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// All routes require auth
app.use('/*', authMiddleware)

// ── GET /api/me/startups ──
// Returns startups the authenticated user owns or belongs to
app.get('/me/startups', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const memberships = await db
    .select({
      id: startups.id,
      slug: startups.slug,
      name: startups.name,
      initials: startups.initials,
      color: startups.color,
      status: startups.status,
      createdAt: startups.createdAt,
    })
    .from(startupMembers)
    .innerJoin(startups, eq(startupMembers.startupId, startups.id))
    .where(eq(startupMembers.userId, userId))

  // Enrich with agent count and token symbol
  const result = await Promise.all(
    memberships.map(async (s) => {
      const [agentCount] = await db
        .select({ count: agents.id })
        .from(agents)
        .where(eq(agents.startupId, s.id))

      const [token] = await db
        .select({ symbol: tokens.symbol })
        .from(tokens)
        .where(eq(tokens.startupId, s.id))
        .limit(1)

      return {
        slug: s.slug,
        name: s.name,
        initials: s.initials,
        color: s.color,
        token: token ? `$${token.symbol}` : '',
        status: s.status,
        agents: agentCount ? 1 : 0, // count workaround for D1
        revenue: '$0', // TODO: compute from real data
        founded: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      }
    })
  )

  return c.json(result)
})

// ── POST /api/startups ──
// Create a new startup
app.post('/startups', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const body = await c.req.json()

  const { name, description, category, color, website, visibility, token: tokenConfig } = body

  if (!name?.trim() || !description?.trim() || !category) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Name, description, and category are required' } }, 400)
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const initials = name.trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: startups.id })
    .from(startups)
    .where(eq(startups.slug, slug))
    .limit(1)

  if (existing) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'A startup with this name already exists' } }, 400)
  }

  const startupId = crypto.randomUUID()
  const memberId = crypto.randomUUID()

  await db.insert(startups).values({
    id: startupId,
    slug,
    name: name.trim(),
    description: description.trim(),
    initials,
    color: color || '#9fe870',
    category,
    website: website || null,
    visibility: visibility || 'public',
    ownerId: userId,
  })

  // Add creator as owner member
  await db.insert(startupMembers).values({
    id: memberId,
    startupId,
    userId,
    role: 'owner',
  })

  // Create token if requested
  if (tokenConfig?.name) {
    await db.insert(tokens).values({
      id: crypto.randomUUID(),
      startupId,
      symbol: tokenConfig.name.toUpperCase(),
      vesting: tokenConfig.vesting || '',
    })
  }

  return c.json({ slug, name: name.trim(), id: startupId }, 201)
})

// ── GET /api/startups/:slug/dashboard ──
// Returns all dashboard data for a startup
app.get('/startups/:slug/dashboard', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const { slug } = c.req.param()

  // Find startup
  const [startup] = await db
    .select()
    .from(startups)
    .where(eq(startups.slug, slug))
    .limit(1)

  if (!startup) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Startup not found' } }, 404)
  }

  // Verify membership
  const [membership] = await db
    .select()
    .from(startupMembers)
    .where(
      and(
        eq(startupMembers.startupId, startup.id),
        eq(startupMembers.userId, userId)
      )
    )
    .limit(1)

  if (!membership) {
    return c.json({ error: { code: 'FORBIDDEN', message: 'Not a member of this startup' } }, 403)
  }

  // Fetch all dashboard data in parallel
  const [
    objectivesData,
    tasksData,
    agentsData,
    feedData,
    chatData,
    rolesData,
    tokenData,
    foldersData,
    filesData,
  ] = await Promise.all([
    db.select().from(objectives).where(eq(objectives.startupId, startup.id)),
    db.select().from(tasks).where(eq(tasks.startupId, startup.id)),
    db.select().from(agents).where(eq(agents.startupId, startup.id)),
    db.select().from(feedItems).where(eq(feedItems.startupId, startup.id)),
    db.select().from(chatMessages).where(eq(chatMessages.startupId, startup.id)),
    db.select().from(roles).where(eq(roles.startupId, startup.id)),
    db.select().from(tokens).where(eq(tokens.startupId, startup.id)).limit(1),
    db.select().from(outputFolders).where(eq(outputFolders.startupId, startup.id)),
    db.select().from(outputFiles).where(eq(outputFiles.startupId, startup.id)),
  ])

  // Fetch comments for all tasks
  const taskIds = tasksData.map((t) => t.id)
  const allComments = taskIds.length > 0
    ? await db.select().from(taskComments).where(
        // D1 doesn't support IN with arrays well, fetch all and filter
        eq(taskComments.taskId, taskIds[0]) // will be improved below
      )
    : []

  // Build task comments map — fetch all comments for this startup's tasks
  const commentsMap: Record<string, any[]> = {}
  if (taskIds.length > 0) {
    // Fetch comments for each task (D1-friendly approach)
    for (const taskId of taskIds) {
      const comments = await db
        .select()
        .from(taskComments)
        .where(eq(taskComments.taskId, taskId))

      if (comments.length > 0) {
        commentsMap[taskId] = comments.map((c) => ({
          id: c.id,
          author: c.authorName,
          time: c.createdAt,
          text: c.text,
        }))
      }
    }
  }

  // Format agents for tasks
  const agentMap = new Map(agentsData.map((a) => [a.id, a]))

  // Format response to match frontend expectations
  const response = {
    objectives: objectivesData.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      status: o.status,
      progress: o.progress,
      tasksTotal: o.tasksTotal,
      tasksComplete: o.tasksComplete,
      startDate: o.startDate,
      estCompletion: o.estCompletion,
    })),

    tasks: tasksData.map((t) => {
      const agent = t.agentId ? agentMap.get(t.agentId) : null
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        objective: objectivesData.find((o) => o.id === t.objectiveId)?.title || '',
        status: t.status,
        agent: agent ? { name: agent.name, avatar: agent.avatarUrl } : null,
        dependencies: JSON.parse(t.dependencies),
        created: t.createdAt,
        duration: t.duration,
        files: JSON.parse(t.files),
        likes: t.likes,
        dislikes: t.dislikes,
        comments: t.comments,
        shares: t.shares,
      }
    }),

    taskComments: commentsMap,

    feedItems: feedData.map((f) => {
      const agent = f.agentId ? agentMap.get(f.agentId) : null
      return {
        id: f.id,
        agent: agent ? { name: agent.name, avatar: agent.avatarUrl, role: agent.role } : null,
        type: f.type,
        action: f.action,
        task: f.taskTitle,
        time: f.createdAt,
        preview: JSON.parse(f.preview),
        reactions: JSON.parse(f.reactions),
      }
    }),

    agents: agentsData.map((a) => ({
      name: a.name,
      avatar: a.avatarUrl,
      role: a.role,
      status: a.status,
      workingOn: a.workingOn,
    })),

    chatMessages: chatData.map((m) => ({
      id: m.id,
      from: m.fromType === 'user' ? 'you' : m.fromName,
      avatar: null,
      text: m.text,
      time: m.createdAt,
    })),

    myRoles: rolesData.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      tools: JSON.parse(r.tools),
      reward: r.reward,
      vesting: r.vesting,
      status: r.status,
      applicants: r.applicants,
      posted: r.createdAt,
      urgency: r.urgency,
    })),

    tokenData: tokenData[0] ? {
      symbol: `$${tokenData[0].symbol}`,
      price: tokenData[0].price,
      change24h: tokenData[0].change24h,
      changePositive: tokenData[0].changePositive,
      volume: tokenData[0].volume,
      mcap: tokenData[0].mcap,
      holders: tokenData[0].holders,
      liquidity: tokenData[0].liquidity,
      supply: tokenData[0].supply,
      circulatingSupply: tokenData[0].circulatingSupply,
      ath: tokenData[0].ath,
      athDate: tokenData[0].athDate,
      atl: tokenData[0].atl,
      atlDate: tokenData[0].atlDate,
      sparkline: [],
      priceHistory7d: [],
      topHolders: [],
    } : null,

    outputFolders: foldersData.map((f) => {
      const agent = f.agentId ? agentMap.get(f.agentId) : null
      return {
        name: f.name,
        type: 'folder',
        description: f.description,
        agent: agent ? { name: agent.name, avatar: agent.avatarUrl } : null,
        date: f.createdAt,
        items: f.items,
      }
    }),

    outputFiles: filesData.map((f) => {
      const agent = f.agentId ? agentMap.get(f.agentId) : null
      return {
        name: f.name,
        type: f.type,
        folder: foldersData.find((fo) => fo.id === f.folderId)?.name || '',
        status: f.status,
        agent: agent ? { name: agent.name, avatar: agent.avatarUrl } : null,
        date: f.createdAt,
        size: f.size,
      }
    }),
  }

  return c.json(response)
})

export default app
