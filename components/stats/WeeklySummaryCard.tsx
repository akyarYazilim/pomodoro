"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"

interface WeeklySummaryData {
  thisWeekMinutes: number
  lastWeekMinutes: number
  thisWeekSessions: number
  longestSessionMinutes: number
  pomodoroCount: number
  flowtimeCount: number
  goalPercent: number
  changePercent: number | null
}

export function WeeklySummaryCard() {
  const [data, setData] = useState<WeeklySummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const fetchWithRetry = async (retries = 1): Promise<Response> => {
      try {
        return await fetch("/api/stats/weekly-summary", { signal: controller.signal })
      } catch (e) {
        if ((e as Error).name === "AbortError" || retries === 0) throw e
        await new Promise((res) => setTimeout(res, 1000))
        return fetchWithRetry(retries - 1)
      }
    }

    fetchWithRetry()
      .then((r) => {
        if (!r.ok) throw new Error(`/api/stats/weekly-summary ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => { if (e.name !== "AbortError") console.error("WeeklySummaryCard:", e) })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const changeIcon =
    data?.changePercent == null ? <Minus className="h-3.5 w-3.5" /> :
    data.changePercent > 0 ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> :
    <TrendingDown className="h-3.5 w-3.5 text-red-400" />

  const changeLabel =
    data?.changePercent == null ? "İlk haftan" :
    data.changePercent > 0 ? `Geçen haftadan %${data.changePercent} fazla` :
    data.changePercent < 0 ? `Geçen haftadan %${Math.abs(data.changePercent)} az` :
    "Geçen haftayla aynı"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </>
        ) : (
          <>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {data ? formatMinutes(data.thisWeekMinutes) : "—"}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                {changeIcon}
                <span>{changeLabel}</span>
              </div>
            </div>

            {data && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{data.thisWeekSessions} oturum · En uzun: {data.longestSessionMinutes}dk</p>
                <p>🍅 {data.pomodoroCount} Pomodoro · ⏱ {data.flowtimeCount} Flowtime</p>
                <div className="mt-2">
                  <div className="flex justify-between mb-0.5">
                    <span>Haftalık hedef</span>
                    <span className="font-medium text-foreground">{data.goalPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(data.goalPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
