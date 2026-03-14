import { useState, useEffect, useMemo } from 'react'
import { getStartupData, myStartups } from '../data/dashboard'

/**
 * Hook to fetch all dashboard data for a startup by slug.
 *
 * Returns { data, loading, error, startup } where:
 *   - data: { objectives, tasks, taskComments, feedItems, agents, chatMessages, myRoles, tokenData, outputFolders, outputFiles }
 *   - startup: the startup metadata from the myStartups list
 *   - loading: boolean (always false for mock data, will be true during real API calls)
 *   - error: null | Error
 *
 * MIGRATION NOTE: To swap to a real backend, replace the getStartupData() call
 * inside useEffect with a fetch/query (e.g. supabase, prisma, REST, GraphQL).
 * The hook signature and return shape stay the same — all consumers are decoupled.
 */
export function useStartupData(slug) {
  const [data, setData] = useState(() => getStartupData(slug))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Resolve startup metadata from the list (for nav switcher, header, etc.)
  const startup = useMemo(
    () => myStartups.find(s => s.slug === slug) || {
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

  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      // ── SWAP POINT ──
      // Replace this synchronous call with an async fetch when connecting to a real DB.
      // e.g.:
      //   const res = await fetch(`/api/startups/${slug}`)
      //   const json = await res.json()
      //   setData(json)
      const result = getStartupData(slug)
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  return { data, loading, error, startup }
}

/**
 * Hook to fetch only token data for a startup.
 * Used by TokenPage which only needs the token slice.
 */
export function useTokenData(slug) {
  const { data, loading, error, startup } = useStartupData(slug)

  return {
    tokenData: data?.tokenData ?? null,
    startup,
    loading,
    error,
  }
}
