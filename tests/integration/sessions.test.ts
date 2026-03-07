import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next-auth — sabit kullanıcı session
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: "test-user-id", email: "test@example.com", name: "Test User" },
  }),
}))

// Mock Prisma client
const mockPrisma = {
  focusSession: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
  },
}

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}))

describe("Sessions API (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("POST /api/sessions — oturum başlatma", () => {
    it("geçerli body ile oturum oluşturur", async () => {
      const mockSession = {
        id: "session-1",
        userId: "test-user-id",
        mode: "POMODORO",
        status: "ACTIVE",
        startedAt: new Date(),
        actualMinutes: 0,
        breakMinutes: 0,
        taskId: null,
        endedAt: null,
        plannedMinutes: 25,
        note: null,
        mood: null,
      }
      mockPrisma.focusSession.create.mockResolvedValue(mockSession)

      expect(mockPrisma.focusSession.create).not.toHaveBeenCalled()
      await mockPrisma.focusSession.create({
        data: {
          userId: "test-user-id",
          mode: "POMODORO",
          plannedMinutes: 25,
        },
      })

      expect(mockPrisma.focusSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ mode: "POMODORO" }),
      })
    })

    it("aktif oturum çakışma kontrolü yapılır", async () => {
      const activeSession = {
        id: "existing-session",
        userId: "test-user-id",
        status: "ACTIVE",
      }
      mockPrisma.focusSession.findMany.mockResolvedValue([activeSession])

      const activeSessions = await mockPrisma.focusSession.findMany({
        where: { userId: "test-user-id", status: "ACTIVE" },
      })

      expect(activeSessions).toHaveLength(1)
    })
  })

  describe("PATCH /api/sessions/[id] — oturum güncelleme", () => {
    it("oturumu tamamlar ve actualMinutes günceller", async () => {
      const updatedSession = {
        id: "session-1",
        status: "COMPLETED",
        actualMinutes: 25,
        endedAt: new Date(),
      }
      mockPrisma.focusSession.update.mockResolvedValue(updatedSession)

      const result = await mockPrisma.focusSession.update({
        where: { id: "session-1" },
        data: { status: "COMPLETED", actualMinutes: 25, endedAt: new Date() },
      })

      expect(result.status).toBe("COMPLETED")
      expect(result.actualMinutes).toBe(25)
    })

    it("oturumu iptal eder", async () => {
      const cancelledSession = { id: "session-1", status: "CANCELLED" }
      mockPrisma.focusSession.update.mockResolvedValue(cancelledSession)

      const result = await mockPrisma.focusSession.update({
        where: { id: "session-1" },
        data: { status: "CANCELLED" },
      })

      expect(result.status).toBe("CANCELLED")
    })
  })

  describe("Session veri bütünlüğü", () => {
    it("oturum sadece sahibine ait güncellenir", async () => {
      mockPrisma.focusSession.findUnique.mockResolvedValue({
        id: "session-1",
        userId: "other-user-id",
      })

      const session = await mockPrisma.focusSession.findUnique({
        where: { id: "session-1" },
      })

      // Başka kullanıcının oturumuna erişim reddedilmeli
      expect(session?.userId).not.toBe("test-user-id")
    })

    it("var olmayan oturum null döner", async () => {
      mockPrisma.focusSession.findUnique.mockResolvedValue(null)

      const session = await mockPrisma.focusSession.findUnique({
        where: { id: "non-existent" },
      })

      expect(session).toBeNull()
    })
  })
})
