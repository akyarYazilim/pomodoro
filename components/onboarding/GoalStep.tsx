"use client"

import { Button } from "@/components/ui/button"

const GOAL_OPTIONS = [
  { label: "30 dakika", value: 30 },
  { label: "1 saat", value: 60 },
  { label: "1.5 saat", value: 90 },
  { label: "2 saat", value: 120 },
  { label: "3 saat", value: 180 },
]

interface GoalStepProps {
  value: number
  onChange: (v: number) => void
  onNext: () => void
}

export function GoalStep({ value, onChange, onNext }: GoalStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Günlük hedefiniz ne?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Her gün kaç dakika odaklanmak istiyorsunuz?
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Button onClick={onNext} className="mt-2 min-w-[140px]">
        Devam Et
      </Button>
    </div>
  )
}
