import { describe, it, expect } from "vitest"
import { daysBetween, isToday, isYesterday, startOfDay, isSameDay } from "@/lib/utils/date"

describe("Date Utils", () => {
  describe("daysBetween", () => {
    it("aynı gün → 0", () => {
      const d = new Date("2026-03-07")
      expect(daysBetween(d, d)).toBe(0)
    })

    it("1 gün fark → 1", () => {
      const a = new Date("2026-03-06")
      const b = new Date("2026-03-07")
      expect(daysBetween(a, b)).toBe(1)
    })

    it("7 gün fark → 7", () => {
      const a = new Date("2026-03-01")
      const b = new Date("2026-03-08")
      expect(daysBetween(a, b)).toBe(7)
    })

    it("negatif fark için mutlak değer döner", () => {
      const a = new Date("2026-03-07")
      const b = new Date("2026-03-06")
      expect(daysBetween(a, b)).toBe(1)
    })
  })

  describe("isToday", () => {
    it("bugünün tarihi → true", () => {
      const now = new Date()
      expect(isToday(now)).toBe(true)
    })

    it("dünün tarihi → false", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe("isYesterday", () => {
    it("dünün tarihi → true", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isYesterday(yesterday)).toBe(true)
    })

    it("bugünün tarihi → false", () => {
      expect(isYesterday(new Date())).toBe(false)
    })
  })

  describe("startOfDay", () => {
    it("gün başlangıcını döner (00:00:00)", () => {
      const date = new Date("2026-03-07T14:30:00")
      const result = startOfDay(date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it("orijinal tarihi mutate etmez", () => {
      const date = new Date("2026-03-07T14:30:00")
      const original = date.getHours()
      startOfDay(date)
      expect(date.getHours()).toBe(original)
    })
  })

  describe("isSameDay", () => {
    it("aynı günse true", () => {
      const a = new Date("2026-03-07T08:00:00")
      const b = new Date("2026-03-07T22:00:00")
      expect(isSameDay(a, b)).toBe(true)
    })

    it("farklı günse false", () => {
      const a = new Date("2026-03-07")
      const b = new Date("2026-03-08")
      expect(isSameDay(a, b)).toBe(false)
    })
  })
})
