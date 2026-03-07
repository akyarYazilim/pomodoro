"use client"

import { cn } from "@/lib/utils"
import type { TimerMode } from "@/types/timer"

interface ModeSelectorProps {
  mode: TimerMode
  disabled?: boolean
  onModeChange: (mode: TimerMode) => void
}

const modes: { value: TimerMode; label: string }[] = [
  { value: "POMODORO", label: "Pomodoro" },
  { value: "FLOWTIME", label: "Flowtime" },
]

export function ModeSelector({ mode, disabled, onModeChange }: ModeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
      {modes.map(({ value, label }) => (
        <button
          key={value}
          disabled={disabled}
          onClick={() => onModeChange(value)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
            mode === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
