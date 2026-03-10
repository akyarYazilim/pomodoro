import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// vi.hoisted ile mock nesneleri hoist zamanında olusturulur
const { mockPrisma, mockAuth } = vi.hoisted(() => {
  const mockPrisma = {
    sharedRoom: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    roomMember: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    focusSession: {
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  }
  const mockAuth = vi.fn()
  return { mockPrisma, mockAuth }
})

// Mock auth — sabit kullanıcı session
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}))

// Mock Prisma client
vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}))

import { POST as createRoom } from "@/app/api/rooms/route"
import { GET as getRoom } from "@/app/api/rooms/[code]/route"
import { POST as joinRoom } from "@/app/api/rooms/[code]/join/route"
import { PATCH as updateStatus } from "@/app/api/rooms/[code]/status/route"
import { GET as getLeaderboard } from "@/app/api/rooms/[code]/leaderboard/route"

const MOCK_USER = { id: "user-1", name: "Test Kullanici", email: "test@example.com" }

const MOCK_ROOM = {
  id: "room-1",
  code: "ABC123",
  name: "Test Odasi",
  hostId: "user-1",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat sonra
  members: [
    {
      userId: "user-1",
      isWorking: false,
      joinedAt: new Date(),
      user: { id: "user-1", name: "Test Kullanici", image: null },
    },
  ],
}

function makeRequest(body?: object, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/rooms", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  })
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

describe("Rooms API (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────
  // POST /api/rooms — oda oluşturma
  // ─────────────────────────────────────────────
  describe("POST /api/rooms — oda oluşturma", () => {
    it("yetkili kullanici benzersiz kodlu oda olusturur", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null) // kod benzersiz
      mockPrisma.sharedRoom.create.mockResolvedValue(MOCK_ROOM)

      const req = makeRequest({ name: "Test Odasi" })
      const res = await createRoom(req)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.room).toBeDefined()
      expect(data.room.code).toBe("ABC123")
      expect(mockPrisma.sharedRoom.create).toHaveBeenCalledOnce()

      // create cagrisinda host + uye kaydi birlikte olusturulmali
      const createCall = mockPrisma.sharedRoom.create.mock.calls[0][0]
      expect(createCall.data.hostId).toBe(MOCK_USER.id)
      expect(createCall.data.members.create.userId).toBe(MOCK_USER.id)
    })

    it("isim olmadan da oda olusturulur (name opsiyonel)", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null)
      mockPrisma.sharedRoom.create.mockResolvedValue({ ...MOCK_ROOM, name: null })

      const req = makeRequest({}) // name yok
      const res = await createRoom(req)
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.room.name).toBeNull()
    })

    it("auth olmadan 401 doner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest({ name: "Oda" })
      const res = await createRoom(req)
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
      expect(mockPrisma.sharedRoom.create).not.toHaveBeenCalled()
    })

    it("user.id eksikse 401 doner", async () => {
      mockAuth.mockResolvedValue({ user: {} }) // id yok

      const req = makeRequest({ name: "Oda" })
      const res = await createRoom(req)

      expect(res.status).toBe(401)
    })
  })

  // ─────────────────────────────────────────────
  // GET /api/rooms/:code — oda bilgisi getirme
  // ─────────────────────────────────────────────
  describe("GET /api/rooms/:code — oda bilgisi", () => {
    it("gecerli kod ile oda bilgileri ve uyeleri doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(MOCK_ROOM)

      const req = makeRequest(undefined, "GET")
      const res = await getRoom(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.room).toBeDefined()
      expect(data.room.code).toBe("ABC123")
      expect(data.room.members).toHaveLength(1)
    })

    it("olmayan kod ile 404 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getRoom(req, makeParams("XXXXXX"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Room not found")
    })

    it("suresi dolmus oda 410 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue({
        ...MOCK_ROOM,
        expiresAt: new Date(Date.now() - 1000), // gecmiste
      })

      const req = makeRequest(undefined, "GET")
      const res = await getRoom(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(410)
      expect(data.error).toBe("Room expired")
    })

    it("auth olmadan 401 doner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getRoom(req, makeParams("ABC123"))

      expect(res.status).toBe(401)
      expect(mockPrisma.sharedRoom.findUnique).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // POST /api/rooms/:code/join — odaya katilma
  // ─────────────────────────────────────────────
  describe("POST /api/rooms/:code/join — odaya katilma", () => {
    it("kullanici mevcut odaya katilir ve guncellenmis odayi doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique
        .mockResolvedValueOnce(MOCK_ROOM) // ilk cagri: oda kontrolu
        .mockResolvedValueOnce({          // ikinci cagri: katildiktan sonra fetch
          ...MOCK_ROOM,
          members: [
            ...MOCK_ROOM.members,
            {
              userId: "user-2",
              isWorking: false,
              joinedAt: new Date(),
              user: { id: "user-2", name: "Ikinci Kullanici", image: null },
            },
          ],
        })
      mockPrisma.roomMember.upsert.mockResolvedValue({})

      const req = makeRequest(undefined, "POST")
      const res = await joinRoom(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.room).toBeDefined()
      expect(mockPrisma.roomMember.upsert).toHaveBeenCalledOnce()

      // upsert dogru composite key ile cagrilmali
      const upsertCall = mockPrisma.roomMember.upsert.mock.calls[0][0]
      expect(upsertCall.where.roomId_userId).toEqual({
        roomId: MOCK_ROOM.id,
        userId: MOCK_USER.id,
      })
    })

    it("zaten odada olan kullanici tekrar join edebilir (upsert idempotent)", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(MOCK_ROOM)
      mockPrisma.roomMember.upsert.mockResolvedValue({}) // update: {} - mevcut kayit korunur

      const req = makeRequest(undefined, "POST")
      const res = await joinRoom(req, makeParams("ABC123"))

      expect(res.status).toBe(200)
      expect(mockPrisma.roomMember.upsert).toHaveBeenCalledOnce()
    })

    it("olmayan oda kodu ile 404 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null)

      const req = makeRequest(undefined, "POST")
      const res = await joinRoom(req, makeParams("YYYYYY"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Room not found")
      expect(mockPrisma.roomMember.upsert).not.toHaveBeenCalled()
    })

    it("suresi dolmus odaya katilinmaz (410)", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue({
        ...MOCK_ROOM,
        expiresAt: new Date(Date.now() - 5000),
      })

      const req = makeRequest(undefined, "POST")
      const res = await joinRoom(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(410)
      expect(data.error).toBe("Room expired")
    })

    it("auth olmadan 401 doner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest(undefined, "POST")
      const res = await joinRoom(req, makeParams("ABC123"))

      expect(res.status).toBe(401)
      expect(mockPrisma.roomMember.upsert).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // PATCH /api/rooms/:code/status — calisma durumu guncelleme
  // ─────────────────────────────────────────────
  describe("PATCH /api/rooms/:code/status — calisma durumu", () => {
    it("isWorking true olarak guncellenir", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(MOCK_ROOM)
      mockPrisma.roomMember.update.mockResolvedValue({ isWorking: true })

      const req = makeRequest({ isWorking: true }, "PATCH")
      const res = await updateStatus(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.ok).toBe(true)

      const updateCall = mockPrisma.roomMember.update.mock.calls[0][0]
      expect(updateCall.data.isWorking).toBe(true)
      expect(updateCall.where.roomId_userId).toEqual({
        roomId: MOCK_ROOM.id,
        userId: MOCK_USER.id,
      })
    })

    it("isWorking false olarak guncellenir", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(MOCK_ROOM)
      mockPrisma.roomMember.update.mockResolvedValue({ isWorking: false })

      const req = makeRequest({ isWorking: false }, "PATCH")
      const res = await updateStatus(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.ok).toBe(true)

      const updateCall = mockPrisma.roomMember.update.mock.calls[0][0]
      expect(updateCall.data.isWorking).toBe(false)
    })

    it("olmayan oda kodu ile 404 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null)

      const req = makeRequest({ isWorking: true }, "PATCH")
      const res = await updateStatus(req, makeParams("XXXXXX"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Room not found")
      expect(mockPrisma.roomMember.update).not.toHaveBeenCalled()
    })

    it("auth olmadan 401 doner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest({ isWorking: true }, "PATCH")
      const res = await updateStatus(req, makeParams("ABC123"))

      expect(res.status).toBe(401)
      expect(mockPrisma.roomMember.update).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────
  // GET /api/rooms/:code/leaderboard — siralama
  // ─────────────────────────────────────────────
  describe("GET /api/rooms/:code/leaderboard — siralama", () => {
    it("uyelerin haftalik odak surelerini sirali doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      const roomWithMembers = {
        ...MOCK_ROOM,
        members: [
          { userId: "user-1" },
          { userId: "user-2" },
        ],
      }
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(roomWithMembers)

      // Bu hafta: user-2 daha fazla calisdi
      mockPrisma.focusSession.groupBy
        .mockResolvedValueOnce([
          { userId: "user-1", _sum: { actualMinutes: 50 } },
          { userId: "user-2", _sum: { actualMinutes: 120 } },
        ])
        // Gecen hafta
        .mockResolvedValueOnce([
          { userId: "user-1", _sum: { actualMinutes: 30 } },
          { userId: "user-2", _sum: { actualMinutes: 80 } },
        ])

      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user-1", name: "Test Kullanici", image: null },
        { id: "user-2", name: "Ikinci Kullanici", image: null },
      ])

      const req = makeRequest(undefined, "GET")
      const res = await getLeaderboard(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.entries).toHaveLength(2)
      expect(data.weekStart).toBeDefined()

      // user-2 daha fazla dakika → ilk sirada olmali
      expect(data.entries[0].userId).toBe("user-2")
      expect(data.entries[0].currentWeekMinutes).toBe(120)
      expect(data.entries[0].prevWeekMinutes).toBe(80)
      expect(data.entries[1].userId).toBe("user-1")
      expect(data.entries[1].currentWeekMinutes).toBe(50)
    })

    it("bos oda bos dizi doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      mockPrisma.sharedRoom.findUnique.mockResolvedValue({
        ...MOCK_ROOM,
        members: [], // hic uye yok
      })

      // groupBy bos donerse Promise.all da bos doner
      mockPrisma.focusSession.groupBy.mockResolvedValue([])
      mockPrisma.user.findMany.mockResolvedValue([])

      const req = makeRequest(undefined, "GET")
      const res = await getLeaderboard(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.entries).toHaveLength(0)
      expect(Array.isArray(data.entries)).toBe(true)
    })

    it("gecmis hafta verisi olmayan kullanici prevWeekMinutes 0 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })

      mockPrisma.sharedRoom.findUnique.mockResolvedValue({
        ...MOCK_ROOM,
        members: [{ userId: "user-1" }],
      })

      // Bu hafta veri var, gecen hafta yok
      mockPrisma.focusSession.groupBy
        .mockResolvedValueOnce([{ userId: "user-1", _sum: { actualMinutes: 60 } }])
        .mockResolvedValueOnce([]) // gecen hafta bos

      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user-1", name: "Test Kullanici", image: null },
      ])

      const req = makeRequest(undefined, "GET")
      const res = await getLeaderboard(req, makeParams("ABC123"))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.entries[0].currentWeekMinutes).toBe(60)
      expect(data.entries[0].prevWeekMinutes).toBe(0) // map'te yok → 0 olmali
    })

    it("olmayan oda kodu ile 404 doner", async () => {
      mockAuth.mockResolvedValue({ user: MOCK_USER })
      mockPrisma.sharedRoom.findUnique.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getLeaderboard(req, makeParams("XXXXXX"))
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe("Room not found")
    })

    it("auth olmadan 401 doner", async () => {
      mockAuth.mockResolvedValue(null)

      const req = makeRequest(undefined, "GET")
      const res = await getLeaderboard(req, makeParams("ABC123"))

      expect(res.status).toBe(401)
      expect(mockPrisma.sharedRoom.findUnique).not.toHaveBeenCalled()
    })
  })
})
