import { Play, Pause, Square, SkipForward, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TimerMode, TimerStatus } from "@/types/timer"

const QUICK_START_MINUTES = [5, 10, 15] as const

interface TimerControlsProps {
  mode: TimerMode
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onSkip: () => void
  onQuickStart: (minutes: number) => void
}

export function TimerControls({
  mode,
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
  onQuickStart,
}: TimerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {status === "IDLE" && (
        <>
          <div className="flex items-center gap-3">
            <Button size="lg" className="px-10" onClick={onStart}>
              <Play className="mr-2 h-4 w-4" />
              Başla
            </Button>
          </div>
          {mode === "POMODORO" && (
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-muted-foreground" />
              {QUICK_START_MINUTES.map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => onQuickStart(m)}
                >
                  {m} dk
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {status === "RUNNING" && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-lg" onClick={onStop} title="Durdur">
            <Square className="h-4 w-4" />
          </Button>
          <Button size="lg" className="px-10" onClick={onPause}>
            <Pause className="mr-2 h-4 w-4" />
            Duraklat
          </Button>
          {mode === "POMODORO" && (
            <Button variant="outline" size="icon-lg" onClick={onSkip} title="Atla">
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {status === "PAUSED" && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-lg" onClick={onStop} title="Sıfırla">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" className="px-10" onClick={onResume}>
            <Play className="mr-2 h-4 w-4" />
            Devam Et
          </Button>
          {mode === "POMODORO" && (
            <Button variant="outline" size="icon-lg" onClick={onSkip} title="Atla">
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
