// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useStreak } from "@/hooks/useStreak"

const mockStreak = { currentStreak: 5, longestStreak: 12, streakFreezeCount: 1 }

function mockFetch(data: object, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useStreak", () => {
  it("starts with loading=true and null streak", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStreak())
    expect(result.current.loading).toBe(true)
    expect(result.current.streak).toBeNull()
  })

  it("fetches and sets streak data", async () => {
    mockFetch(mockStreak)
    const { result } = renderHook(() => useStreak())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.streak).toEqual(mockStreak)
  })

  it("logs error and keeps streak null on non-ok response", async () => {
    mockFetch(mockStreak, false)
    const { result } = renderHook(() => useStreak())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.streak).toBeNull()
    expect(console.error).toHaveBeenCalled()
  })

  it("aborts fetch on unmount", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const abortSpy = vi.spyOn(AbortController.prototype, "abort")

    const { unmount } = renderHook(() => useStreak())
    unmount()

    expect(abortSpy).toHaveBeenCalled()
  })

})
