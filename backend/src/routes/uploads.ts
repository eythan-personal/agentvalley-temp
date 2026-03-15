import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// TODO: Re-enable auth when Privy is reimplemented
app.post('/uploads', async (c) => {
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

  // Validate magic bytes
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer.slice(0, 12))
  const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
  const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46
  const isWEBP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  const isSVG = file.type === 'image/svg+xml' // SVG doesn't have magic bytes, rely on Content-Type + extension

  if (!isJPEG && !isPNG && !isGIF && !isWEBP && !isSVG) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'File content does not match a supported image format' } }, 400)
  }

  // Sanitize file extension
  const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const rawExt = file.name?.split('.').pop()?.toLowerCase() || 'bin'
  const ext = allowedExts.includes(rawExt) ? rawExt : 'bin'
  if (ext === 'bin') {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Unsupported file extension' } }, 400)
  }

  const userId = c.get('userId')
  const key = `${crypto.randomUUID()}.${ext}`

  await c.env.UPLOADS.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  })

  console.log(JSON.stringify({ event: 'file.uploaded', userId, key, size: file.size, type: file.type, ts: Date.now() }))

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
