const MIN_BREAK_MINUTES = 5
const MAX_BREAK_MINUTES = 30
const BREAK_RATIO = 1 / 5

export function calculateBreakMinutes(focusMinutes: number): number {
  const calculated = Math.round(focusMinutes * BREAK_RATIO)
  return Math.min(MAX_BREAK_MINUTES, Math.max(MIN_BREAK_MINUTES, calculated))
}
