"use client"

import { useEffect, useRef, useCallback } from "react"
import { useTimerStore } from "@/stores/timer-store"
import type { TimerMode, TimerPhase } from "@/types/timer"

export interface TimerCompletePayload {
  mode: TimerMode
  phase: TimerPhase
  durationSeconds: number
  taskId: string | null
}

export interface UseTimerReturn {
  mode: TimerMode
  phase: TimerPhase
  status: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED"
  secondsLeft: number
  pomodoroCount: number
  activeTaskId: string | null
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipPhase: () => void
}

export function useTimer(
  onComplete?: (payload: TimerCompletePayload) => void
): UseTimerReturn {
  const store = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (store.status !== "RUNNING") {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(() => {
      const s = useTimerStore.getState()

      if (s.mode === "POMODORO") {
        if (s.secondsLeft <= 1) {
          clearTimer()
          onComplete?.({
            mode: s.mode,
            phase: s.phase,
            durationSeconds: s.secondsLeft === 1 ? 1 : 0,
            taskId: s.activeTaskId,
          })
          s.nextPhase()
        } else {
          s.setSecondsLeft(s.secondsLeft - 1)
        }
      } else {
        // Flowtime: secondsLeft counts UP from 0 (elapsed time)
        s.setSecondsLeft(s.secondsLeft + 1)
      }
    }, 1000)

    return clearTimer
  }, [store.status, store.mode, clearTimer, onComplete])

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer])

  const start = useCallback(() => {
    const s = useTimerStore.getState()
    if (s.mode === "FLOWTIME") {
      // Reset elapsed to 0 before starting
      s.setSecondsLeft(0)
    }
    s.setStatus("RUNNING")
  }, [])

  const pause = useCallback(() => {
    useTimerStore.getState().setStatus("PAUSED")
  }, [])

  const resume = useCallback(() => {
    useTimerStore.getState().setStatus("RUNNING")
  }, [])

  const stop = useCallback(() => {
    const s = useTimerStore.getState()
    if (s.mode === "FLOWTIME" && s.status !== "IDLE") {
      onComplete?.({
        mode: s.mode,
        phase: "FOCUS",
        durationSeconds: s.secondsLeft,
        taskId: s.activeTaskId,
      })
    }
    clearTimer()
    s.reset()
  }, [clearTimer, onComplete])

  const skipPhase = useCallback(() => {
    clearTimer()
    useTimerStore.getState().nextPhase()
  }, [clearTimer])

  return {
    mode: store.mode,
    phase: store.phase,
    status: store.status,
    secondsLeft: store.secondsLeft,
    pomodoroCount: store.pomodoroCount,
    activeTaskId: store.activeTaskId,
    start,
    pause,
    resume,
    stop,
    skipPhase,
  }
}
