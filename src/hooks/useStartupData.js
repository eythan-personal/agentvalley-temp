import { useState, useEffect, useMemo, useCallback } from 'react'
import { getStartupData, myStartups as mockStartups } from '../data/dashboard'
import { api } from '../lib/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL

/**
 * Hook to fetch the user's startups list.
 * Uses real API when VITE_API_BASE_URL is set, otherwise falls back to mock data.
 */
export function useMyStartups() {
  const [startups, setStartups] = useState(API_BASE ? [] : mockStartups)
  const [loading, setLoading] = useState(!!API_BASE)
  const [error, setError] = useState(null)

  const fetchStartups = useCallback(async () => {
    if (!API_BASE) {
      setStartups(mockStartups)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await api.get('/me/startups')
      setStartups(result)
    } catch (err) {
      setError(err)
      // Fall back to mock data on error
      setStartups(mockStartups)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStartups()
  }, [fetchStartups])

  return { startups, loading, error, refetch: fetchStartups }
}

/**
 * Hook to fetch all dashboard data for a startup by slug.
 * Uses real API when VITE_API_BASE_URL is set, otherwise falls back to mock data.
 */
export function useStartupData(slug) {
  const [data, setData] = useState(() => API_BASE ? null : getStartupData(slug))
  const [loading, setLoading] = useState(!!API_BASE)
  const [error, setError] = useState(null)

  // Resolve startup metadata (for nav switcher, header, etc.)
  const startup = useMemo(
    () => mockStartups.find(s => s.slug === slug) || {
      slug: slug || '',
      name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'New Startup',
      initials: slug ? slug.slice(0, 2).toUpperCase() : 'NS',
      color: '#9fe870',
      token: '',
      status: 'Incubating',
      agents: 0,
      founded: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    },
    [slug],
  )

  const fetchData = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)

    try {
      if (API_BASE) {
        const result = await api.get(`/startups/${slug}/dashboard`)
        setData(result)
      } else {
        const result = getStartupData(slug)
        setData(result)
      }
    } catch (err) {
      setError(err)
      // Fall back to mock data on API error
      if (API_BASE) {
        const fallback = getStartupData(slug)
        if (fallback) setData(fallback)
      }
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, startup, refetch: fetchData }
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
