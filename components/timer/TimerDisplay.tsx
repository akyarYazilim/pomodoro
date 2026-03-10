import { formatSeconds } from "@/lib/utils/format"
import type { TimerMode, TimerPhase, TimerStatus } from "@/types/timer"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  mode: TimerMode
  phase: TimerPhase
  status: TimerStatus
  secondsLeft: number
  pomodoroCount: number
}

const phaseLabels: Record<TimerPhase, string> = {
  FOCUS: "Odaklan",
  SHORT_BREAK: "Kısa Mola",
  LONG_BREAK: "Uzun Mola",
}

const phaseColors: Record<TimerPhase, string> = {
  FOCUS: "text-foreground",
  SHORT_BREAK: "text-emerald-600 dark:text-emerald-400",
  LONG_BREAK: "text-blue-600 dark:text-blue-400",
}

export function TimerDisplay({
  mode,
  phase,
  status,
  secondsLeft,
  pomodoroCount,
}: TimerDisplayProps) {
  const label = mode === "FLOWTIME" ? "Flowtime" : phaseLabels[phase]
  const timeColor = mode === "FLOWTIME" ? "text-foreground" : phaseColors[phase]

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>

      <div
        className={cn(
          "text-8xl font-mono font-semibold tabular-nums transition-colors",
          timeColor,
          status === "PAUSED" && "opacity-60",
          status === "COMPLETED" && "animate-pulse"
        )}
      >
        {formatSeconds(secondsLeft)}
      </div>

      {mode === "POMODORO" && (
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i < pomodoroCount % 4
                  ? "bg-foreground"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {mode === "FLOWTIME" && secondsLeft > 0 && (
        <span className="text-xs text-muted-foreground">
          {Math.floor(secondsLeft / 60)} dk geçti
        </span>
      )}
    </div>
  )
}
