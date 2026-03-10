"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Brain } from "lucide-react"
import { useTimerStore } from "@/stores/timer-store"
import { useTimer, type TimerCompletePayload } from "@/hooks/useTimer"
import { useSessionRecorder } from "@/hooks/useSessionRecorder"
import { ModeSelector } from "@/components/timer/ModeSelector"
import { TimerDisplay } from "@/components/timer/TimerDisplay"
import { TimerControls } from "@/components/timer/TimerControls"
import { TaskSelector } from "@/components/timer/TaskSelector"
import { BreakPrompt } from "@/components/timer/BreakPrompt"
import { ContinueDialog } from "@/components/timer/ContinueDialog"
import { SessionHistory } from "@/components/timer/SessionHistory"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TimerPage() {
  const { data: session } = useSession()
  const { setMode, setActiveTask, activeTaskId, initFromSession, deepFocusMode, setDeepFocusMode } = useTimerStore()
  const [justCompleted, setJustCompleted] = useState(false)
  const [showContinueDialog, setShowContinueDialog] = useState(false)

  useEffect(() => {
    if (session?.user) {
      initFromSession(session.user)
    }
  }, [session, initFromSession])

  const { onTimerComplete } = useSessionRecorder()

  const handleComplete = useCallback(
    (payload: TimerCompletePayload) => {
      onTimerComplete(payload)
      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 1500)
    },
    [onTimerComplete]
  )

  const { mode, phase, status, secondsLeft, pomodoroCount, start, pause, resume, stop, skipPhase, quickStart } =
    useTimer(handleComplete)

  const isRunning = status === "RUNNING"
  const showBreakPrompt =
    mode === "POMODORO" &&
    (phase === "SHORT_BREAK" || phase === "LONG_BREAK") &&
    status === "IDLE"

  function handleModeChange(newMode: typeof mode) {
    if (isRunning) return
    setMode(newMode)
    stop()
  }

  function handleStop() {
    if (mode === "FLOWTIME" && status === "RUNNING") {
      setShowContinueDialog(true)
    } else {
      stop()
    }
  }

  function handleContinue() {
    setShowContinueDialog(false)
  }

  function handleFinish() {
    setShowContinueDialog(false)
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
        justCompleted={justCompleted}
      />

      {showBreakPrompt ? (
        <BreakPrompt
          phase={phase as "SHORT_BREAK" | "LONG_BREAK"}
          breakMinutes={Math.round(secondsLeft / 60)}
          onStart={start}
          onSkip={skipPhase}
        />
      ) : (
        <TimerControls
          mode={mode}
          status={status}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onStop={handleStop}
          onSkip={skipPhase}
          onQuickStart={quickStart}
        />
      )}

      {mode === "POMODORO" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeepFocusMode(!deepFocusMode)}
          disabled={isRunning}
          className={cn(
            "text-xs gap-1.5",
            deepFocusMode && "text-primary bg-primary/10"
          )}
          title="Mola vermeden sürekli odaklan"
        >
          <Brain className="h-3.5 w-3.5" />
          Derin Çalışma {deepFocusMode ? "Açık" : "Kapalı"}
        </Button>
      )}

      <TaskSelector
        activeTaskId={activeTaskId}
        onSelect={setActiveTask}
        disabled={isRunning}
      />

      <SessionHistory />

      <ContinueDialog
        open={showContinueDialog}
        elapsedSeconds={secondsLeft}
        onContinue={handleContinue}
        onFinish={handleFinish}
      />
    </div>
  )
}
