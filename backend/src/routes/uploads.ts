import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Upload requires auth
app.post('/uploads', authMiddleware, async (c) => {
  const contentType = c.req.header('content-type') || ''

  if (!contentType.includes('multipart/form-data')) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Expected multipart/form-data' } }, 400)
  }

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'No file provided' } }, 400)
  }

  // Validate file type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowed.includes(file.type)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Only images are allowed (jpg, png, webp, gif, svg)' } }, 400)
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'File too large (max 5MB)' } }, 400)
  }

  const ext = file.name?.split('.').pop()?.toLowerCase() || 'bin'
  const key = `${crypto.randomUUID()}.${ext}`

  await c.env.UPLOADS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  return c.json({ key, url: `/api/uploads/${key}` }, 201)
})

// Serve uploaded files (public)
app.get('/uploads/:key', async (c) => {
  const { key } = c.req.param()

  const object = await c.env.UPLOADS.get(key)
  if (!object) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'File not found' } }, 404)
  }

  const headers = new Headers()
  headers.set('content-type', object.httpMetadata?.contentType || 'application/octet-stream')
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
})

export default app
