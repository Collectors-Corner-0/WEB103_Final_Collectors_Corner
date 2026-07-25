import { useEffect, useState } from 'react'

function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    if (!url) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function run() {
      try {
        const res = await fetch(url)
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Request failed.')
        if (!cancelled) setData(body)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [url, refetchIndex])

  const refetch = () => setRefetchIndex((n) => n + 1)

  return { data, loading, error, refetch }
}

export default useFetch
