import { describe, it, expect } from "vitest"
import { calculateBreakMinutes } from "@/lib/timer/break-calculator"

describe("Break Calculator (Flowtime)", () => {
  it("20 dakika odaklanma → 4 dakika mola (1/5 oranı, minimum 5)", () => {
    expect(calculateBreakMinutes(20)).toBe(5)
  })

  it("25 dakika → 5 dakika mola", () => {
    expect(calculateBreakMinutes(25)).toBe(5)
  })

  it("50 dakika → 10 dakika mola", () => {
    expect(calculateBreakMinutes(50)).toBe(10)
  })

  it("minimum 5 dakika mola", () => {
    expect(calculateBreakMinutes(10)).toBe(5)
  })

  it("maksimum 30 dakika mola", () => {
    expect(calculateBreakMinutes(200)).toBe(30)
  })

  it("150 dakika → 30 dakika mola (maksimum)", () => {
    expect(calculateBreakMinutes(150)).toBe(30)
  })

  it("0 dakika → minimum 5 dakika mola", () => {
    expect(calculateBreakMinutes(0)).toBe(5)
  })
})
