import type { FlowtimeState } from "@/types/timer"
import { calculateBreakMinutes } from "./break-calculator"

export function createFlowtimeState(): FlowtimeState {
  return {
    mode: "FLOWTIME",
    status: "IDLE",
    elapsedSeconds: 0,
    pausedSeconds: 0,
    startedAt: null,
    suggestedBreakMinutes: 0,
  }
}

export function startFocus(state: FlowtimeState): FlowtimeState {
  return {
    ...state,
    status: "RUNNING",
    startedAt: Date.now(),
  }
}

export function pauseFocus(state: FlowtimeState): FlowtimeState {
  return {
    ...state,
    status: "PAUSED",
  }
}

export function resumeFocus(state: FlowtimeState): FlowtimeState {
  return {
    ...state,
    status: "RUNNING",
  }
}

export function addElapsed(state: FlowtimeState, seconds: number): FlowtimeState {
  return {
    ...state,
    elapsedSeconds: state.elapsedSeconds + seconds,
  }
}

export function endFocus(state: FlowtimeState): FlowtimeState {
  const focusMinutes = Math.floor(state.elapsedSeconds / 60)
  const suggestedBreakMinutes = calculateBreakMinutes(focusMinutes)

  return {
    ...state,
    status: "COMPLETED",
    suggestedBreakMinutes,
  }
}
