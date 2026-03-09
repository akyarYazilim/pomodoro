"use client"

import { useState, useEffect } from "react"

export interface DailyStats {
  totalMinutes: number
  sessionCount: number
}

export interface WeekDay {
  date: string
  minutes: number
}

export function useStats() {
  const [daily, setDaily] = useState<DailyStats | null>(null)
  const [weekly, setWeekly] = useState<WeekDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/daily").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
    ])
      .then(([d, w]) => {
        setDaily(d)
        setWeekly(w.days ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return { daily, weekly, loading }
}
