// @vitest-environment jsdom
import { vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useTeam } from "@/hooks/useTeam"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

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

/** Build a fetch mock that returns a team + stats on initial GET calls. */
function mockInitialFetch() {
  vi.spyOn(global, "fetch").mockImplementation(async (url) => {
    const u = url.toString()
    if (u.includes("/stats")) {
      return { ok: true, json: async () => mockStats } as Response
    }
    // Default /api/teams GET
    return {
      ok: true,
      json: async () => ({ team: mockTeam, role: "OWNER" }),
    } as Response
  })
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// createTeam — error paths (lines 98-105)
// ---------------------------------------------------------------------------

describe("useTeam — createTeam error paths", () => {
  it("returns false and sets error when API responds with non-ok status and error body", async () => {
    // Initial load returns no team so the hook finishes loading
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        return {
          ok: false,
          status: 422,
          json: async () => ({ error: "Bu isim zaten kullanımda" }),
        } as Response
      }
      return {
        ok: true,
        json: async () => ({ team: null }),
      } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = true
    await act(async () => {
      ok = await result.current.createTeam("Mevcut Takım")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe("Bu isim zaten kullanımda")
  })

  it("uses fallback error message when response body has no error field", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        return {
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response
      }
      return {
        ok: true,
        json: async () => ({ team: null }),
      } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = true
    await act(async () => {
      ok = await result.current.createTeam("Test")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe("Takım oluşturulamadı")
  })

  it("returns false and sets generic error when response json() throws", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        return {
          ok: false,
          status: 503,
          // json() rejects — simulates malformed response
          json: async () => { throw new Error("not json") },
        } as unknown as Response
      }
      return {
        ok: true,
        json: async () => ({ team: null }),
      } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok = true
    await act(async () => {
      ok = await result.current.createTeam("Broken")
    })

    expect(ok).toBe(false)
    // Falls back to "Takım oluşturulamadı" because json() threw
    expect(result.current.error).toBe("Takım oluşturulamadı")
  })

  it("clears a previous error before retrying createTeam", async () => {
    let callCount = 0
    vi.spyOn(global, "fetch").mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        callCount++
        if (callCount === 1) {
          return {
            ok: false,
            status: 422,
            json: async () => ({ error: "İlk hata" }),
          } as Response
        }
        return {
          ok: true,
          json: async () => ({ team: mockTeam }),
        } as Response
      }
      return {
        ok: true,
        json: async () => ({ team: null }),
      } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // First call — should fail
    await act(async () => {
      await result.current.createTeam("Broken")
    })
    expect(result.current.error).toBe("İlk hata")

    // Second call — should succeed and clear the error
    await act(async () => {
      await result.current.createTeam("Geçerli İsim")
    })
    expect(result.current.error).toBeNull()
    expect(result.current.team?.name).toBe("Test Takımı")
  })
})

// ---------------------------------------------------------------------------
// inviteMember — error paths (lines 124-132)
// ---------------------------------------------------------------------------

describe("useTeam — inviteMember error paths", () => {
  it("returns false immediately when team is null (no API call)", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return { ok: true, json: async () => ({ team: null }) } as Response
    })

    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    let ok = true
    await act(async () => {
      ok = await result.current.inviteMember("someone@test.com")
    })

    expect(ok).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("returns false and sets error when invite API responds non-ok with error body", async () => {
    mockInitialFetch()
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    // Override fetch for the invite call only
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: false,
        status: 409,
        json: async () => ({ error: "Bu kullanıcı zaten üye" }),
      } as Response
    })

    let ok = true
    await act(async () => {
      ok = await result.current.inviteMember("existing@example.com")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe("Bu kullanıcı zaten üye")
  })

  it("uses fallback error message when invite response body has no error field", async () => {
    mockInitialFetch()
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response
    })

    await act(async () => {
      await result.current.inviteMember("someone@example.com")
    })

    expect(result.current.error).toBe("Davet gönderilemedi")
  })

  it("returns false when invite response json() throws", async () => {
    mockInitialFetch()
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: false,
        status: 503,
        json: async () => { throw new Error("not json") },
      } as unknown as Response
    })

    let ok = true
    await act(async () => {
      ok = await result.current.inviteMember("bad@example.com")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe("Davet gönderilemedi")
  })

  it("appends new invite to team invites list on success", async () => {
    mockInitialFetch()
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    const newInvite = { id: "inv-99", email: "new@example.com", createdAt: new Date().toISOString() }
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({ invite: newInvite }),
      } as Response
    })

    let ok = false
    await act(async () => {
      ok = await result.current.inviteMember("new@example.com")
    })

    expect(ok).toBe(true)
    expect(result.current.team?.invites).toHaveLength(1)
    expect(result.current.team?.invites[0].email).toBe("new@example.com")
  })

  it("clears a previous error before retrying inviteMember", async () => {
    mockInitialFetch()
    const { result } = renderHook(() => useTeam())
    await waitFor(() => expect(result.current.team).not.toBeNull())

    let callCount = 0
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++
      if (callCount === 1) {
        return {
          ok: false,
          json: async () => ({ error: "Başarısız" }),
        } as Response
      }
      return {
        ok: true,
        json: async () => ({ invite: { id: "inv-1", email: "ok@example.com", createdAt: new Date().toISOString() } }),
      } as Response
    })

    await act(async () => {
      await result.current.inviteMember("fail@example.com")
    })
    expect(result.current.error).toBe("Başarısız")

    await act(async () => {
      await result.current.inviteMember("ok@example.com")
    })
    expect(result.current.error).toBeNull()
  })
})
