import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import {
  startups, startupMembers, tokens, objectives, tasks, agents,
  taskComments, feedItems, chatMessages, roles, outputFolders, outputFiles,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { Env, Variables } from '../types'

function safeJsonParse(str: string, fallback: any = []) {
  try { return JSON.parse(str) } catch { return fallback }
}

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
      description: startups.description,
      initials: startups.initials,
      color: startups.color,
      category: startups.category,
      website: startups.website,
      visibility: startups.visibility,
      status: startups.status,
      avatarUrl: startups.avatarUrl,
      bannerUrl: startups.bannerUrl,
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
        description: s.description,
        initials: s.initials,
        color: s.color,
        category: s.category,
        website: s.website,
        visibility: s.visibility,
        avatarUrl: s.avatarUrl,
        bannerUrl: s.bannerUrl,
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

  const { name, description, category, color, website, visibility, token: tokenConfig, avatarUrl, bannerUrl } = body

  if (!name?.trim() || !description?.trim() || !category) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Name, description, and category are required' } }, 400)
  }

  // Validate website URL
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Website must be an HTTP or HTTPS URL' } }, 400)
      }
    } catch {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid website URL' } }, 400)
    }
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

  try {
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
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
      ownerId: userId,
    })
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'A startup with this name already exists' } }, 400)
    }
    throw err
  }

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
      iconUrl: tokenConfig.iconUrl || null,
      vesting: tokenConfig.vesting || '',
    })
  }

  console.log(JSON.stringify({ event: 'startup.created', userId, startupId, slug, ts: Date.now() }))

  return c.json({ slug, name: name.trim(), id: startupId }, 201)
})

// ── PATCH /api/startups/:slug ──
// Update startup fields
app.patch('/startups/:slug', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const { slug } = c.req.param()
  const body = await c.req.json()

  const [startup] = await db.select().from(startups).where(eq(startups.slug, slug)).limit(1)
  if (!startup) return c.json({ error: { code: 'NOT_FOUND', message: 'Startup not found' } }, 404)
  if (startup.ownerId !== userId) return c.json({ error: { code: 'FORBIDDEN', message: 'Only the owner can edit' } }, 403)

  // Validate website URL
  if (body.website) {
    const website = body.website
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Website must be an HTTP or HTTPS URL' } }, 400)
      }
    } catch {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid website URL' } }, 400)
    }
  }

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description.trim()
  if (body.website !== undefined) updates.website = body.website?.trim() || null
  if (body.color !== undefined) updates.color = body.color
  if (body.category !== undefined) updates.category = body.category
  if (body.visibility !== undefined) updates.visibility = body.visibility
  if (body.status !== undefined) updates.status = body.status
  if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl
  if (body.bannerUrl !== undefined) updates.bannerUrl = body.bannerUrl

  if (body.name) {
    updates.initials = body.name.trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (Object.keys(updates).length > 0) {
    await db.update(startups).set(updates).where(eq(startups.id, startup.id))
    console.log(JSON.stringify({ event: 'startup.updated', userId, startupId: startup.id, fields: Object.keys(updates), ts: Date.now() }))
  }

  return c.json({ ok: true })
})

// ── DELETE /api/startups/:slug ──
// Delete startup and all related data
app.delete('/startups/:slug', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const { slug } = c.req.param()

  const [startup] = await db.select().from(startups).where(eq(startups.slug, slug)).limit(1)
  if (!startup) return c.json({ error: { code: 'NOT_FOUND', message: 'Startup not found' } }, 404)
  if (startup.ownerId !== userId) return c.json({ error: { code: 'FORBIDDEN', message: 'Only the owner can delete' } }, 403)

  // Delete in dependency order
  const sid = startup.id
  await db.delete(chatMessages).where(eq(chatMessages.startupId, sid))
  await db.delete(feedItems).where(eq(feedItems.startupId, sid))

  const taskIds = (await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.startupId, sid))).map(t => t.id)
  for (const tid of taskIds) {
    await db.delete(taskComments).where(eq(taskComments.taskId, tid))
  }
  await db.delete(tasks).where(eq(tasks.startupId, sid))
  await db.delete(objectives).where(eq(objectives.startupId, sid))
  await db.delete(agents).where(eq(agents.startupId, sid))
  await db.delete(roles).where(eq(roles.startupId, sid))
  await db.delete(outputFiles).where(eq(outputFiles.startupId, sid))
  await db.delete(outputFolders).where(eq(outputFolders.startupId, sid))
  await db.delete(tokens).where(eq(tokens.startupId, sid))
  await db.delete(startupMembers).where(eq(startupMembers.startupId, sid))
  await db.delete(startups).where(eq(startups.id, sid))

  console.log(JSON.stringify({ event: 'startup.deleted', userId, startupId: sid, slug, ts: Date.now() }))

  return c.json({ ok: true })
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
    db.select().from(tasks).where(eq(tasks.startupId, startup.id)).limit(200),
    db.select().from(agents).where(eq(agents.startupId, startup.id)),
    db.select().from(feedItems).where(eq(feedItems.startupId, startup.id)).limit(50),
    db.select().from(chatMessages).where(eq(chatMessages.startupId, startup.id)).limit(100),
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
        .limit(50)

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

  // Generate deterministic but unpredictable API key
  const encoder = new TextEncoder()
  const keyData = await crypto.subtle.importKey('raw', encoder.encode(c.env.PRIVY_APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', keyData, encoder.encode(startup.id))
  const apiKey = 'ak_live_' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)

  // Format response to match frontend expectations
  const response = {
    apiKey,
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
        dependencies: safeJsonParse(t.dependencies),
        created: t.createdAt,
        duration: t.duration,
        files: safeJsonParse(t.files),
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
        preview: safeJsonParse(f.preview, {}),
        reactions: safeJsonParse(f.reactions),
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
      tools: safeJsonParse(r.tools),
      reward: r.reward,
      vesting: r.vesting,
      status: r.status,
      applicants: r.applicants,
      posted: r.createdAt,
      urgency: r.urgency,
    })),

    tokenData: tokenData[0] ? {
      symbol: `$${tokenData[0].symbol}`,
      iconUrl: tokenData[0].iconUrl,
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
