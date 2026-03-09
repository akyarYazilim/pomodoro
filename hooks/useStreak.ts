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
    fetch("/api/stats/streak")
      .then((r) => r.json())
      .then(setStreak)
      .finally(() => setLoading(false))
  }, [])

  return { streak, loading }
}
