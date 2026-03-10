"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Timer, CheckSquare, BarChart2, Flame, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"
import { SuggestionCard } from "@/components/coach/SuggestionCard"
import { useDailyTip } from "@/hooks/useCoach"

interface DailyStats {
  totalMinutes: number
  sessionCount: number
}

interface StreakStats {
  currentStreak: number
}

export default function DashboardPage() {
  const [daily, setDaily] = useState<DailyStats | null>(null)
  const [streak, setStreak] = useState<StreakStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const { tip, loading: tipLoading } = useDailyTip()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch("/api/stats/daily", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/stats/streak", { signal: controller.signal }).then((r) => r.json()),
    ])
      .then(([d, s]) => { setDaily(d); setStreak(s) })
      .catch((e) => { if (e.name !== "AbortError") console.error("dashboard stats:", e) })
      .finally(() => setStatsLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bugün</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <CardTitle className="text-xs font-medium">Odaklanma</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <><Skeleton className="h-9 w-24 mb-1" /><Skeleton className="h-3 w-32" /></>
            ) : (
              <>
                <p className="text-3xl font-semibold tabular-nums">
                  {daily ? formatMinutes(daily.totalMinutes) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {daily ? `${daily.sessionCount} oturum tamamlandı` : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame className="h-4 w-4" />
              <CardTitle className="text-xs font-medium">Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <><Skeleton className="h-9 w-16 mb-1" /><Skeleton className="h-3 w-24" /></>
            ) : (
              <>
                <p className="text-3xl font-semibold tabular-nums">
                  {streak ? streak.currentStreak : "—"}
                  <span className="text-base font-normal text-muted-foreground ml-1">gün</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {streak?.currentStreak ? "Devam ediyor!" : "Bugün başla"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/timer">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Timer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Odaklanmaya başla</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Görevler</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Listeni yönet</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stats">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">İstatistik</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Geçmişini gör</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <SuggestionCard tip={tip} loading={tipLoading} />
    </div>
  )
}
