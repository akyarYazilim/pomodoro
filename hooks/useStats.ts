"use client"

import { useState, useEffect } from "react"

export interface DailyStats {
  totalMinutes: number
  sessionCount: number
  pomodoroCount: number
  flowtimeCount: number
  dailyGoalMinutes: number
}

export interface WeekDay {
  date: string
  minutes: number
}

export interface WeeklyStats {
  days: WeekDay[]
  currentWeekTotal: number
  previousWeekTotal: number
}

export function useStats() {
  const [daily, setDaily] = useState<DailyStats | null>(null)
  const [weekly, setWeekly] = useState<WeekDay[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const get = (url: string) =>
      fetch(url, { signal }).then((r) => {
        if (!r.ok) throw new Error(`${url} ${r.status}`)
        return r.json()
      })

    Promise.all([get("/api/stats/daily"), get("/api/stats/weekly")])
      .then(([d, w]) => {
        setDaily(d)
        setWeekly(w.days ?? [])
        setWeeklyStats({
          days: w.days ?? [],
          currentWeekTotal: w.currentWeekTotal ?? 0,
          previousWeekTotal: w.previousWeekTotal ?? 0,
        })
      })
      .catch((e) => { if (e.name !== "AbortError") console.error("useStats:", e) })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { daily, weekly, weeklyStats, loading }
}
