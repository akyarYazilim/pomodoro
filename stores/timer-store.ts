import { create } from "zustand"
import type { TimerMode, TimerPhase, TimerStatus, TimerState, PomodoroConfig } from "@/types/timer"
import { getNextPhase, getPhaseSeconds } from "@/lib/timer/pomodoro"

interface TimerStore extends TimerState {
  setMode: (mode: TimerMode) => void
  setStatus: (status: TimerStatus) => void
  setSecondsLeft: (seconds: number) => void
  nextPhase: () => void
  reset: () => void
  setActiveTask: (taskId: string | null) => void
}

const DEFAULT_CONFIG: Required<PomodoroConfig> = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

function getInitialSeconds(mode: TimerMode, phase: TimerPhase): number {
  if (mode === "FLOWTIME") return 0
  return getPhaseSeconds(phase, DEFAULT_CONFIG)
}

function computeNextPhase(state: TimerState): Partial<TimerState> {
  const pomodoroState = {
    mode: "POMODORO" as const,
    phase: state.phase,
    status: state.status,
    secondsLeft: state.secondsLeft,
    pomodoroCount: state.pomodoroCount,
    completed: false,
  }

  const nextPhase = getNextPhase(pomodoroState, DEFAULT_CONFIG)
  const nextPomodoroCount =
    state.phase === "FOCUS" ? state.pomodoroCount + 1 : state.pomodoroCount
  const finalPomodoroCount =
    nextPhase === "FOCUS" && state.phase === "LONG_BREAK" ? 0 : nextPomodoroCount

  return {
    phase: nextPhase,
    secondsLeft: getPhaseSeconds(nextPhase, DEFAULT_CONFIG),
    pomodoroCount: finalPomodoroCount,
    status: "IDLE",
  }
}

export const useTimerStore = create<TimerStore>((set) => ({
  mode: "POMODORO",
  phase: "FOCUS",
  status: "IDLE",
  secondsLeft: 25 * 60,
  pomodoroCount: 0,
  activeTaskId: null,

  setMode: (mode) => set((state) => ({ ...state, mode })),
  setStatus: (status) => set((state) => ({ ...state, status })),
  setSecondsLeft: (secondsLeft) => set((state) => ({ ...state, secondsLeft })),
  nextPhase: () => set((state) => ({ ...state, ...computeNextPhase(state) })),
  reset: () =>
    set((state) => ({
      ...state,
      status: "IDLE",
      secondsLeft: getInitialSeconds(state.mode, state.phase),
    })),
  setActiveTask: (taskId) => set((state) => ({ ...state, activeTaskId: taskId })),
}))
