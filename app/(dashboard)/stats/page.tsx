"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Flame, Clock, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMinutes } from "@/lib/utils/format"

interface DailyStats {
  totalMinutes: number
  sessionCount: number
}

interface StreakStats {
  currentStreak: number
  longestStreak: number
}

interface WeekDay {
  date: string
  minutes: number
}

export default function StatsPage() {
  const [daily, setDaily] = useState<DailyStats | null>(null)
  const [streak, setStreak] = useState<StreakStats | null>(null)
  const [weekly, setWeekly] = useState<WeekDay[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/daily").then((r) => r.json()),
      fetch("/api/stats/streak").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
    ]).then(([d, s, w]) => {
      setDaily(d)
      setStreak(s)
      setWeekly(w.days ?? [])
    })
  }, [])

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">İstatistikler</h1>
        <p className="text-muted-foreground text-sm mt-1">Odaklanma geçmişin</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <CardTitle className="text-xs font-medium">Bugün</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {daily ? formatMinutes(daily.totalMinutes) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {daily ? `${daily.sessionCount} oturum` : ""}
            </p>
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
            <p className="text-2xl font-semibold tabular-nums">
              {streak ? `${streak.currentStreak}` : "—"}
              <span className="text-sm font-normal text-muted-foreground ml-1">gün</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {streak ? `En iyi: ${streak.longestStreak} gün` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="h-4 w-4" />
              <CardTitle className="text-xs font-medium">Bu Hafta</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {weekly.length > 0
                ? formatMinutes(weekly.reduce((s, d) => s + d.minutes, 0))
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">toplam odaklanma</p>
          </CardContent>
        </Card>
      </div>

      {weekly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Son 7 Gün</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekly} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Date(v + "T00:00:00").toLocaleDateString("tr-TR", { weekday: "short" })
                  }
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [formatMinutes(Number(v ?? 0)), "Odaklanma"]}
                  labelFormatter={(v) =>
                    new Date(v + "T00:00:00").toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {weekly.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={entry.date === today ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
