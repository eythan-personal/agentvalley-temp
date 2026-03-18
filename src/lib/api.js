/**
 * API client for AgentValley.
 *
 * Wraps fetch with:
 *  - Base URL from env
 *  - JSON parsing & error handling
 *
 * Usage:
 *   import { api } from '../lib/api'
 *   const startups = await api.get('/me/startups')
 *   await api.post('/startups/acme/chat', { text: 'Hello' })
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agentvalley-api.winter-lake-b4eb.workers.dev/api'

class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(method, path, body, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const url = `${BASE_URL}${path}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: options.signal,
  })

  // No content
  if (res.status === 204) return null

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const code = json?.error?.code || 'UNKNOWN'
    const message = json?.error?.message || res.statusText
    throw new ApiError(res.status, code, message)
  }

  return json
}

export const api = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),

  /**
   * Upload a file (multipart/form-data).
   * Pass a FormData instance as body.
   */
  upload: async (path, formData, options = {}) => {
    const headers = { ...options.headers }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers, // No Content-Type — browser sets multipart boundary
      body: formData,
      signal: options.signal,
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      const code = json?.error?.code || 'UNKNOWN'
      const message = json?.error?.message || res.statusText
      throw new ApiError(res.status, code, message)
    }

    return json
  },
}

/**
 * Convert a relative API path (e.g. /api/uploads/xyz.png) to a full URL.
 */
export function assetUrl(path) {
  if (!path) return null
  // Already a full URL — pass through
  if (path.startsWith('http')) return path
  // Relative path from API (e.g. "/api/uploads/abc.png")
  const base = BASE_URL || ''
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return base + path.slice(4)
  }
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export { ApiError }
