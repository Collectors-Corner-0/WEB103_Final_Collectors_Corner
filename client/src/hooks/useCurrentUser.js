import { useEffect, useState } from 'react'

function useCurrentUser(authUrl) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function run() {
      try {
        const res = await fetch(`${authUrl}/login/success`, { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) setUser(null)
          return
        }
        const body = await res.json()
        if (!cancelled) setUser(body.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [authUrl, refetchIndex])

  const refetch = () => setRefetchIndex((n) => n + 1)

  return { user, loading, refetch }
}

export default useCurrentUser
