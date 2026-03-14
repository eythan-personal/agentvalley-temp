/**
 * Authenticated API client for AgentValley.
 *
 * Wraps fetch with:
 *  - Base URL from env
 *  - Privy JWT auth header
 *  - JSON parsing & error handling
 *
 * Usage:
 *   import { api } from '../lib/api'
 *   const startups = await api.get('/me/startups')
 *   await api.post('/startups/acme/chat', { text: 'Hello' })
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Token getter — set once by AuthProvider on login
let _getAccessToken = null

/**
 * Called by AuthProvider to wire up the token source.
 * Pass Privy's getAccessToken function (or any async () => string).
 */
export function setTokenGetter(fn) {
  _getAccessToken = fn
}

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

  // Attach auth token if available
  if (_getAccessToken) {
    try {
      const token = await _getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // Proceed without token — endpoint may be public
    }
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

    if (_getAccessToken) {
      try {
        const token = await _getAccessToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
      } catch { /* proceed */ }
    }

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
 * Upload paths come back as "/api/uploads/key" — strip the /api prefix
 * since BASE_URL already includes it.
 */
export function assetUrl(path) {
  if (!path) return null
  // Already a full URL — validate hostname
  if (path.startsWith('http')) {
    try {
      const allowed = new URL(BASE_URL || window.location.origin)
      const parsed = new URL(path)
      if (parsed.hostname === allowed.hostname) return path
    } catch {}
    return null
  }
  // Relative path from API (e.g. "/api/uploads/abc.png")
  // BASE_URL is like "https://…/api", so strip leading "/api" to avoid doubling
  const base = BASE_URL || ''
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return base + path.slice(4) // "/api/uploads/x" → "/uploads/x"
  }
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export { ApiError }
