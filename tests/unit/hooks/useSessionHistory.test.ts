// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useSessionHistory } from "@/hooks/useSessionHistory"

const mockSessions = [
  { id: "s1", mode: "POMODORO", actualMinutes: 25, startedAt: "2026-03-10T10:00:00Z", task: null },
  { id: "s2", mode: "FLOWTIME", actualMinutes: 40, startedAt: "2026-03-10T11:00:00Z", task: { title: "Proje" } },
]

function mockFetch(data: unknown, ok = true) {
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

describe("useSessionHistory", () => {
  it("starts with loading=true and empty sessions", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useSessionHistory())
    expect(result.current.loading).toBe(true)
    expect(result.current.sessions).toEqual([])
  })

  it("fetches and sets sessions", async () => {
    mockFetch(mockSessions)
    const { result } = renderHook(() => useSessionHistory())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.sessions).toHaveLength(2)
    expect(result.current.sessions[0].id).toBe("s1")
  })

  it("returns empty array on non-array response", async () => {
    mockFetch({ error: "something" })
    const { result } = renderHook(() => useSessionHistory())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.sessions).toEqual([])
  })

  it("logs error and keeps empty on non-ok response", async () => {
    mockFetch([], false)
    const { result } = renderHook(() => useSessionHistory())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.sessions).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it("aborts fetch on unmount", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const abortSpy = vi.spyOn(AbortController.prototype, "abort")

    const { unmount } = renderHook(() => useSessionHistory())
    unmount()

    expect(abortSpy).toHaveBeenCalled()
  })
})
