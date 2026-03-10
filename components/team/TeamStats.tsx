import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckSquare, TrendingUp, TrendingDown } from "lucide-react"

interface TeamStatsProps {
  totalMinutes: number
  totalTasks: number
  memberCount: number
}

export function TeamStats({ totalMinutes, totalTasks, memberCount }: TeamStatsProps) {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Bu Hafta</span>
          </div>
          <p className="text-xl font-bold">
            {hours > 0 ? `${hours}s ${mins}d` : `${mins}d`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Görev</span>
          </div>
          <p className="text-xl font-bold">{totalTasks}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Üye</span>
          </div>
          <p className="text-xl font-bold">{memberCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}

interface TrendBadgeProps {
  thisWeek: number
  prevWeek: number
}

export function TrendBadge({ thisWeek, prevWeek }: TrendBadgeProps) {
  if (prevWeek === 0) return null
  const diff = thisWeek - prevWeek
  const pct = Math.round((diff / prevWeek) * 100)
  if (pct === 0) return null

  const up = pct > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? "text-green-600" : "text-red-500"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {pct}%
    </span>
  )
}
