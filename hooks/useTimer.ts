"use client"

import { useEffect, useRef, useCallback } from "react"
import { useTimerStore } from "@/stores/timer-store"
import { sounds } from "@/lib/utils/sounds"
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
  quickStart: (minutes: number) => void
}

export function useTimer(
  onComplete?: (payload: TimerCompletePayload) => void
): UseTimerReturn {
  const store = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Tracks real-clock timestamp of last tick for background accuracy
  const lastTickRef = useRef<number>(Date.now())

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /**
   * Advance timer by `elapsed` real seconds.
   * Used by both the setInterval and the visibilitychange handler.
   */
  const advanceTick = useCallback(
    (elapsed: number) => {
      const s = useTimerStore.getState()

      if (s.mode === "POMODORO") {
        if (s.secondsLeft <= elapsed) {
          clearTimer()
          onComplete?.({
            mode: s.mode,
            phase: s.phase,
            durationSeconds: s.secondsLeft,
            taskId: s.activeTaskId,
          })
          const { deepFocusMode, config } = useTimerStore.getState()
          if (deepFocusMode && s.phase === "FOCUS") {
            s.setSecondsLeft(config.pomodoroMinutes * 60)
            s.setStatus("RUNNING")
          } else {
            if (s.phase === "SHORT_BREAK" || s.phase === "LONG_BREAK") {
              sounds.breakEnd()
            }
            s.nextPhase()
          }
        } else {
          s.setSecondsLeft(s.secondsLeft - elapsed)
        }
      } else {
        // Flowtime: count elapsed seconds upward
        s.setSecondsLeft(s.secondsLeft + elapsed)
      }
    },
    [clearTimer, onComplete]
  )

  // Main interval — uses real elapsed time to stay accurate even when throttled
  useEffect(() => {
    if (store.status !== "RUNNING") {
      clearTimer()
      return
    }

    lastTickRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.max(1, Math.round((now - lastTickRef.current) / 1000))
      lastTickRef.current = now
      advanceTick(elapsed)
    }, 1000)

    return clearTimer
  }, [store.status, store.mode, clearTimer, advanceTick])

  // Page Visibility API: sync immediately when tab regains focus
  useEffect(() => {
    if (store.status !== "RUNNING") return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now()
        const elapsed = Math.round((now - lastTickRef.current) / 1000)
        if (elapsed >= 2) {
          // Tab was hidden long enough — sync now instead of waiting for next tick
          lastTickRef.current = now
          advanceTick(elapsed)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [store.status, advanceTick])

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer])

  const start = useCallback(() => {
    const s = useTimerStore.getState()
    if (s.mode === "FLOWTIME") {
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

  const quickStart = useCallback((minutes: number) => {
    const s = useTimerStore.getState()
    s.setSecondsLeft(minutes * 60)
    s.setStatus("RUNNING")
  }, [])

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
    quickStart,
  }
}
