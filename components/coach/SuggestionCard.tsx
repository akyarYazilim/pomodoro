"use client"

import { Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SuggestionCardProps {
  tip: string | null
  loading: boolean
}

export function SuggestionCard({ tip, loading }: SuggestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">Günün İpucu</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        ) : tip ? (
          <p className="text-sm text-foreground leading-relaxed">{tip}</p>
        ) : (
          <p className="text-sm text-muted-foreground">İpucu yüklenemedi.</p>
        )}
      </CardContent>
    </Card>
  )
}
