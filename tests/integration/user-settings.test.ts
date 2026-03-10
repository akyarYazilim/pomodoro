import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// vi.mock cagrilari hoist edilir — factory icinde dis scope degiskenlerine erisim OLMAZ.
// Bu nedenle mocklar modul seviyesinde tanimlanip vi.mocked() ile alinir.

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { GET, PATCH } from "@/app/api/user/settings/route"
import { POST as subscribe, DELETE as unsubscribe } from "@/app/api/user/notifications/route"

const mockAuth = vi.mocked(auth)
const mockUser = vi.mocked(prisma.user)

// ─────────────────────────────────────────────────────────────
// Test yardimcilari
// ─────────────────────────────────────────────────────────────

const AUTHENTICATED_SESSION = {
  user: { id: "user-abc", email: "test@example.com", name: "Test" },
}

const SETTINGS_FIXTURE = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  defaultTimerMode: "POMODORO",
  dailyGoalMinutes: 120,
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

function makeNextRequest(
  url: string,
  options: { method?: string; body?: unknown } = {}
): NextRequest {
  const { method = "GET", body } = options
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { "Content-Type": "application/json" }
  }
  return new NextRequest(url, init)
}

// ─────────────────────────────────────────────────────────────
// GET /api/user/settings
// ─────────────────────────────────────────────────────────────

describe("GET /api/user/settings — kullanici ayarlarini getirme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Unauthorized")
    expect(mockUser.findUnique).not.toHaveBeenCalled()
  })

  it("auth'lu istek kullanici ayarlarini doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockUser.findUnique.mockResolvedValue(SETTINGS_FIXTURE)

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.pomodoroMinutes).toBe(25)
    expect(body.shortBreakMinutes).toBe(5)
    expect(body.longBreakMinutes).toBe(15)
    expect(body.defaultTimerMode).toBe("POMODORO")
    expect(body.dailyGoalMinutes).toBe(120)
    expect(mockUser.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-abc" },
        select: expect.objectContaining({
          pomodoroMinutes: true,
          shortBreakMinutes: true,
          longBreakMinutes: true,
          defaultTimerMode: true,
          dailyGoalMinutes: true,
        }),
      })
    )
  })
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/user/settings
// ─────────────────────────────────────────────────────────────

describe("PATCH /api/user/settings — kullanici ayarlarini guncelleme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gecerli veri ile ayarlar guncellenir ve 200 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    const updatedSettings = { ...SETTINGS_FIXTURE, pomodoroMinutes: 30 }
    mockUser.update.mockResolvedValue(updatedSettings)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { pomodoroMinutes: 30 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.pomodoroMinutes).toBe(30)
    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-abc" },
        data: expect.objectContaining({ pomodoroMinutes: 30 }),
      })
    )
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { pomodoroMinutes: 30 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Unauthorized")
    expect(mockUser.update).not.toHaveBeenCalled()
  })

  it("gecersiz pomodoroMinutes (0) ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { pomodoroMinutes: 0 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(mockUser.update).not.toHaveBeenCalled()
  })

  it("gecersiz pomodoroMinutes (121) ile 400 doner — max 120", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { pomodoroMinutes: 121 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(mockUser.update).not.toHaveBeenCalled()
  })

  it("kısmi guncelleme calisir — sadece pomodoroMinutes gonderilir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    const partialResult = { ...SETTINGS_FIXTURE, pomodoroMinutes: 45 }
    mockUser.update.mockResolvedValue(partialResult)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { pomodoroMinutes: 45 },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.pomodoroMinutes).toBe(45)
    // Sadece gonderilen alan update'e gecmeli
    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { pomodoroMinutes: 45 },
      })
    )
  })

  it("bos body ile 200 doner — hicbir alan guncellenmez", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockUser.update.mockResolvedValue(SETTINGS_FIXTURE)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: {},
      })
    )
    const body = await res.json()

    // Bos obje Zod schema'sinda gecerli (hepsi optional)
    expect(res.status).toBe(200)
    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {},
      })
    )
  })

  it("gecersiz defaultTimerMode ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await PATCH(
      makeRequest("http://localhost/api/user/settings", {
        method: "PATCH",
        body: { defaultTimerMode: "INVALID_MODE" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(mockUser.update).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// POST /api/user/notifications — push token kaydetme
// ─────────────────────────────────────────────────────────────

describe("POST /api/user/notifications — push token kaydetme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gecerli token kaydedilir ve success doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockUser.update.mockResolvedValue({})

    const res = await subscribe(
      makeNextRequest("http://localhost/api/user/notifications", {
        method: "POST",
        body: { token: "expo-push-token-abc123" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUser.update).toHaveBeenCalledWith({
      where: { id: "user-abc" },
      data: { pushToken: "expo-push-token-abc123" },
    })
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await subscribe(
      makeNextRequest("http://localhost/api/user/notifications", {
        method: "POST",
        body: { token: "some-token" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockUser.update).not.toHaveBeenCalled()
  })

  it("bos token ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await subscribe(
      makeNextRequest("http://localhost/api/user/notifications", {
        method: "POST",
        body: { token: "" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz token")
    expect(mockUser.update).not.toHaveBeenCalled()
  })

  it("token alanı olmayan body ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await subscribe(
      makeNextRequest("http://localhost/api/user/notifications", {
        method: "POST",
        body: {},
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz token")
    expect(mockUser.update).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// DELETE /api/user/notifications — push token silme
// ─────────────────────────────────────────────────────────────

describe("DELETE /api/user/notifications — push token silme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("push token null yapilir ve success doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockUser.update.mockResolvedValue({})

    const res = await unsubscribe()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUser.update).toHaveBeenCalledWith({
      where: { id: "user-abc" },
      data: { pushToken: null },
    })
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await unsubscribe()
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockUser.update).not.toHaveBeenCalled()
  })
})
