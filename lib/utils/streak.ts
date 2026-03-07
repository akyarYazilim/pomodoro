import { daysBetween, isSameDay } from "./date"

interface UpdateStreakParams {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date | null
  today: Date
}

interface StreakResult {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
}

export function isStreakActive(lastActiveDate: Date | null, today: Date): boolean {
  if (!lastActiveDate) return false
  if (isSameDay(lastActiveDate, today)) return true
  return daysBetween(lastActiveDate, today) === 1
}

export function updateStreak(params: UpdateStreakParams): StreakResult {
  const { currentStreak, longestStreak, lastActiveDate, today } = params

  if (lastActiveDate && isSameDay(lastActiveDate, today)) {
    return { currentStreak, longestStreak, lastActiveDate: today }
  }

  const newStreak = isStreakActive(lastActiveDate, today) ? currentStreak + 1 : 1
  const newLongest = Math.max(longestStreak, newStreak)

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
  }
}

export function getStreakDays(streak: number): number {
  return Math.max(0, streak)
}
