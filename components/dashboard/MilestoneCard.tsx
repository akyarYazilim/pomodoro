"use client"

import { useEffect, useState } from "react"

interface MilestoneData {
  type: "day1" | "day3" | "day7"
  label: string
  emoji: string
}

export function MilestoneCard() {
  const [milestone, setMilestone] = useState<MilestoneData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/stats/milestone")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.milestone) setMilestone(data.milestone)
      })
      .catch(() => {})
  }, [])

  if (!milestone || dismissed) return null

  const bgMap = {
    day1: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    day3: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    day7: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  }

  return (
    <div className={`rounded-lg border px-4 py-3 flex items-center justify-between ${bgMap[milestone.type]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{milestone.emoji}</span>
        <p className="text-sm font-medium">{milestone.label}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors text-xs"
      >
        ✕
      </button>
    </div>
  )
}
