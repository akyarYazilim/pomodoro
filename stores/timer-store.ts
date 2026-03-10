import { create } from "zustand"
import type { TimerMode, TimerPhase, TimerStatus, TimerState, PomodoroConfig } from "@/types/timer"
import { getNextPhase, getPhaseSeconds } from "@/lib/timer/pomodoro"

interface UserTimerConfig {
  pomodoroMinutes?: number
  shortBreakMinutes?: number
  longBreakMinutes?: number
  defaultTimerMode?: string
}

interface TimerStore extends TimerState {
  config: Required<PomodoroConfig>
  initialized: boolean
  deepFocusMode: boolean
  setMode: (mode: TimerMode) => void
  setStatus: (status: TimerStatus) => void
  setSecondsLeft: (seconds: number) => void
  nextPhase: () => void
  reset: () => void
  setActiveTask: (taskId: string | null) => void
  setDeepFocusMode: (v: boolean) => void
  initFromSession: (userConfig: UserTimerConfig, force?: boolean) => void
}

const DEFAULT_CONFIG: Required<PomodoroConfig> = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

function getInitialSeconds(mode: TimerMode, phase: TimerPhase, config: Required<PomodoroConfig>): number {
  if (mode === "FLOWTIME") return 0
  return getPhaseSeconds(phase, config)
}

function computeNextPhase(state: TimerState, config: Required<PomodoroConfig>): Partial<TimerState> {
  const pomodoroState = {
    mode: "POMODORO" as const,
    phase: state.phase,
    status: state.status,
    secondsLeft: state.secondsLeft,
    pomodoroCount: state.pomodoroCount,
    completed: false,
  }

  const nextPhase = getNextPhase(pomodoroState, config)
  const nextPomodoroCount =
    state.phase === "FOCUS" ? state.pomodoroCount + 1 : state.pomodoroCount
  const finalPomodoroCount =
    nextPhase === "FOCUS" && state.phase === "LONG_BREAK" ? 0 : nextPomodoroCount

  return {
    phase: nextPhase,
    secondsLeft: getPhaseSeconds(nextPhase, config),
    pomodoroCount: finalPomodoroCount,
    status: "IDLE",
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: "POMODORO",
  phase: "FOCUS",
  status: "IDLE",
  secondsLeft: 25 * 60,
  pomodoroCount: 0,
  activeTaskId: null,
  config: DEFAULT_CONFIG,
  initialized: false,
  deepFocusMode: false,

  setMode: (mode) => set((state) => ({ ...state, mode })),
  setStatus: (status) => set((state) => ({ ...state, status })),
  setSecondsLeft: (secondsLeft) => set((state) => ({ ...state, secondsLeft })),
  nextPhase: () => set((state) => ({ ...state, ...computeNextPhase(state, get().config) })),
  setDeepFocusMode: (v) => set((state) => ({ ...state, deepFocusMode: v })),
  reset: () =>
    set((state) => ({
      ...state,
      status: "IDLE",
      secondsLeft: getInitialSeconds(state.mode, state.phase, get().config),
    })),
  setActiveTask: (taskId) => set((state) => ({ ...state, activeTaskId: taskId })),
  initFromSession: (userConfig: UserTimerConfig, force = false) =>
    set((state) => {
      if (state.initialized && !force) return state
      const newConfig: Required<PomodoroConfig> = {
        pomodoroMinutes: userConfig.pomodoroMinutes ?? DEFAULT_CONFIG.pomodoroMinutes,
        shortBreakMinutes: userConfig.shortBreakMinutes ?? DEFAULT_CONFIG.shortBreakMinutes,
        longBreakMinutes: userConfig.longBreakMinutes ?? DEFAULT_CONFIG.longBreakMinutes,
        longBreakInterval: DEFAULT_CONFIG.longBreakInterval,
      }
      const newMode = (userConfig.defaultTimerMode as TimerMode | undefined) ?? state.mode
      return {
        ...state,
        config: newConfig,
        mode: newMode,
        secondsLeft: newMode === "FLOWTIME" ? 0 : getPhaseSeconds(state.phase, newConfig),
        initialized: true,
      }
    }),
}))
