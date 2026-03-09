"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMinutes } from "@/lib/utils/format"
import type { WeekDay } from "@/hooks/useStats"

interface FocusChartProps {
  data: WeekDay[]
}

export function FocusChart({ data }: FocusChartProps) {
  const today = new Date().toISOString().split("T")[0]

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
                    entry.date === today
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
