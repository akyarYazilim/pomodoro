"use client"

import { useSessionHistory } from "@/hooks/useSessionHistory"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
}

export function SessionHistory() {
  const { sessions, loading } = useSessionHistory(5)

  if (loading) {
    return (
      <div className="w-full max-w-sm space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) return null

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        Son Oturumlar
      </p>
      <ul className="space-y-1">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/40"
          >
            <span className="truncate text-muted-foreground max-w-[160px]">
              {s.task?.title ?? (s.mode === "POMODORO" ? "Pomodoro" : "Flowtime")}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground ml-2 shrink-0">
              {s.actualMinutes}dk · {formatTime(s.startedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
