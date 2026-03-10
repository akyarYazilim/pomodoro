import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { StreakStats } from "@/hooks/useStreak"

interface StreakDisplayProps {
  streak: StreakStats | null
  loading: boolean
}

export function StreakDisplay({ streak, loading }: StreakDisplayProps) {
  const isActive = !loading && streak && streak.currentStreak > 0
  const hasFreeze = !loading && streak && streak.streakFreezeCount > 0

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className={cn("h-4 w-4", isActive && "text-orange-500 animate-pulse")} />
            <CardTitle className="text-xs font-medium">Streak</CardTitle>
          </div>
          {hasFreeze && (
            <span
              className="text-xs text-blue-500 font-medium"
              title="Streak Koruması — 1 defa kullanılabilir"
            >
              🧊 {streak?.streakFreezeCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <><Skeleton className="h-8 w-16 mb-1" /><Skeleton className="h-3 w-24" /></>
        ) : (
          <>
            <p className="text-2xl font-semibold tabular-nums">
              {streak ? `${streak.currentStreak}` : "—"}
              <span className="text-sm font-normal text-muted-foreground ml-1">gün</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {streak ? `En iyi: ${streak.longestStreak} gün` : ""}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
