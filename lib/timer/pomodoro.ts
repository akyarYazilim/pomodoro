import type { PomodoroState, PomodoroConfig, TimerPhase } from "@/types/timer"

const DEFAULT_CONFIG: Required<PomodoroConfig> = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

export function createPomodoroState(config: PomodoroConfig = {}): PomodoroState {
  const { pomodoroMinutes } = { ...DEFAULT_CONFIG, ...config }
  return {
    mode: "POMODORO",
    phase: "FOCUS",
    status: "IDLE",
    secondsLeft: pomodoroMinutes * 60,
    pomodoroCount: 0,
    completed: false,
  }
}

export function tick(state: PomodoroState): PomodoroState {
  if (state.secondsLeft <= 0) {
    return { ...state, secondsLeft: 0, completed: true }
  }
  if (state.secondsLeft === 1) {
    return { ...state, secondsLeft: 0, completed: true }
  }
  return { ...state, secondsLeft: state.secondsLeft - 1 }
}

export function getNextPhase(state: PomodoroState, config: PomodoroConfig = {}): TimerPhase {
  const { longBreakInterval } = { ...DEFAULT_CONFIG, ...config }

  if (state.phase === "FOCUS") {
    if (state.pomodoroCount + 1 >= longBreakInterval) {
      return "LONG_BREAK"
    }
    return "SHORT_BREAK"
  }

  return "FOCUS"
}

export function advancePhase(state: PomodoroState, config: PomodoroConfig = {}): PomodoroState {
  const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes } = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const nextPhase = getNextPhase(state, config)

  const secondsMap: Record<TimerPhase, number> = {
    FOCUS: pomodoroMinutes * 60,
    SHORT_BREAK: shortBreakMinutes * 60,
    LONG_BREAK: longBreakMinutes * 60,
  }

  const nextPomodoroCount =
    state.phase === "FOCUS" ? state.pomodoroCount + 1 : state.pomodoroCount
  const finalPomodoroCount = nextPhase === "FOCUS" && state.phase === "LONG_BREAK" ? 0 : nextPomodoroCount

  return {
    ...state,
    phase: nextPhase,
    secondsLeft: secondsMap[nextPhase],
    pomodoroCount: finalPomodoroCount,
    completed: false,
    status: "IDLE",
  }
}

export function isBreakPhase(phase: TimerPhase): boolean {
  return phase === "SHORT_BREAK" || phase === "LONG_BREAK"
}

export function getPhaseSeconds(phase: TimerPhase, config: PomodoroConfig = {}): number {
  const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes } = {
    ...DEFAULT_CONFIG,
    ...config,
  }
  const map: Record<TimerPhase, number> = {
    FOCUS: pomodoroMinutes * 60,
    SHORT_BREAK: shortBreakMinutes * 60,
    LONG_BREAK: longBreakMinutes * 60,
  }
  return map[phase]
}
