import { formatMinutes } from "@/lib/utils/format"
import type { DailyStats } from "@/hooks/useStats"

interface GoalCompletionCardProps {
  daily: DailyStats
}

export function GoalCompletionCard({ daily }: GoalCompletionCardProps) {
  const { totalMinutes, dailyGoalMinutes } = daily
  const pct = Math.round((totalMinutes / dailyGoalMinutes) * 100)

  if (pct < 100) return null

  const isOverachiever = pct >= 150

  return (
    <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-center">
      {isOverachiever ? (
        <>
          <p className="font-medium">🌿 Günlük hedefini %{pct} aştın!</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {formatMinutes(totalMinutes)} odaklandın. Dinlenmeyi de unutma.
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">🎉 Günlük hedefini tamamladın!</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {formatMinutes(totalMinutes)} / {formatMinutes(dailyGoalMinutes)} — Harika iş!
          </p>
        </>
      )}
    </div>
  )
}
