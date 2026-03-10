import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"
import type { WeeklyStats } from "@/hooks/useStats"

interface WeeklySummaryProps {
  weeklyStats: WeeklyStats | null
  loading: boolean
}

export function WeeklySummary({ weeklyStats, loading }: WeeklySummaryProps) {
  const total = weeklyStats?.currentWeekTotal ?? 0
  const prev = weeklyStats?.previousWeekTotal ?? 0

  const diffPct = prev > 0 ? Math.round(((total - prev) / prev) * 100) : null

  let TrendIcon = Minus
  let trendClass = "text-muted-foreground"
  let trendLabel = "Geçen haftaya göre"

  if (diffPct !== null && diffPct > 0) {
    TrendIcon = TrendingUp
    trendClass = "text-emerald-600 dark:text-emerald-400"
    trendLabel = `%${diffPct} daha fazla`
  } else if (diffPct !== null && diffPct < 0) {
    TrendIcon = TrendingDown
    trendClass = "text-red-500 dark:text-red-400"
    trendLabel = `%${Math.abs(diffPct)} daha az`
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-4 w-4" />
          <CardTitle className="text-xs font-medium">Bu Hafta</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold tabular-nums">
              {total > 0 ? formatMinutes(total) : "—"}
            </p>
            <div className={`flex items-center gap-0.5 text-xs mt-0.5 ${trendClass}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendLabel}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
