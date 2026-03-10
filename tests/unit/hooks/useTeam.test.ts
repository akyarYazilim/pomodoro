// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useTeam } from "@/hooks/useTeam"

const mockTeam = {
  id: "team1",
  name: "Test Takımı",
  ownerId: "user1",
  members: [
    {
      userId: "user1",
      role: "OWNER",
      user: { id: "user1", name: "Ali", image: null },
    },
  ],
  invites: [],
}

const mockStats = {
  entries: [
    {
      userId: "user1",
      name: "Ali",
      image: null,
      role: "OWNER",
      thisWeekMinutes: 120,
      prevWeekMinutes: 90,
      tasksCompleted: 3,
    },
  ],
  totalMinutes: 120,
  totalTasks: 3,
}

describe("useTeam", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const u = url.toString()
      if (u.endsWith("/api/teams") && !u.includes("invite")) {
        return { ok: true, json: async () => ({ team: mockTeam, role: "OWNER" }) } as Response
      }
      if (u.includes("/stats")) {
        return { ok: true, json: async () => mockStats } as Response
      }
      if (u.includes("/invite")) {
        return {
          ok: true,
          json: async () => ({ invite: { id: "inv1", email: "test@test.com", createdAt: new Date().toISOString() } }),
          status: 201,
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("fetches team and stats on mount", async () => {
    const { result } = renderHook(() => useTeam())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.team?.name).toBe("Test Takımı")
    expect(result.current.role).toBe("OWNER")
    expect(result.current.stats).toHaveLength(1)
    expect(result.current.totalMinutes).toBe(120)
    expect(result.current.totalTasks).toBe(3)
  })

  it("starts loading true then false", async () => {
    const { result } = renderHook(() => useTeam())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it("sets team null when no team found", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.team).toBeNull()
    expect(result.current.role).toBeNull()
  })

  it("sets error when team fetch fails", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: false } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeTruthy()
  })

  it("createTeam returns true and sets team on success", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST" && url.toString().endsWith("/api/teams")) {
        return {
          ok: true,
          json: async () => ({ team: mockTeam }),
          status: 201,
        } as Response
      }
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = false
    await act(async () => {
      ok = await result.current.createTeam("Test Takımı")
    })

    expect(ok).toBe(true)
    expect(result.current.team?.name).toBe("Test Takımı")
    expect(result.current.role).toBe("OWNER")
  })

  it("createTeam returns false and sets error on failure", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        return { ok: false, json: async () => ({ error: "Takım oluşturulamadı" }) } as Response
      }
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = true
    await act(async () => {
      ok = await result.current.createTeam("Test")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBeTruthy()
  })

  it("inviteMember returns true on success and appends invite", async () => {
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    let ok = false
    await act(async () => {
      ok = await result.current.inviteMember("new@example.com")
    })

    expect(ok).toBe(true)
    expect(result.current.team?.invites).toHaveLength(1)
  })

  it("inviteMember returns false when no team", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = true
    await act(async () => {
      ok = await result.current.inviteMember("test@test.com")
    })

    expect(ok).toBe(false)
  })

  it("inviteMember returns false and sets error on API failure", async () => {
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: false, json: async () => ({ error: "Bu kullanıcı zaten üye" }) } as Response
    })

    let ok = true
    await act(async () => {
      ok = await result.current.inviteMember("existing@test.com")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBeTruthy()
  })

  it("refreshStats calls stats API again", async () => {
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => {
      await result.current.refreshStats()
    })

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/stats"))
  })

  it("refreshStats does nothing when no team", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => {
      await result.current.refreshStats()
    })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("continues when stats fetch fails", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const u = url.toString()
      if (u.includes("/stats")) {
        return { ok: false } as Response
      }
      return { ok: true, json: async () => ({ team: mockTeam, role: "OWNER" }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.team).not.toBeNull()
    expect(result.current.stats).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })
})
