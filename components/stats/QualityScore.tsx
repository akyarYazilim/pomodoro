"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface QualityData {
  avgMood: number | null
  ratedCount: number
  totalCount: number
}

export function QualityScore() {
  const [data, setData] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/quality")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const moodEmoji = (avg: number) => {
    if (avg >= 3.5) return "🔥"
    if (avg >= 2.5) return "😊"
    if (avg >= 1.5) return "😐"
    return "😔"
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Star className="h-4 w-4" />
          <CardTitle className="text-xs font-medium">Seans Kalitesi</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : data?.avgMood ? (
          <>
            <p className="text-2xl font-semibold">
              {moodEmoji(data.avgMood)}{" "}
              <span className="tabular-nums">{data.avgMood.toFixed(1)}</span>
              <span className="text-base font-normal text-muted-foreground">/4</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.ratedCount} / {data.totalCount} seans değerlendirildi
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-0.5">Henüz değerlendirme yok</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
