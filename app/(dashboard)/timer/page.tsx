"use client"

import { useTimerStore } from "@/stores/timer-store"
import { useTimer } from "@/hooks/useTimer"
import { useSessionRecorder } from "@/hooks/useSessionRecorder"
import { ModeSelector } from "@/components/timer/ModeSelector"
import { TimerDisplay } from "@/components/timer/TimerDisplay"
import { TimerControls } from "@/components/timer/TimerControls"
import { TaskSelector } from "@/components/timer/TaskSelector"

export default function TimerPage() {
  const { setMode, setActiveTask, activeTaskId } = useTimerStore()
  const { onTimerComplete } = useSessionRecorder()
  const { mode, phase, status, secondsLeft, pomodoroCount, start, pause, resume, stop, skipPhase } =
    useTimer(onTimerComplete)

  const isRunning = status === "RUNNING"

  function handleModeChange(newMode: typeof mode) {
    if (isRunning) return
    setMode(newMode)
    stop()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <ModeSelector mode={mode} disabled={isRunning} onModeChange={handleModeChange} />

      <TimerDisplay
        mode={mode}
        phase={phase}
        status={status}
        secondsLeft={secondsLeft}
        pomodoroCount={pomodoroCount}
      />

      <TimerControls
        mode={mode}
        status={status}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onStop={stop}
        onSkip={skipPhase}
      />

      <TaskSelector
        activeTaskId={activeTaskId}
        onSelect={setActiveTask}
        disabled={isRunning}
      />
    </div>
  )
}
