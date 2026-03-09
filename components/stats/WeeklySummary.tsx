import { Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMinutes } from "@/lib/utils/format"
import type { WeekDay } from "@/hooks/useStats"

interface WeeklySummaryProps {
  weekly: WeekDay[]
  loading: boolean
}

export function WeeklySummary({ weekly, loading }: WeeklySummaryProps) {
  const total = weekly.reduce((s, d) => s + d.minutes, 0)

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-4 w-4" />
          <CardTitle className="text-xs font-medium">Bu Hafta</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">
          {loading ? "—" : weekly.length > 0 ? formatMinutes(total) : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">toplam odaklanma</p>
      </CardContent>
    </Card>
  )
}
