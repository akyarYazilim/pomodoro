"use client"

import { useStats } from "@/hooks/useStats"
import { useStreak } from "@/hooks/useStreak"
import { DailySummary } from "@/components/stats/DailySummary"
import { StreakDisplay } from "@/components/stats/StreakDisplay"
import { WeeklySummary } from "@/components/stats/WeeklySummary"
import { FocusChart } from "@/components/stats/FocusChart"
import { WeeklySummaryCard } from "@/components/stats/WeeklySummaryCard"
import { NotificationPermissionCard } from "@/components/notifications/NotificationPermissionCard"

export default function StatsPage() {
  const { daily, weekly, loading: statsLoading } = useStats()
  const { streak, loading: streakLoading } = useStreak()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">İstatistikler</h1>
        <p className="text-muted-foreground text-sm mt-1">Odaklanma geçmişin</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DailySummary stats={daily} loading={statsLoading} />
        <StreakDisplay streak={streak} loading={streakLoading} />
        <WeeklySummary weekly={weekly} loading={statsLoading} />
      </div>

      <WeeklySummaryCard />

      <FocusChart data={weekly} loading={statsLoading} />

      <NotificationPermissionCard />
    </div>
  )
}
