import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"
import type { DailyStats } from "@/hooks/useStats"

interface DailySummaryProps {
  stats: DailyStats | null
  loading: boolean
}

export function DailySummary({ stats, loading }: DailySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <CardTitle className="text-xs font-medium">Bugün</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold tabular-nums">
              {stats ? formatMinutes(stats.totalMinutes) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats ? `${stats.sessionCount} oturum` : ""}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
