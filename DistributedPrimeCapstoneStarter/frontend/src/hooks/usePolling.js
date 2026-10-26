import { useEffect, useState, useRef, useCallback } from 'react'

// ============================================================
// usePolling — polls an async data fetcher at a configurable
// interval. Returns { data, isDemo, error, loading, refetch }.
// Supports demo mode, loading, disconnected, and error states.
// ============================================================

export function usePolling(fetcher, intervalMs = 5000, deps = []) {
  const [data, setData] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)

  const fetchData = useCallback(async () => {
    const result = await fetcherRef.current()
    if (!mountedRef.current) return
    setData(result.data)
    setIsDemo(result.isDemo)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetcherRef.current = fetcher

    fetchData()

    if (intervalMs > 0) {
      timerRef.current = setInterval(fetchData, intervalMs)
    }

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps])

  return { data, isDemo, error, loading, refetch: fetchData }
}

// ============================================================
// useLocalStorage — persists a value in localStorage
// ============================================================

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? stored : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStored = useCallback((val) => {
    setValue(val)
    try {
      localStorage.setItem(key, val)
    } catch {
      // ignore
    }
  }, [key])

  return [value, setStored]
}
