"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMinutes } from "@/lib/utils/format"

interface Records {
  longestSession: number
  bestDayMinutes: number
  longestStreak: number
}

export function PersonalRecords() {
  const [records, setRecords] = useState<Records | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/records")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setRecords(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hasAny = records && (records.longestSession > 0 || records.bestDayMinutes > 0 || records.longestStreak > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <CardTitle className="text-xs font-medium">Kişisel Rekorlar</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-6 w-14 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : !hasAny ? (
          <p className="text-sm text-muted-foreground">Henüz rekordun yok. İlk seansını tamamla!</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xl font-semibold tabular-nums">
                {records.longestSession > 0 ? formatMinutes(records.longestSession) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">En uzun seans</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">
                {records.bestDayMinutes > 0 ? formatMinutes(records.bestDayMinutes) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">En iyi gün</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">
                {records.longestStreak > 0 ? `${records.longestStreak}g` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">En uzun seri</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
