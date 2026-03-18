import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './useAuth'
import { isMockEnabled, generateMockDashboard, generateMockStartup } from '../data/mockDashboard'

const MOCK = isMockEnabled()

/**
 * Hook to fetch the user's startups list from the API.
 */
export function useMyStartups() {
  const { ready, authenticated } = useAuth()

  // When mock is on, initialize with data immediately — no loading state
  const [startups, setStartups] = useState(() =>
    MOCK ? [generateMockStartup('acme-ai-labs'), generateMockStartup('neon-grid'), generateMockStartup('code-forge')] : []
  )
  const [loading, setLoading] = useState(!MOCK)
  const [error, setError] = useState(null)

  const fetchStartups = useCallback(async () => {
    if (MOCK) return // already initialized
    setLoading(true)
    setError(null)
    try {
      const result = await api.get('/me/startups')
      setStartups(result)
    } catch (err) {
      setError(err)
      setStartups([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (MOCK) return
    if (!ready) return
    if (!authenticated) {
      setStartups([])
      setLoading(false)
      return
    }
    fetchStartups()
  }, [ready, authenticated, fetchStartups])

  return { startups, loading, error, refetch: fetchStartups }
}

/**
 * Hook to fetch all dashboard data for a startup by slug.
 */
export function useStartupData(slug) {
  const { ready, authenticated } = useAuth()

  // When mock is on, initialize with data immediately
  const [data, setData] = useState(() => MOCK && slug ? generateMockDashboard(slug) : null)
  const [startup, setStartup] = useState(() => MOCK && slug ? generateMockStartup(slug) : null)
  const [loading, setLoading] = useState(!MOCK)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const prevSlugRef = useRef(slug)

  // For mock mode: update data synchronously when slug changes
  useEffect(() => {
    if (!MOCK) return
    if (prevSlugRef.current !== slug && slug) {
      prevSlugRef.current = slug
      setData(generateMockDashboard(slug))
      setStartup(generateMockStartup(slug))
    }
  }, [slug])

  // For API mode: fetch data
  const fetchData = useCallback(async (signal) => {
    if (!slug || MOCK) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.get(`/startups/${slug}/dashboard`, { signal })
      if (!signal?.aborted) setData(result)
    } catch (err) {
      if (!signal?.aborted) setError(err)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [slug])

  const fetchStartupMeta = useCallback(async (signal) => {
    if (MOCK) return

    const fallback = {
      slug: slug || '',
      name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'New Startup',
      initials: slug ? slug.slice(0, 2).toUpperCase() : 'NS',
      color: '#9fe870',
      token: '',
      status: 'Incubating',
      agents: 0,
      founded: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }

    try {
      const list = await api.get('/me/startups', { signal })
      if (signal?.aborted) return
      const match = list.find(s => s.slug === slug)
      setStartup(match || fallback)
    } catch {
      if (!signal?.aborted) setStartup(fallback)
    }
  }, [slug])

  useEffect(() => {
    if (MOCK) return

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (!ready || !authenticated) return () => controller.abort()

    fetchData(controller.signal)
    fetchStartupMeta(controller.signal)

    return () => controller.abort()
  }, [ready, authenticated, fetchData, fetchStartupMeta])

  const refetch = useCallback(() => {
    if (MOCK) {
      if (slug) {
        setData(generateMockDashboard(slug))
        setStartup(generateMockStartup(slug))
      }
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchData(controller.signal)
  }, [slug, fetchData])

  return { data, loading, error, startup, refetch }
}

/**
 * Hook to fetch only token data for a startup.
 */
export function useTokenData(slug) {
  const { data, loading, error, startup, refetch } = useStartupData(slug)

  return {
    tokenData: data?.tokenData ?? null,
    startup,
    loading,
    error,
    refetch,
  }
}
