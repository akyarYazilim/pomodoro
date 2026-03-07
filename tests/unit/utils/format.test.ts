import { describe, it, expect } from "vitest"
import { formatSeconds, formatMinutes, formatDuration } from "@/lib/utils/format"

describe("Format Utils", () => {
  describe("formatSeconds", () => {
    it("0 saniye → '00:00'", () => {
      expect(formatSeconds(0)).toBe("00:00")
    })

    it("25 dakika → '25:00'", () => {
      expect(formatSeconds(25 * 60)).toBe("25:00")
    })

    it("90 saniye → '01:30'", () => {
      expect(formatSeconds(90)).toBe("01:30")
    })

    it("3661 saniye → '61:01' (60+ dakika)", () => {
      expect(formatSeconds(3661)).toBe("61:01")
    })

    it("tek haneli değerleri sıfır ile pad eder", () => {
      expect(formatSeconds(65)).toBe("01:05")
    })
  })

  describe("formatMinutes", () => {
    it("30 dakika → '30 dk'", () => {
      expect(formatMinutes(30)).toBe("30 dk")
    })

    it("60 dakika → '1s'", () => {
      expect(formatMinutes(60)).toBe("1s")
    })

    it("90 dakika → '1s 30dk'", () => {
      expect(formatMinutes(90)).toBe("1s 30dk")
    })

    it("0 dakika → '0 dk'", () => {
      expect(formatMinutes(0)).toBe("0 dk")
    })
  })

  describe("formatDuration", () => {
    it("kısa süre saniye cinsinden gösterir", () => {
      expect(formatDuration(45)).toBe("45 saniye")
    })

    it("1 dakika ve üzeri dakika cinsinden gösterir", () => {
      expect(formatDuration(120)).toBe("2 dakika")
    })

    it("60+ dakika saat ve dakika gösterir", () => {
      expect(formatDuration(3900)).toBe("1s 5dk")
    })
  })
})
