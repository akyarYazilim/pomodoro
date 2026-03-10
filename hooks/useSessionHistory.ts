"use client"

import { useState, useEffect } from "react"

export interface SessionRecord {
  id: string
  mode: "POMODORO" | "FLOWTIME"
  actualMinutes: number
  startedAt: string
  task: { title: string } | null
}

export function useSessionHistory(limit = 5) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/sessions?limit=${limit}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`/api/sessions ${r.status}`)
        return r.json()
      })
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((e) => { if (e.name !== "AbortError") console.error("useSessionHistory:", e) })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [limit])

  return { sessions, loading }
}
