"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MoodDialogProps {
  open: boolean
  onRate: (mood: number) => void
  onSkip: () => void
}

const MOODS = [
  { value: 1, emoji: "😔", label: "Zordu" },
  { value: 2, emoji: "😐", label: "İdare eder" },
  { value: 3, emoji: "😊", label: "İyiydi" },
  { value: 4, emoji: "🔥", label: "Harikaydı" },
]

export function MoodDialog({ open, onRate, onSkip }: MoodDialogProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (!open) return null

  function handleConfirm() {
    if (selected !== null) {
      onRate(selected)
      setSelected(null)
    }
  }

  function handleSkip() {
    setSelected(null)
    onSkip()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background border rounded-xl shadow-lg p-6 max-w-xs w-full mx-4 text-center">
        <h3 className="text-base font-semibold mb-1">Bu seansı nasıl değerlendirirsin?</h3>
        <p className="text-xs text-muted-foreground mb-4">Ruh halin nasıldı?</p>

        <div className="flex justify-center gap-2 mb-5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelected(m.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                selected === m.value
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Geç
          </Button>
          <Button size="sm" disabled={selected === null} onClick={handleConfirm}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  )
}
