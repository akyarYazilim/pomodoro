// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useStats } from "@/hooks/useStats"

const mockDaily = { totalMinutes: 90, sessionCount: 3 }
const mockWeekly = {
  days: [
    { date: "2026-03-04", minutes: 50 },
    { date: "2026-03-05", minutes: 30 },
  ],
}

function mockFetch(dailyRes: object, weeklyRes: object, ok = true) {
  let callCount = 0
  global.fetch = vi.fn().mockImplementation((url: string) => {
    callCount++
    const data = url.includes("weekly") ? weeklyRes : dailyRes
    return Promise.resolve({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(data),
    })
  })
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useStats", () => {
  it("starts with loading=true and empty state", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStats())
    expect(result.current.loading).toBe(true)
    expect(result.current.daily).toBeNull()
    expect(result.current.weekly).toEqual([])
  })

  it("fetches and sets daily + weekly data", async () => {
    mockFetch(mockDaily, mockWeekly)
    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.daily).toEqual(mockDaily)
    expect(result.current.weekly).toEqual(mockWeekly.days)
  })

  it("sets weekly to [] when days is missing from response", async () => {
    mockFetch(mockDaily, {})
    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.weekly).toEqual([])
  })

  it("logs error and sets loading=false on non-ok response", async () => {
    mockFetch(mockDaily, mockWeekly, false)
    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.daily).toBeNull()
    expect(console.error).toHaveBeenCalled()
  })

  it("aborts fetch on unmount", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const abortSpy = vi.spyOn(AbortController.prototype, "abort")

    const { unmount } = renderHook(() => useStats())
    unmount()

    expect(abortSpy).toHaveBeenCalled()
  })
})
