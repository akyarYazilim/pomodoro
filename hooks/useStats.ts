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
      })
      .catch((e) => { if (e.name !== "AbortError") console.error("useStats:", e) })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { daily, weekly, loading }
}
