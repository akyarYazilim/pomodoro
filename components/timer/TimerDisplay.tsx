import { formatSeconds } from "@/lib/utils/format"
import type { TimerMode, TimerPhase, TimerStatus } from "@/types/timer"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  mode: TimerMode
  phase: TimerPhase
  status: TimerStatus
  secondsLeft: number
  pomodoroCount: number
  justCompleted?: boolean
}

const phaseLabels: Record<TimerPhase, string> = {
  FOCUS: "Odaklan",
  SHORT_BREAK: "Kısa Mola",
  LONG_BREAK: "Uzun Mola",
}

function getTimerColor(mode: TimerMode, phase: TimerPhase, secondsLeft: number): string {
  if (mode === "FLOWTIME") return "text-foreground"
  if (phase === "FOCUS") {
    if (secondsLeft <= 120) return "text-red-500 dark:text-red-400"
    if (secondsLeft <= 300) return "text-amber-500 dark:text-amber-400"
    return "text-foreground"
  }
  if (phase === "SHORT_BREAK") return "text-emerald-600 dark:text-emerald-400"
  return "text-blue-600 dark:text-blue-400"
}

export function TimerDisplay({
  mode,
  phase,
  status,
  secondsLeft,
  pomodoroCount,
  justCompleted = false,
}: TimerDisplayProps) {
  const label = mode === "FLOWTIME" ? "Flowtime" : phaseLabels[phase]
  const timeColor = getTimerColor(mode, phase, secondsLeft)
  const isUrgent = mode === "POMODORO" && phase === "FOCUS" && status === "RUNNING" && secondsLeft <= 120

  return (
    <div className={cn("flex flex-col items-center gap-4", justCompleted && "animate-bounce")}>
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>

      <div
        className={cn(
          "text-8xl font-mono font-semibold tabular-nums transition-colors duration-500",
          timeColor,
          status === "PAUSED" && "opacity-60",
          (status === "COMPLETED" || isUrgent) && "animate-pulse",
        )}
        style={isUrgent ? { animationDuration: "1.5s" } : undefined}
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
