"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TimerPhase } from "@/types/timer"

interface BreakPromptProps {
  phase: Extract<TimerPhase, "SHORT_BREAK" | "LONG_BREAK">
  breakMinutes: number
  onStart: () => void
  onSkip: () => void
}

export function BreakPrompt({ phase, breakMinutes, onStart, onSkip }: BreakPromptProps) {
  const isLong = phase === "LONG_BREAK"
  const label = isLong ? "Uzun Mola" : "Kısa Mola"

  return (
    <Card className="w-full max-w-sm border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6">
        <div className="text-center">
          <p className="text-lg font-semibold">{label} zamanı!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {breakMinutes} dakika mola ver, sonra devam et.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onStart} className="min-w-[100px]">
            Molayı Başlat
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            Atla
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
