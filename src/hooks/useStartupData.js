import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './useAuth'

/**
 * Hook to fetch the user's startups list from the API.
 * Waits for auth to be ready and authenticated before fetching.
 */
export function useMyStartups() {
  const { ready, authenticated } = useAuth()
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStartups = useCallback(async () => {
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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startup, setStartup] = useState(null)

  const fetchData = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)

    try {
      const result = await api.get(`/startups/${slug}/dashboard`)
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  // Fetch startup metadata from the user's startups list
  const fetchStartupMeta = useCallback(async () => {
    try {
      const list = await api.get('/me/startups')
      const match = list.find(s => s.slug === slug)
      if (match) {
        setStartup(match)
      } else {
        // Fallback: derive from slug
        setStartup({
          slug: slug || '',
          name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'New Startup',
          initials: slug ? slug.slice(0, 2).toUpperCase() : 'NS',
          color: '#9fe870',
          token: '',
          status: 'Incubating',
          agents: 0,
          founded: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        })
      }
    } catch {
      setStartup({
        slug: slug || '',
        name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'New Startup',
        initials: slug ? slug.slice(0, 2).toUpperCase() : 'NS',
        color: '#9fe870',
        token: '',
        status: 'Incubating',
        agents: 0,
        founded: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      })
    }
  }, [slug])

  useEffect(() => {
    if (!ready || !authenticated) return
    fetchData()
    fetchStartupMeta()
  }, [ready, authenticated, fetchData, fetchStartupMeta])

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
