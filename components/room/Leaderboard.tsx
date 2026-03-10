"use client"

import type { LeaderboardEntry } from "@/hooks/useRoom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Bu hafta henüz seans yok
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const delta = entry.currentWeekMinutes - entry.prevWeekMinutes
        const isYou = entry.userId === currentUserId
        const hours = Math.floor(entry.currentWeekMinutes / 60)
        const mins = entry.currentWeekMinutes % 60

        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 rounded-lg p-2 ${isYou ? "bg-muted/60" : ""}`}
          >
            <span className="w-5 text-xs text-muted-foreground text-center font-mono">
              {i + 1}
            </span>
            <Avatar className="h-7 w-7">
              <AvatarImage src={entry.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {(entry.name ?? "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium">
              {entry.name ?? "Anonim"}
              {isYou && (
                <span className="text-xs text-muted-foreground ml-1">(sen)</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold tabular-nums">
                {hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`}
              </span>
              {delta > 0 && <TrendingUp className="h-3 w-3 text-green-500" />}
              {delta < 0 && <TrendingDown className="h-3 w-3 text-red-400" />}
              {delta === 0 && <Minus className="h-3 w-3 text-muted-foreground" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
