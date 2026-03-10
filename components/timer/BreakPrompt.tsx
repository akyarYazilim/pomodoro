"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TimerPhase } from "@/types/timer"

const BREAK_SUGGESTIONS = [
  "Telefonu bırak, pencereden bak 🌿",
  "Göz egzersizi yap: 20 saniye uzağa bak (20-20-20 kuralı) 👁️",
  "Kısa bir yürüyüş yap, kanını dolaştır 🚶",
  "Su iç, derin nefes al 💧",
  "Gözlerini kapat ve biraz dinlen 😌",
  "Biraz esne, boyun ve omuz egzersizi yap 🤸",
  "Ayağa kalk, iki dakika hareket et 🏃",
]

interface BreakPromptProps {
  phase: Extract<TimerPhase, "SHORT_BREAK" | "LONG_BREAK">
  breakMinutes: number
  onStart: () => void
  onSkip: () => void
}

export function BreakPrompt({ phase, breakMinutes, onStart, onSkip }: BreakPromptProps) {
  const isLong = phase === "LONG_BREAK"
  const label = isLong ? "Uzun Mola" : "Kısa Mola"
  const suggestion = useMemo(
    () => BREAK_SUGGESTIONS[Math.floor(Math.random() * BREAK_SUGGESTIONS.length)],
    []
  )

  return (
    <Card className="w-full max-w-sm border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6">
        <div className="text-center">
          <p className="text-lg font-semibold">{label} zamanı!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {breakMinutes} dakika mola ver, sonra devam et.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-3 italic">
            💡 {suggestion}
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
