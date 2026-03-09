import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StreakStats } from "@/hooks/useStreak"

interface StreakDisplayProps {
  streak: StreakStats | null
  loading: boolean
}

export function StreakDisplay({ streak, loading }: StreakDisplayProps) {
  const isActive = !loading && streak && streak.currentStreak > 0

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className={cn("h-4 w-4", isActive && "text-orange-500 animate-pulse")} />
          <CardTitle className="text-xs font-medium">Streak</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">
          {loading ? "—" : streak ? `${streak.currentStreak}` : "—"}
          <span className="text-sm font-normal text-muted-foreground ml-1">gün</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {!loading && streak ? `En iyi: ${streak.longestStreak} gün` : ""}
        </p>
      </CardContent>
    </Card>
  )
}
