"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"
import { isToday } from "@/lib/utils/date"
import type { WeekDay } from "@/hooks/useStats"

interface FocusChartProps {
  data: WeekDay[]
  loading?: boolean
}

export function FocusChart({ data, loading }: FocusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Son 7 Gün</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Son 7 Gün</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
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
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    isToday(new Date(entry.date + "T00:00:00"))
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground) / 0.4)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
