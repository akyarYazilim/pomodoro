export type TimerMode = "POMODORO" | "FLOWTIME"
export type TimerPhase = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"
export type TimerStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED"

export interface PomodoroConfig {
  pomodoroMinutes?: number
  shortBreakMinutes?: number
  longBreakMinutes?: number
  longBreakInterval?: number
}

export interface PomodoroState {
  mode: "POMODORO"
  phase: TimerPhase
  status: TimerStatus
  secondsLeft: number
  pomodoroCount: number
  completed: boolean
}

export interface FlowtimeState {
  mode: "FLOWTIME"
  status: TimerStatus
  elapsedSeconds: number
  pausedSeconds: number
  startedAt: number | null
  suggestedBreakMinutes: number
}

export interface TimerState {
  mode: TimerMode
  phase: TimerPhase
  status: TimerStatus
  secondsLeft: number
  pomodoroCount: number
  activeTaskId: string | null
}
