"use client"

import { Button } from "@/components/ui/button"

interface TimerStepProps {
  mode: "POMODORO" | "FLOWTIME"
  pomodoroMinutes: number
  onModeChange: (m: "POMODORO" | "FLOWTIME") => void
  onPomodoroMinutesChange: (v: number) => void
  onNext: () => void
  onBack: () => void
}

const POMODORO_DURATIONS = [15, 20, 25, 30, 45]

export function TimerStep({
  mode,
  pomodoroMinutes,
  onModeChange,
  onPomodoroMinutesChange,
  onNext,
  onBack,
}: TimerStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Timer tercihiniz?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          İstediğiniz zaman değiştirebilirsiniz.
        </p>
      </div>

      <div className="flex gap-3">
        {(["POMODORO", "FLOWTIME"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              mode === m
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50"
            }`}
          >
            {m === "POMODORO" ? "Pomodoro" : "Flowtime"}
          </button>
        ))}
      </div>

      {mode === "POMODORO" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Çalışma süresi</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {POMODORO_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => onPomodoroMinutesChange(d)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  pomodoroMinutes === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {d}dk
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack}>
          Geri
        </Button>
        <Button onClick={onNext} className="min-w-[140px]">
          Devam Et
        </Button>
      </div>
    </div>
  )
}
