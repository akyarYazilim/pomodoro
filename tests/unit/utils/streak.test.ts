import { describe, it, expect } from "vitest"
import { isStreakActive, updateStreak, getStreakDays } from "@/lib/utils/streak"

describe("Streak Utils", () => {
  const today = new Date("2026-03-07")
  const yesterday = new Date("2026-03-06")
  const twoDaysAgo = new Date("2026-03-05")

  describe("isStreakActive", () => {
    it("bugün aktif edilmişse streak devam eder", () => {
      expect(isStreakActive(today, today)).toBe(true)
    })

    it("dün aktif edilmişse streak devam eder", () => {
      expect(isStreakActive(yesterday, today)).toBe(true)
    })

    it("2 gün önce aktif edilmişse streak kırılır", () => {
      expect(isStreakActive(twoDaysAgo, today)).toBe(false)
    })

    it("lastActiveDate null ise streak aktif değil", () => {
      expect(isStreakActive(null, today)).toBe(false)
    })
  })

  describe("updateStreak", () => {
    it("bugün ilk kez oturum tamamlanınca streak 1 olur", () => {
      const result = updateStreak({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        today,
      })
      expect(result.currentStreak).toBe(1)
    })

    it("dünden gelen streak bugün de tamamlanınca artar", () => {
      const result = updateStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: yesterday,
        today,
      })
      expect(result.currentStreak).toBe(6)
    })

    it("bugün zaten sayılmışsa streak değişmez", () => {
      const result = updateStreak({
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: today,
        today,
      })
      expect(result.currentStreak).toBe(3)
    })

    it("streak kırılınca 1'den yeniden başlar", () => {
      const result = updateStreak({
        currentStreak: 10,
        longestStreak: 10,
        lastActiveDate: twoDaysAgo,
        today,
      })
      expect(result.currentStreak).toBe(1)
    })

    it("longest streak güncellenir", () => {
      const result = updateStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: yesterday,
        today,
      })
      expect(result.longestStreak).toBe(6)
    })

    it("longest streak küçülmez", () => {
      const result = updateStreak({
        currentStreak: 10,
        longestStreak: 20,
        lastActiveDate: twoDaysAgo,
        today,
      })
      expect(result.longestStreak).toBe(20)
    })

    it("lastActiveDate güncellenir", () => {
      const result = updateStreak({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        today,
      })
      expect(result.lastActiveDate).toEqual(today)
    })
  })

  describe("getStreakDays", () => {
    it("7 günlük streak için 7 döner", () => {
      expect(getStreakDays(7)).toBe(7)
    })

    it("negatif streak 0 döner", () => {
      expect(getStreakDays(-1)).toBe(0)
    })
  })
})
