import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './useAuth'
import { isMockEnabled, generateMockDashboard, generateMockStartup } from '../data/mockDashboard'

/**
 * Hook to fetch the user's startups list from the API.
 */
export function useMyStartups() {
  const { ready, authenticated } = useAuth()
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  const fetchStartups = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isMockEnabled()) {
      if (mountedRef.current) {
        setStartups([
          generateMockStartup('acme-ai-labs'),
          generateMockStartup('neon-grid'),
          generateMockStartup('code-forge'),
        ])
        setLoading(false)
      }
      return
    }

    try {
      const result = await api.get('/me/startups')
      if (mountedRef.current) setStartups(result)
    } catch (err) {
      if (mountedRef.current) { setError(err); setStartups([]) }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isMockEnabled()) { fetchStartups(); return }
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
 * Uses AbortController to cancel in-flight requests on slug change or unmount.
 */
export function useStartupData(slug) {
  const { ready, authenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startup, setStartup] = useState(null)
  const abortRef = useRef(null)

  const fetchData = useCallback(async (signal) => {
    if (!slug) return
    setLoading(true)
    setError(null)

    if (isMockEnabled()) {
      if (!signal?.aborted) {
        setData(generateMockDashboard(slug))
        setLoading(false)
      }
      return
    }

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
    if (isMockEnabled()) {
      if (!signal?.aborted) setStartup(generateMockStartup(slug))
      return
    }

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
    // Cancel any in-flight request from previous slug
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (isMockEnabled()) {
      fetchData(controller.signal)
      fetchStartupMeta(controller.signal)
      return () => controller.abort()
    }

    if (!ready || !authenticated) return () => controller.abort()

    fetchData(controller.signal)
    fetchStartupMeta(controller.signal)

    return () => controller.abort()
  }, [ready, authenticated, fetchData, fetchStartupMeta])

  const refetch = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchData(controller.signal)
  }, [fetchData])

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
