import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import startupRoutes from './routes/startups'
import uploadRoutes from './routes/uploads'
import type { Env, Variables } from './types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// ── Security Headers ──
app.use('/*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

// ── CORS ──
app.use('/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: [c.env.FRONTEND_URL, 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// ── Rate Limiting ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

app.use('/api/*', async (c, next) => {
  if (c.req.method === 'GET') return next()
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const key = `${ip}:${c.req.path}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 30) {
      return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, 429)
    }
    entry.count++
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 })
  }
  // Cleanup old entries periodically
  if (rateLimitMap.size > 10_000) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k)
    }
  }
  return next()
})

// ── Inject DB into context ──
app.use('/*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema })
  c.set('db', db)
  await next()
})

// ── Health check ──
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ──
// Startup routes handle: /api/me/startups, /api/startups, /api/startups/:slug/dashboard
app.route('/api', startupRoutes)
app.route('/api', uploadRoutes)

// ── 404 fallback ──
app.notFound((c) => {
  return c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
})

// ── Global error handler ──
app.onError((err, c) => {
  console.error('[API Error]', err.message, err.stack)
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, 500)
})

export default app
