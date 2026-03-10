import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// vi.hoisted ile mock nesneleri hoist zamanında oluşturulur —
// import sırası ne olursa olsun mock'lar her zaman önce tanımlanır
const { mockPrisma, mockAuth } = vi.hoisted(() => {
  const mockPrisma = {
    team: {
      create: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    teamInvite: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    focusSession: {
      groupBy: vi.fn(),
    },
    task: {
      groupBy: vi.fn(),
    },
  }
  const mockAuth = vi.fn()
  return { mockPrisma, mockAuth }
})

// Auth ve Prisma mock'ları — route'lar import edilmeden önce tanımlanmalı
vi.mock("@/lib/auth", () => ({ auth: mockAuth }))
vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }))

import { POST as createTeam, GET as getTeams } from "@/app/api/teams/route"
import { GET as getTeamStats } from "@/app/api/teams/[id]/stats/route"
import { POST as inviteMember } from "@/app/api/teams/[id]/invite/route"
import {
  POST as acceptInvite,
  GET as previewInvite,
} from "@/app/api/teams/invite/[token]/route"

// ─────────────────────────────────────────────
// Sabit test verileri
// ─────────────────────────────────────────────

const MOCK_USER = { id: "user-1", name: "Test", email: "test@example.com" }

const MOCK_TEAM = {
  id: "team-1",
  name: "Test Takımı",
  ownerId: "user-1",
  members: [
    {
      userId: "user-1",
      role: "OWNER",
      joinedAt: new Date("2026-01-01"),
      user: { id: "user-1", name: "Test", image: null },
    },
  ],
  invites: [],
}

const MOCK_INVITE = {
  id: "invite-1",
  token: "valid-token-abc",
  teamId: "team-1",
  email: "newuser@example.com",
  acceptedAt: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
  team: { name: "Test Takımı" },
}

// ─────────────────────────────────────────────
// Yardımcı fonksiyonlar
// ─────────────────────────────────────────────

function makeRequest(body?: object, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/teams", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  })
}

function makeIdParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

function makeTokenParams(token: string) {
  return { params: Promise.resolve({ token }) }
}

// ─────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────

describe("Teams API (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────
  // POST /api/teams — takım oluşturma
  // ─────────────────────────────────────────────
  describe("POST /api/teams — takım oluşturma", () => {
    it("geçerli isimle takım oluşturulur ve 201 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.team.create.mockResolvedValue(MOCK_TEAM)

      const req = makeRequest({ name: "Test Takımı" })
      const res = await createTeam(req)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.team).toBeDefined()
      expect(data.team.name).toBe("Test Takımı")
      expect(mockPrisma.team.create).toHaveBeenCalledOnce()

      // Takım oluşturmada sahibi otomatik OWNER olarak eklenmeli
      const createCall = mockPrisma.team.create.mock.calls[0][0]
      expect(createCall.data.ownerId).toBe(MOCK_USER.id)
      expect(createCall.data.members.create.userId).toBe(MOCK_USER.id)
      expect(createCall.data.members.create.role).toBe("OWNER")
    })

    it("auth olmadan 401 döner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest({ name: "Test Takımı" })
      const res = await createTeam(req)
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.team.create).not.toHaveBeenCalled()
    })

    it("takım ismi 2 karakterden kısa olunca 400 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      const req = makeRequest({ name: "A" }) // 1 karakter — min 2
      const res = await createTeam(req)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe("Geçersiz istek")
      expect(mockPrisma.team.create).not.toHaveBeenCalled()
    })

    it("isim alanı hiç gönderilmezse 400 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      const req = makeRequest({}) // name yok
      const res = await createTeam(req)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe("Geçersiz istek")
      expect(mockPrisma.team.create).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // GET /api/teams — kullanıcının takımını getirme
  // ─────────────────────────────────────────────
  describe("GET /api/teams — kullanıcının takımı", () => {
    it("takım varsa team ve role döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamMember.findFirst.mockResolvedValue({
        role: "OWNER",
        team: MOCK_TEAM,
      })

      const req = makeRequest(undefined, "GET")
      const res = await getTeams(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.team).toBeDefined()
      expect(data.team.name).toBe("Test Takımı")
      expect(data.role).toBe("OWNER")
    })

    it("kullanıcının hiç takımı yoksa { team: null } döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamMember.findFirst.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getTeams(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.team).toBeNull()
    })

    it("auth olmadan 401 döner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getTeams(req)
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.teamMember.findFirst).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // GET /api/teams/[id]/stats — takım istatistikleri
  // ─────────────────────────────────────────────
  describe("GET /api/teams/[id]/stats — haftalık istatistikler", () => {
    it("üye istatistiklerini sıralı şekilde döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      // Üyelik doğrulama
      mockPrisma.teamMember.findUnique.mockResolvedValue({ role: "OWNER" })

      // Takım üyeleri listesi
      mockPrisma.teamMember.findMany.mockResolvedValue([
        { userId: "user-1", role: "OWNER", user: { id: "user-1", name: "Test", image: null } },
        { userId: "user-2", role: "MEMBER", user: { id: "user-2", name: "Diğer", image: null } },
      ])

      // Bu hafta: user-2 daha fazla çalıştı
      mockPrisma.focusSession.groupBy
        .mockResolvedValueOnce([
          { userId: "user-1", _sum: { actualMinutes: 60 } },
          { userId: "user-2", _sum: { actualMinutes: 120 } },
        ])
        // Geçen hafta
        .mockResolvedValueOnce([
          { userId: "user-1", _sum: { actualMinutes: 30 } },
          { userId: "user-2", _sum: { actualMinutes: 45 } },
        ])

      // Görev tamamlama sayıları
      mockPrisma.task.groupBy.mockResolvedValue([
        { userId: "user-1", _count: { id: 3 } },
        { userId: "user-2", _count: { id: 5 } },
      ])

      const req = makeRequest(undefined, "GET")
      const res = await getTeamStats(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.entries).toHaveLength(2)
      expect(data.totalMinutes).toBe(180) // 60 + 120
      expect(data.totalTasks).toBe(8) // 3 + 5

      // Daha fazla dakika olan user-2 ilk sırada olmalı
      expect(data.entries[0].userId).toBe("user-2")
      expect(data.entries[0].thisWeekMinutes).toBe(120)
      expect(data.entries[0].prevWeekMinutes).toBe(45)
      expect(data.entries[0].tasksCompleted).toBe(5)
      expect(data.entries[1].userId).toBe("user-1")
    })

    it("auth olmadan 401 döner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getTeamStats(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.teamMember.findUnique).not.toHaveBeenCalled()
    })

    it("takım üyesi değilse 403 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamMember.findUnique.mockResolvedValue(null) // üye değil

      const req = makeRequest(undefined, "GET")
      const res = await getTeamStats(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(403)
      expect(data.error).toBe("Forbidden")
      expect(mockPrisma.teamMember.findMany).not.toHaveBeenCalled()
    })

    it("boş takımda entries dizisi boş döner, totalMinutes ve totalTasks sıfır olur", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamMember.findUnique.mockResolvedValue({ role: "OWNER" })
      mockPrisma.teamMember.findMany.mockResolvedValue([])
      mockPrisma.focusSession.groupBy.mockResolvedValue([])
      mockPrisma.task.groupBy.mockResolvedValue([])

      const req = makeRequest(undefined, "GET")
      const res = await getTeamStats(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(Array.isArray(data.entries)).toBe(true)
      expect(data.entries).toHaveLength(0)
      expect(data.totalMinutes).toBe(0)
      expect(data.totalTasks).toBe(0)
    })
  })

  // ─────────────────────────────────────────────
  // POST /api/teams/[id]/invite — e-posta ile davet
  // ─────────────────────────────────────────────
  describe("POST /api/teams/[id]/invite — üye davet etme", () => {
    it("OWNER e-posta ile davet oluşturur ve 201 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      // Üyelik: OWNER yetkisi var
      mockPrisma.teamMember.findUnique
        .mockResolvedValueOnce({ role: "OWNER" }) // yetki kontrolü
        .mockResolvedValueOnce(null) // zaten üye mi? — değil
      // Davet edilecek kullanıcı sistemde yok
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.teamInvite.create.mockResolvedValue(MOCK_INVITE)

      const req = makeRequest({ email: "newuser@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.invite).toBeDefined()
      expect(mockPrisma.teamInvite.create).toHaveBeenCalledOnce()

      // Davet 7 günlük süreyle oluşturulmalı
      const createCall = mockPrisma.teamInvite.create.mock.calls[0][0]
      expect(createCall.data.teamId).toBe("team-1")
      expect(createCall.data.email).toBe("newuser@example.com")
      expect(createCall.data.expiresAt).toBeInstanceOf(Date)
    })

    it("auth olmadan 401 döner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest({ email: "newuser@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.teamInvite.create).not.toHaveBeenCalled()
    })

    it("MEMBER rolüyle davet oluşturmaya çalışınca 403 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      // Sadece OWNER ve ADMIN davet edebilir; MEMBER rolü yetersiz
      mockPrisma.teamMember.findUnique.mockResolvedValue({ role: "MEMBER" })

      const req = makeRequest({ email: "someone@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(403)
      expect(data.error).toBe("Forbidden")
      expect(mockPrisma.teamInvite.create).not.toHaveBeenCalled()
    })

    it("üye olmayan kullanıcı davet etmeye çalışırsa 403 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      // Davet edenin kendisi takım üyesi değil
      mockPrisma.teamMember.findUnique.mockResolvedValue(null)

      const req = makeRequest({ email: "someone@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(403)
      expect(data.error).toBe("Forbidden")
    })

    it("geçersiz e-posta formatıyla 400 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamMember.findUnique.mockResolvedValue({ role: "OWNER" })

      const req = makeRequest({ email: "gecersiz-email" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(mockPrisma.teamInvite.create).not.toHaveBeenCalled()
    })

    it("zaten üye olan kullanıcı davet edilince 409 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      // Davet eden: OWNER
      mockPrisma.teamMember.findUnique
        .mockResolvedValueOnce({ role: "OWNER" }) // yetki kontrolü
        .mockResolvedValueOnce({ teamId: "team-1", userId: "user-2" }) // zaten üye
      // Davet edilmek istenen kullanıcı sistemde var ve takımda
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-2",
        email: "existing@example.com",
      })

      const req = makeRequest({ email: "existing@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(409)
      expect(data.error).toBe("Bu kullanıcı zaten üye")
      expect(mockPrisma.teamInvite.create).not.toHaveBeenCalled()
    })

    it("sistemde kayıtlı ama takım üyesi olmayan kullanıcı davet edilebilir", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      // Davet eden: OWNER
      mockPrisma.teamMember.findUnique
        .mockResolvedValueOnce({ role: "OWNER" }) // yetki kontrolü
        .mockResolvedValueOnce(null) // takım üyesi değil → davet edilebilir
      // Kullanıcı sistemde var ama bu takımda değil
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-3",
        email: "registered@example.com",
      })
      mockPrisma.teamInvite.create.mockResolvedValue({
        ...MOCK_INVITE,
        email: "registered@example.com",
      })

      const req = makeRequest({ email: "registered@example.com" })
      const res = await inviteMember(req, makeIdParams("team-1"))
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.invite).toBeDefined()
      expect(mockPrisma.teamInvite.create).toHaveBeenCalledOnce()
    })
  })

  // ─────────────────────────────────────────────
  // POST /api/teams/invite/[token] — daveti kabul etme
  // ─────────────────────────────────────────────
  describe("POST /api/teams/invite/[token] — daveti kabul etme", () => {
    it("geçerli token ile davet kabul edilir ve member döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamInvite.findUnique.mockResolvedValue(MOCK_INVITE)
      mockPrisma.teamMember.upsert.mockResolvedValue({
        teamId: "team-1",
        userId: "user-1",
        role: "MEMBER",
      })
      mockPrisma.teamInvite.update.mockResolvedValue({
        ...MOCK_INVITE,
        acceptedAt: new Date(),
      })

      const res = await acceptInvite(
        makeRequest(undefined, "POST"),
        makeTokenParams("valid-token-abc")
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.member).toBeDefined()

      // Üyelik upsert doğru takım ve kullanıcıyla yapılmalı
      const upsertCall = mockPrisma.teamMember.upsert.mock.calls[0][0]
      expect(upsertCall.where.teamId_userId.teamId).toBe("team-1")
      expect(upsertCall.where.teamId_userId.userId).toBe(MOCK_USER.id)
      expect(upsertCall.create.role).toBe("MEMBER")

      // Davet kabul edildi olarak işaretlenmeli
      expect(mockPrisma.teamInvite.update).toHaveBeenCalledOnce()
      const updateCall = mockPrisma.teamInvite.update.mock.calls[0][0]
      expect(updateCall.where.token).toBe("valid-token-abc")
      expect(updateCall.data.acceptedAt).toBeInstanceOf(Date)
    })

    it("auth olmadan 401 döner", async () => {
      mockAuth.mockResolvedValue(null)

      const res = await acceptInvite(
        makeRequest(undefined, "POST"),
        makeTokenParams("valid-token-abc")
      )
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.teamInvite.findUnique).not.toHaveBeenCalled()
    })

    it("var olmayan token ile 404 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamInvite.findUnique.mockResolvedValue(null) // token bulunamadı

      const res = await acceptInvite(
        makeRequest(undefined, "POST"),
        makeTokenParams("yanlis-token")
      )
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Davet geçersiz veya süresi dolmuş")
      expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled()
    })

    it("süresi dolmuş davet 404 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamInvite.findUnique.mockResolvedValue({
        ...MOCK_INVITE,
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 1000), // geçmişte
      })

      const res = await acceptInvite(
        makeRequest(undefined, "POST"),
        makeTokenParams("expired-token")
      )
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Davet geçersiz veya süresi dolmuş")
      expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled()
    })

    it("zaten kabul edilmiş davet 404 döner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.teamInvite.findUnique.mockResolvedValue({
        ...MOCK_INVITE,
        acceptedAt: new Date("2026-01-01"), // daha önce kabul edildi
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      const res = await acceptInvite(
        makeRequest(undefined, "POST"),
        makeTokenParams("already-accepted-token")
      )
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Davet geçersiz veya süresi dolmuş")
      expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // GET /api/teams/invite/[token] — davet önizleme
  // ─────────────────────────────────────────────
  describe("GET /api/teams/invite/[token] — davet önizleme", () => {
    it("geçerli token ile takım adı ve e-posta döner (auth gerekmez)", async () => {
      // Auth mock'u ayarlanmamış — bu endpoint auth gerektirmiyor
      mockPrisma.teamInvite.findUnique.mockResolvedValue(MOCK_INVITE)

      const req = makeRequest(undefined, "GET")
      const res = await previewInvite(req, makeTokenParams("valid-token-abc"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.teamName).toBe("Test Takımı")
      expect(data.email).toBe("newuser@example.com")
    })

    it("var olmayan token ile 404 döner", async () => {
      mockPrisma.teamInvite.findUnique.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await previewInvite(req, makeTokenParams("yanlis-token"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Davet geçersiz veya süresi dolmuş")
    })

    it("süresi dolmuş davet önizlemesinde 404 döner", async () => {
      mockPrisma.teamInvite.findUnique.mockResolvedValue({
        ...MOCK_INVITE,
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 5000), // geçmişte
      })

      const req = makeRequest(undefined, "GET")
      const res = await previewInvite(req, makeTokenParams("expired-token"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Davet geçersiz veya süresi dolmuş")
    })
  })
})
