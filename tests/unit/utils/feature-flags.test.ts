import { describe, it, expect } from "vitest"
import { isPro } from "@/lib/utils/feature-flags"

describe("isPro", () => {
  it("free plan → false", () => {
    expect(isPro({ plan: "free" })).toBe(false)
  })

  it("null plan → false", () => {
    expect(isPro({ plan: null })).toBe(false)
  })

  it("undefined plan → false", () => {
    expect(isPro({})).toBe(false)
  })

  it("pro plan without expiry → true", () => {
    expect(isPro({ plan: "pro" })).toBe(true)
  })

  it("pro plan with future expiry → true", () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(isPro({ plan: "pro", planExpiresAt: future })).toBe(true)
  })

  it("pro plan with past expiry → false", () => {
    const past = new Date()
    past.setFullYear(past.getFullYear() - 1)
    expect(isPro({ plan: "pro", planExpiresAt: past })).toBe(false)
  })

  it("lifetime plan → true (never expires)", () => {
    expect(isPro({ plan: "lifetime" })).toBe(true)
  })

  it("lifetime plan with past date → still true", () => {
    const past = new Date()
    past.setFullYear(past.getFullYear() - 5)
    expect(isPro({ plan: "lifetime", planExpiresAt: past })).toBe(true)
  })
})
