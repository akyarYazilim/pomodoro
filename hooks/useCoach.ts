"use client"

import { useState, useEffect } from "react"

export function useDailyTip() {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/coach/daily-tip")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => setTip(d.tip ?? null))
      .catch(() => setTip(null))
      .finally(() => setLoading(false))
  }, [])

  return { tip, loading }
}
