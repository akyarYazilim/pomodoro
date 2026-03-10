// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useRoom } from "@/hooks/useRoom"

// Mock EventSource
class MockEventSource {
  url: string
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  readyState = 1

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    MockEventSource.closed.push(this.url)
  }

  static instances: MockEventSource[] = []
  static closed: string[] = []
  static reset() {
    MockEventSource.instances = []
    MockEventSource.closed = []
  }
}

const mockRoom = {
  id: "room1",
  code: "ABC123",
  name: "Test Oda",
  hostId: "user1",
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  members: [
    {
      id: "m1",
      userId: "user1",
      isWorking: false,
      joinedAt: new Date().toISOString(),
      user: { id: "user1", name: "Ali", image: null },
    },
  ],
}

describe("useRoom", () => {
  beforeEach(() => {
    MockEventSource.reset()
    Object.defineProperty(window, "EventSource", {
      writable: true,
      value: MockEventSource,
    })

    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const u = url.toString()
      if (u.endsWith("/api/rooms/ABC123/leaderboard")) {
        return { ok: true, json: async () => ({ entries: [] }) } as Response
      }
      if (u.endsWith("/api/rooms/ABC123")) {
        return { ok: true, json: async () => ({ room: mockRoom }) } as Response
      }
      if (u.endsWith("/api/rooms")) {
        return {
          ok: true,
          json: async () => ({ room: { ...mockRoom, code: "NEW123" } }),
          status: 201,
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("starts with null room and no loading when no code", () => {
    const { result } = renderHook(() => useRoom())
    expect(result.current.room).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it("fetches room data when code provided", async () => {
    const { result } = renderHook(() => useRoom("ABC123"))

    await waitFor(() => {
      expect(result.current.room).not.toBeNull()
    })

    expect(result.current.room?.code).toBe("ABC123")
    expect(result.current.room?.members).toHaveLength(1)
  })

  it("opens SSE stream when code provided", async () => {
    renderHook(() => useRoom("ABC123"))

    await waitFor(() => {
      expect(MockEventSource.instances.length).toBeGreaterThan(0)
    })

    expect(MockEventSource.instances[0].url).toContain("/api/rooms/ABC123/stream")
  })

  it("updates members on SSE message", async () => {
    const { result } = renderHook(() => useRoom("ABC123"))

    await waitFor(() => expect(result.current.room).not.toBeNull())

    const updatedMembers = [
      {
        id: "m1",
        userId: "user1",
        isWorking: true,
        joinedAt: new Date().toISOString(),
        user: { id: "user1", name: "Ali", image: null },
      },
    ]

    act(() => {
      const es = MockEventSource.instances[0]
      es.onmessage?.({
        data: JSON.stringify({ members: updatedMembers }),
      } as MessageEvent)
    })

    expect(result.current.room?.members[0].isWorking).toBe(true)
  })

  it("closes SSE on unmount", async () => {
    const { result, unmount } = renderHook(() => useRoom("ABC123"))

    await waitFor(() => expect(result.current.room).not.toBeNull())

    unmount()

    expect(MockEventSource.closed.length).toBeGreaterThan(0)
  })

  it("createRoom returns code on success", async () => {
    const { result } = renderHook(() => useRoom())

    let code: string | null = null
    await act(async () => {
      code = await result.current.createRoom("Test")
    })

    expect(code).toBe("NEW123")
  })

  it("joinRoom calls join endpoint and returns true on success", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (url.toString().includes("/join")) {
        return { ok: true, json: async () => ({ room: mockRoom }) } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    const { result } = renderHook(() => useRoom())

    let ok = false
    await act(async () => {
      ok = await result.current.joinRoom("ABC123")
    })

    expect(ok).toBe(true)
  })

  it("joinRoom returns false and sets error on failure", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (url.toString().includes("/join")) {
        return {
          ok: false,
          json: async () => ({ error: "Room not found" }),
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    const { result } = renderHook(() => useRoom())

    let ok = true
    await act(async () => {
      ok = await result.current.joinRoom("BADCOD")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBeTruthy()
  })

  it("sets error when room fetch fails", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const u = url.toString()
      if (u.endsWith("/api/rooms/BADRM")) {
        return { ok: false } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    const { result } = renderHook(() => useRoom("BADRM"))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toBe("Oda bulunamadı")
  })

  it("sets error on SSE error message", async () => {
    const { result } = renderHook(() => useRoom("ABC123"))
    await waitFor(() => expect(result.current.room).not.toBeNull())

    act(() => {
      const es = MockEventSource.instances[0]
      es.onmessage?.({
        data: JSON.stringify({ error: "Room expired" }),
      } as MessageEvent)
    })

    expect(result.current.error).toBe("Room expired")
  })

  it("handles malformed SSE message gracefully", async () => {
    const { result } = renderHook(() => useRoom("ABC123"))
    await waitFor(() => expect(result.current.room).not.toBeNull())

    act(() => {
      const es = MockEventSource.instances[0]
      es.onmessage?.({ data: "not valid json {{{" } as MessageEvent)
    })

    expect(result.current.room).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("ignores SSE message without members or error field", async () => {
    const { result } = renderHook(() => useRoom("ABC123"))
    await waitFor(() => expect(result.current.room).not.toBeNull())

    const prevMembersLength = result.current.room!.members.length

    act(() => {
      const es = MockEventSource.instances[0]
      es.onmessage?.({
        data: JSON.stringify({ someOtherField: "value" }),
      } as MessageEvent)
    })

    expect(result.current.room?.members).toHaveLength(prevMembersLength)
  })

  it("updateStatus does nothing when no code", async () => {
    const { result } = renderHook(() => useRoom())
    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => {
      await result.current.updateStatus(true)
    })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("createRoom returns null and sets error on failure", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: false } as Response
    })

    const { result } = renderHook(() => useRoom())

    let code: string | null = "initial"
    await act(async () => {
      code = await result.current.createRoom("Test")
    })

    expect(code).toBeNull()
    expect(result.current.error).toBeTruthy()
  })

  it("continues when leaderboard fetch fails", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const u = url.toString()
      if (u.endsWith("/leaderboard")) {
        return { ok: false } as Response
      }
      if (u.endsWith("/api/rooms/ABC123")) {
        return { ok: true, json: async () => ({ room: mockRoom }) } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    const { result } = renderHook(() => useRoom("ABC123"))

    await waitFor(() => expect(result.current.room).not.toBeNull())

    expect(result.current.leaderboard).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })
})
