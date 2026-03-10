"use client"

import { useState, useEffect } from "react"

export interface StreakStats {
  currentStreak: number
  longestStreak: number
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/stats/streak", { signal: controller.signal })
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
