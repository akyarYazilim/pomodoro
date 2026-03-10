import { describe, it, expect } from "vitest"
import { isStreakActive } from "@/lib/utils/streak"

// Freeze mantığını test etmek için yardımcı fonksiyon
// (API route'daki freeze mantığını pure function olarak tekrar tanımlıyoruz)
function applyFreeze(params: {
  currentStreak: number
  lastActiveDate: Date | null
  streakFreezeCount: number
  today: Date
}): { usedFreeze: boolean; newFreezeCount: number; newLastActiveDate: Date | null } {
  const { currentStreak, lastActiveDate, streakFreezeCount, today } = params
  const active = isStreakActive(lastActiveDate, today)
  const alreadyToday = lastActiveDate && lastActiveDate.toDateString() === today.toDateString()

  if (!active && !alreadyToday && currentStreak > 0 && streakFreezeCount > 0) {
    return {
      usedFreeze: true,
      newFreezeCount: streakFreezeCount - 1,
      newLastActiveDate: today,
    }
  }
  return { usedFreeze: false, newFreezeCount: streakFreezeCount, newLastActiveDate: lastActiveDate }
}

describe("Streak Freeze Mantığı", () => {
  const today = new Date("2026-03-07")
  const twoDaysAgo = new Date("2026-03-05")
  const yesterday = new Date("2026-03-06")

  it("streak kırılacaksa ve freeze varsa kullanılır", () => {
    const result = applyFreeze({
      currentStreak: 5,
      lastActiveDate: twoDaysAgo,
      streakFreezeCount: 1,
      today,
    })
    expect(result.usedFreeze).toBe(true)
    expect(result.newFreezeCount).toBe(0)
    expect(result.newLastActiveDate).toEqual(today)
  })

  it("streak kırılacaksa ama freeze yoksa kullanılmaz", () => {
    const result = applyFreeze({
      currentStreak: 5,
      lastActiveDate: twoDaysAgo,
      streakFreezeCount: 0,
      today,
    })
    expect(result.usedFreeze).toBe(false)
    expect(result.newFreezeCount).toBe(0)
  })

  it("streak aktifse freeze kullanılmaz", () => {
    const result = applyFreeze({
      currentStreak: 5,
      lastActiveDate: yesterday,
      streakFreezeCount: 1,
      today,
    })
    expect(result.usedFreeze).toBe(false)
    expect(result.newFreezeCount).toBe(1)
  })

  it("streak sıfırsa (yeni kullanıcı) freeze kullanılmaz", () => {
    const result = applyFreeze({
      currentStreak: 0,
      lastActiveDate: null,
      streakFreezeCount: 1,
      today,
    })
    expect(result.usedFreeze).toBe(false)
  })

  it("bugün zaten oturum tamamlandıysa freeze kullanılmaz", () => {
    const result = applyFreeze({
      currentStreak: 5,
      lastActiveDate: today,
      streakFreezeCount: 1,
      today,
    })
    expect(result.usedFreeze).toBe(false)
  })
})

describe("Freeze Yenileme", () => {
  const FREEZE_REGEN_DAYS = 7

  function shouldRegenFreeze(lastUsed: Date | null, today: Date): boolean {
    if (!lastUsed) return false
    const daysSince = Math.floor((today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= FREEZE_REGEN_DAYS
  }

  it("7 gün sonra yenileme tetiklenir", () => {
    const lastUsed = new Date("2026-03-01")
    const today = new Date("2026-03-08")
    expect(shouldRegenFreeze(lastUsed, today)).toBe(true)
  })

  it("6 gün sonra yenileme tetiklenmez", () => {
    const lastUsed = new Date("2026-03-01")
    const today = new Date("2026-03-07")
    expect(shouldRegenFreeze(lastUsed, today)).toBe(false)
  })

  it("lastUsed null ise yenileme tetiklenmez", () => {
    const today = new Date("2026-03-07")
    expect(shouldRegenFreeze(null, today)).toBe(false)
  })
})
