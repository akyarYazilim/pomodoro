import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock cagrilari hoist edilir — factory icinde dis scope degiskenlerine erisim OLMAZ.
// Bu nedenle mocklar modul seviyesinde tanimlanip vi.mocked() ile alinir.

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/client", () => ({
  prisma: {
    focusSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

// Mock referanslari import'lardan sonra alinir
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { GET, POST } from "@/app/api/sessions/route"
import { PATCH } from "@/app/api/sessions/[id]/route"

const mockAuth = vi.mocked(auth)
const mockSession = vi.mocked(prisma.focusSession)
const mockUser = vi.mocked(prisma.user)

// ─────────────────────────────────────────────────────────────
// Test yardimcilari
// ─────────────────────────────────────────────────────────────

const AUTHENTICATED_SESSION = {
  user: { id: "user-abc", email: "test@example.com", name: "Test Kullanicisi" },
}

const SESSION_FIXTURE = {
  id: "session-1",
  userId: "user-abc",
  mode: "POMODORO",
  status: "ACTIVE",
  taskId: null,
  plannedMinutes: 25,
  actualMinutes: 0,
  breakMinutes: 0,
  note: null,
  mood: null,
  startedAt: new Date("2026-01-01T10:00:00Z"),
  endedAt: null,
}

function makeRequest(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Request {
  const { method = "GET", body } = options
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { "Content-Type": "application/json" }
  }
  return new Request(url, init)
}

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

// ─────────────────────────────────────────────────────────────
// GET /api/sessions
// ─────────────────────────────────────────────────────────────
describe("GET /api/sessions — seans listesi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await GET(makeRequest("http://localhost/api/sessions"))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
  })

  it("auth'lu istek tamamlanan seanslari doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    const completedSession = { ...SESSION_FIXTURE, status: "COMPLETED", task: null }
    mockSession.findMany.mockResolvedValue([completedSession])

    const res = await GET(makeRequest("http://localhost/api/sessions"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe("session-1")
    expect(mockSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-abc",
          status: "COMPLETED",
        }),
      })
    )
  })

  it("bos seans listesi bos dizi doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findMany.mockResolvedValue([])

    const res = await GET(makeRequest("http://localhost/api/sessions"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([])
  })

  it("limit parametresi sorguya yansir (varsayilan 10)", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findMany.mockResolvedValue([])

    // limit parametresi olmadan — varsayilan 10 kullanilmali
    await GET(makeRequest("http://localhost/api/sessions"))

    expect(mockSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    )
  })

  it("limit max 50 ile sinirlandirilir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findMany.mockResolvedValue([])

    // 100 istendi ama max 50 olmali
    await GET(makeRequest("http://localhost/api/sessions?limit=100"))

    expect(mockSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    )
  })
})

// ─────────────────────────────────────────────────────────────
// POST /api/sessions
// ─────────────────────────────────────────────────────────────
describe("POST /api/sessions — seans olusturma", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gecerli veri ile seans olusturulur ve 201 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.create.mockResolvedValue(SESSION_FIXTURE)

    const res = await POST(
      makeRequest("http://localhost/api/sessions", {
        method: "POST",
        body: { mode: "POMODORO", plannedMinutes: 25 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.session.id).toBe("session-1")
    expect(mockSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-abc",
          mode: "POMODORO",
          status: "ACTIVE",
        }),
      })
    )
  })

  it("mode olmadan 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await POST(
      makeRequest("http://localhost/api/sessions", {
        method: "POST",
        body: { plannedMinutes: 25 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockSession.create).not.toHaveBeenCalled()
  })

  it("gecersiz mode ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await POST(
      makeRequest("http://localhost/api/sessions", {
        method: "POST",
        body: { mode: "INVALID_MODE" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockSession.create).not.toHaveBeenCalled()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(
      makeRequest("http://localhost/api/sessions", {
        method: "POST",
        body: { mode: "POMODORO" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockSession.create).not.toHaveBeenCalled()
  })

  it("taskId ve plannedMinutes opsiyonel — sadece mode ile seans olusturulur", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    const minimalSession = { ...SESSION_FIXTURE, taskId: null, plannedMinutes: null }
    mockSession.create.mockResolvedValue(minimalSession)

    const res = await POST(
      makeRequest("http://localhost/api/sessions", {
        method: "POST",
        body: { mode: "FLOWTIME" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(mockSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mode: "FLOWTIME",
          taskId: null,
          plannedMinutes: null,
          status: "ACTIVE",
        }),
      })
    )
  })
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/sessions/:id
// ─────────────────────────────────────────────────────────────
describe("PATCH /api/sessions/:id — seans guncelleme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("seans basariyla guncellenir (status ve actualMinutes)", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    const updatedSession = { ...SESSION_FIXTURE, status: "PAUSED", actualMinutes: 15 }
    mockSession.update.mockResolvedValue(updatedSession)

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "PAUSED", actualMinutes: 15 },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.session.status).toBe("PAUSED")
    expect(body.session.actualMinutes).toBe(15)
  })

  it("olmayan seans 404 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(null)

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/seans-yok", {
        method: "PATCH",
        body: { status: "COMPLETED" },
      }),
      makeParams("seans-yok")
    )
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe("Bulunamadı")
    expect(mockSession.update).not.toHaveBeenCalled()
  })

  it("baska kullanicinin seansini guncellemeye calisinca 403 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue({ ...SESSION_FIXTURE, userId: "baska-kullanici" })

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED" },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toBe("Yetkisiz")
    expect(mockSession.update).not.toHaveBeenCalled()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED" },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockSession.update).not.toHaveBeenCalled()
  })

  it("gecersiz body ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    // status zorunlu — eksik birakildi
    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { actualMinutes: 20 },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockSession.update).not.toHaveBeenCalled()
  })

  it("COMPLETED status ile endedAt set edilir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    const completedSession = { ...SESSION_FIXTURE, status: "COMPLETED", endedAt: new Date(), actualMinutes: 25 }
    mockSession.update.mockResolvedValue(completedSession)

    // COMPLETED sonrasi kisisel rekort sorgusu yapilir
    mockUser.updateMany.mockResolvedValue({ count: 1 })
    mockUser.findUnique.mockResolvedValue({ longestSession: 0, bestDayMinutes: 0 })
    mockSession.aggregate.mockResolvedValue({ _sum: { actualMinutes: 25 } })
    mockUser.update.mockResolvedValue({} as never)

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED", actualMinutes: 25 },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.session.status).toBe("COMPLETED")
    // endedAt set edilmis olmali
    expect(mockSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          endedAt: expect.any(Date),
        }),
      })
    )
  })

  it("COMPLETED → firstSessionAt null ise guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    mockSession.update.mockResolvedValue({ ...SESSION_FIXTURE, status: "COMPLETED", endedAt: new Date() })
    mockUser.findUnique.mockResolvedValue({ longestSession: 0, bestDayMinutes: 0 })
    mockSession.aggregate.mockResolvedValue({ _sum: { actualMinutes: 10 } })
    mockUser.update.mockResolvedValue({} as never)
    // updateMany: firstSessionAt null olan kullanici guncellenir
    mockUser.updateMany.mockResolvedValue({ count: 1 })

    await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED", actualMinutes: 10 },
      }),
      makeParams("session-1")
    )

    expect(mockUser.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "user-abc",
          firstSessionAt: null,
        }),
        data: expect.objectContaining({
          firstSessionAt: expect.any(Date),
        }),
      })
    )
  })

  it("COMPLETED → longestSession kisisel rekoru guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    mockSession.update.mockResolvedValue({ ...SESSION_FIXTURE, status: "COMPLETED", endedAt: new Date() })
    mockUser.updateMany.mockResolvedValue({ count: 0 })
    // Mevcut rekoru 10dk — yeni seans 30dk, rekor kirilmali
    mockUser.findUnique.mockResolvedValue({ longestSession: 10, bestDayMinutes: 0 })
    mockSession.aggregate.mockResolvedValue({ _sum: { actualMinutes: 30 } })
    mockUser.update.mockResolvedValue({} as never)

    await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED", actualMinutes: 30 },
      }),
      makeParams("session-1")
    )

    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          longestSession: 30,
        }),
      })
    )
  })

  it("COMPLETED → bestDayMinutes gunluk toplam ile guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    mockSession.update.mockResolvedValue({ ...SESSION_FIXTURE, status: "COMPLETED", endedAt: new Date() })
    mockUser.updateMany.mockResolvedValue({ count: 0 })
    // Mevcut gunluk rekoru 60dk — bugun toplam 90dk
    mockUser.findUnique.mockResolvedValue({ longestSession: 0, bestDayMinutes: 60 })
    mockSession.aggregate.mockResolvedValue({ _sum: { actualMinutes: 90 } })
    mockUser.update.mockResolvedValue({} as never)

    await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED", actualMinutes: 30 },
      }),
      makeParams("session-1")
    )

    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bestDayMinutes: 90,
        }),
      })
    )
  })

  it("mood secenegiyle seans guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockSession.findUnique.mockResolvedValue(SESSION_FIXTURE)
    const sessionWithMood = { ...SESSION_FIXTURE, status: "COMPLETED", mood: 4, endedAt: new Date() }
    mockSession.update.mockResolvedValue(sessionWithMood)
    mockUser.updateMany.mockResolvedValue({ count: 0 })
    mockUser.findUnique.mockResolvedValue({ longestSession: 0, bestDayMinutes: 0 })
    mockSession.aggregate.mockResolvedValue({ _sum: { actualMinutes: 0 } })
    mockUser.update.mockResolvedValue({} as never)

    const res = await PATCH(
      makeRequest("http://localhost/api/sessions/session-1", {
        method: "PATCH",
        body: { status: "COMPLETED", mood: 4 },
      }),
      makeParams("session-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.session.mood).toBe(4)
    expect(mockSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mood: 4,
        }),
      })
    )
  })
})
