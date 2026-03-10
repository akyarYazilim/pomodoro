"use client"

import { useState, useEffect } from "react"

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  streakFreezeCount: number
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const fetchWithRetry = async (retries = 1): Promise<Response> => {
      try {
        return await fetch("/api/stats/streak", { signal })
      } catch (e) {
        if ((e as Error).name === "AbortError" || retries === 0) throw e
        await new Promise((res) => setTimeout(res, 1000))
        return fetchWithRetry(retries - 1)
      }
    }

    fetchWithRetry()
      .then((r) => {
        if (!r.ok) throw new Error(`/api/stats/streak ${r.status}`)
        return r.json()
      })
      .then(setStreak)
      .catch((e) => { if (e.name !== "AbortError") console.error("useStreak:", e) })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { streak, loading }
}
