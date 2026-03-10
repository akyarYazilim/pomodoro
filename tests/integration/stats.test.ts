import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock çağrıları hoisted edilir — factory içinde dışarıdan değişken kullanılamaz.
// Bu yüzden mock nesneleri factory içinde tanımlanır, sonra vi.mocked() ile alınır.

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/client", () => ({
  prisma: {
    focusSession: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/lib/utils/streak", () => ({
  updateStreak: vi.fn(),
  isStreakActive: vi.fn(),
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { updateStreak, isStreakActive } from "@/lib/utils/streak"
import { GET as dailyGET } from "@/app/api/stats/daily/route"
import { GET as weeklyGET } from "@/app/api/stats/weekly/route"
import { GET as streakGET, POST as streakPOST } from "@/app/api/stats/streak/route"

const mockAuth = vi.mocked(auth)
const mockFocusSession = vi.mocked(prisma.focusSession)
const mockUser = vi.mocked(prisma.user)
const mockUpdateStreak = vi.mocked(updateStreak)
const mockIsStreakActive = vi.mocked(isStreakActive)

const AUTHENTICATED_SESSION = {
  user: { id: "user-123", email: "test@example.com", name: "Test Kullanıcı" },
  expires: "2099-01-01",
}

describe("Stats API (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────
  // GET /api/stats/daily
  // ─────────────────────────────────────────────────────────
  describe("GET /api/stats/daily — günlük istatistikler", () => {
    it("auth yoksa 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null as never)

      const res = await dailyGET()

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: "Yetkisiz" })
    })

    it("tamamlanmış seanslardan doğru toplamları hesaplar", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const today = new Date()
      today.setHours(8, 0, 0, 0)

      mockFocusSession.findMany.mockResolvedValueOnce([
        { actualMinutes: 25, mode: "POMODORO", startedAt: new Date(today) },
        { actualMinutes: 30, mode: "FLOWTIME", startedAt: new Date(today) },
        { actualMinutes: 25, mode: "POMODORO", startedAt: new Date(today) },
      ] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: 120 } as never)

      const res = await dailyGET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.totalMinutes).toBe(80)
      expect(body.sessionCount).toBe(3)
      expect(body.pomodoroCount).toBe(2)
      expect(body.flowtimeCount).toBe(1)
      expect(body.dailyGoalMinutes).toBe(120)
    })

    it("seans yoksa sıfır değerler döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: 120 } as never)

      const res = await dailyGET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.totalMinutes).toBe(0)
      expect(body.sessionCount).toBe(0)
      expect(body.pomodoroCount).toBe(0)
      expect(body.flowtimeCount).toBe(0)
    })

    it("kullanıcıda dailyGoalMinutes yoksa varsayılan 120 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: null } as never)

      const res = await dailyGET()

      const body = await res.json()
      expect(body.dailyGoalMinutes).toBe(120)
    })

    it("Prisma sorgusu status: COMPLETED filtresiyle çağrılır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([
        { actualMinutes: 25, mode: "POMODORO" },
      ] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: 120 } as never)

      await dailyGET()

      expect(mockFocusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "COMPLETED" }),
        })
      )
    })

    it("Prisma sorgusu doğru userId ile çağrılır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: 120 } as never)

      await dailyGET()

      expect(mockFocusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-123" }),
        })
      )
      expect(mockUser.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
        })
      )
    })

    it("sadece POMODORO seansları pomodoroCount'a yansır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([
        { actualMinutes: 25, mode: "POMODORO" },
        { actualMinutes: 25, mode: "POMODORO" },
        { actualMinutes: 40, mode: "FLOWTIME" },
      ] as never)
      mockUser.findUnique.mockResolvedValueOnce({ dailyGoalMinutes: 120 } as never)

      const res = await dailyGET()
      const body = await res.json()

      expect(body.pomodoroCount).toBe(2)
      expect(body.flowtimeCount).toBe(1)
    })
  })

  // ─────────────────────────────────────────────────────────
  // GET /api/stats/weekly
  // ─────────────────────────────────────────────────────────
  describe("GET /api/stats/weekly — haftalık istatistikler", () => {
    it("auth yoksa 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null as never)

      const res = await weeklyGET()

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: "Yetkisiz" })
    })

    it("son 7 güne ait dizi döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)

      const res = await weeklyGET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body.days)).toBe(true)
      expect(body.days).toHaveLength(7)
    })

    it("her günlük kayıt date ve minutes içerir", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)

      const res = await weeklyGET()
      const body = await res.json()

      for (const day of body.days) {
        expect(day).toHaveProperty("date")
        expect(day).toHaveProperty("minutes")
        expect(typeof day.date).toBe("string")
        expect(typeof day.minutes).toBe("number")
        // ISO tarih formatı YYYY-MM-DD
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    })

    it("bugünün seansları doğru güne toplanır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      // Route, tarih karşılaştırmasını setHours(0,0,0,0) + toISOString() ile yapar.
      // Test de aynı yöntemi kullanmalı; aksi hâlde UTC offset nedeniyle farklı tarihler üretilir.
      const todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)
      const todayStr = todayMidnight.toISOString().split("T")[0]

      // startedAt olarak bugün herhangi bir saati geçirebiliriz;
      // route .setHours(0,0,0,0) ile normalize eder.
      const sessionDate = new Date(todayMidnight)
      sessionDate.setHours(10, 0, 0, 0)

      mockFocusSession.findMany.mockResolvedValueOnce([
        { startedAt: new Date(sessionDate), actualMinutes: 45 },
        { startedAt: new Date(sessionDate), actualMinutes: 25 },
      ] as never)

      const res = await weeklyGET()
      const body = await res.json()

      const todayEntry = body.days.find(
        (d: { date: string; minutes: number }) => d.date === todayStr
      )
      expect(todayEntry?.minutes).toBe(70)
    })

    it("currentWeekTotal ve previousWeekTotal döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)

      const res = await weeklyGET()
      const body = await res.json()

      expect(body).toHaveProperty("currentWeekTotal")
      expect(body).toHaveProperty("previousWeekTotal")
      expect(typeof body.currentWeekTotal).toBe("number")
      expect(typeof body.previousWeekTotal).toBe("number")
    })

    it("seans yoksa tüm günler 0 ve toplamlar 0 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)

      const res = await weeklyGET()
      const body = await res.json()

      const allZero = body.days.every(
        (d: { minutes: number }) => d.minutes === 0
      )
      expect(allZero).toBe(true)
      expect(body.currentWeekTotal).toBe(0)
      expect(body.previousWeekTotal).toBe(0)
    })

    it("Prisma sorgusu doğru userId ve COMPLETED filtresiyle çağrılır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockFocusSession.findMany.mockResolvedValueOnce([] as never)

      await weeklyGET()

      expect(mockFocusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-123",
            status: "COMPLETED",
          }),
        })
      )
    })
  })

  // ─────────────────────────────────────────────────────────
  // GET /api/stats/streak
  // ─────────────────────────────────────────────────────────
  describe("GET /api/stats/streak — streak bilgisi", () => {
    it("auth yoksa 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null as never)

      const res = await streakGET()

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: "Yetkisiz" })
    })

    it("kullanıcı bulunamazsa 404 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce(null)

      const res = await streakGET()

      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({ error: "Kullanıcı bulunamadı" })
    })

    it("currentStreak ve longestStreak döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 5,
        longestStreak: 12,
        lastActiveDate: new Date("2026-03-09"),
        streakFreezeCount: 1,
        lastStreakFreezeUsed: null,
      } as never)

      const res = await streakGET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.currentStreak).toBe(5)
      expect(body.longestStreak).toBe(12)
    })

    it("streakFreezeCount döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 3,
        longestStreak: 7,
        lastActiveDate: new Date("2026-03-09"),
        streakFreezeCount: 1,
        lastStreakFreezeUsed: null,
      } as never)

      const res = await streakGET()
      const body = await res.json()

      expect(body).toHaveProperty("streakFreezeCount")
      expect(body.streakFreezeCount).toBe(1)
    })

    it("lastActiveDate response'da bulunur", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 3,
        longestStreak: 7,
        lastActiveDate: new Date("2026-03-09"),
        streakFreezeCount: 1,
        lastStreakFreezeUsed: null,
      } as never)

      const res = await streakGET()
      const body = await res.json()

      expect(body).toHaveProperty("lastActiveDate")
    })

    it("freeze sayısı 0 iken regen süresi dolmamışsa güncelleme yapılmaz", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      // lastStreakFreezeUsed dün → 7 günden az, regen olmaz
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 2,
        longestStreak: 5,
        lastActiveDate: new Date(),
        streakFreezeCount: 0,
        lastStreakFreezeUsed: yesterday,
      } as never)

      const res = await streakGET()
      const body = await res.json()

      expect(body.streakFreezeCount).toBe(0)
      expect(mockUser.update).not.toHaveBeenCalled()
    })

    it("freeze sayısı 0 iken 7+ gün geçtiyse regen olur ve update çağrılır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      // lastStreakFreezeUsed 10 gün önce → regen tetiklenmeli
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 2,
        longestStreak: 5,
        lastActiveDate: new Date(),
        streakFreezeCount: 0,
        lastStreakFreezeUsed: tenDaysAgo,
      } as never)
      mockUser.update.mockResolvedValueOnce({ streakFreezeCount: 1 } as never)

      const res = await streakGET()
      const body = await res.json()

      expect(body.streakFreezeCount).toBe(1)
      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: { streakFreezeCount: 1 },
        })
      )
    })

    it("zaten max freeze varsa regen çalışmaz", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      // streakFreezeCount zaten 1 (MAX_FREEZE_COUNT) → regen koşulu `< MAX` sağlanmaz
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 3,
        longestStreak: 8,
        lastActiveDate: new Date(),
        streakFreezeCount: 1,
        lastStreakFreezeUsed: tenDaysAgo,
      } as never)

      await streakGET()

      expect(mockUser.update).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────────────────
  // POST /api/stats/streak
  // ─────────────────────────────────────────────────────────
  describe("POST /api/stats/streak — streak güncelleme", () => {
    it("auth yoksa 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null as never)

      const res = await streakPOST()

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: "Yetkisiz" })
    })

    it("kullanıcı bulunamazsa 404 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce(null)

      const res = await streakPOST()

      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toEqual({ error: "Kullanıcı bulunamadı" })
    })

    it("normal senaryo — streak güncellenir, usedFreeze: false döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 4,
        longestStreak: 10,
        lastActiveDate: new Date("2026-03-09"),
        streakFreezeCount: 1,
        lastStreakFreezeUsed: null,
      } as never)
      mockIsStreakActive.mockReturnValueOnce(true)
      mockUpdateStreak.mockReturnValueOnce({
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date("2026-03-10"),
      })
      mockUser.update.mockResolvedValueOnce({
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date("2026-03-10"),
        streakFreezeCount: 1,
      } as never)

      const res = await streakPOST()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.currentStreak).toBe(5)
      expect(body.usedFreeze).toBe(false)
    })

    it("streak kırılacakken freeze kullanılır, usedFreeze: true döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      // lastActiveDate 3 gün önce — streak kırık, aktif değil
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 7,
        longestStreak: 15,
        lastActiveDate: threeDaysAgo,
        streakFreezeCount: 1,
        lastStreakFreezeUsed: null,
      } as never)
      mockIsStreakActive.mockReturnValueOnce(false)
      mockUser.update.mockResolvedValueOnce({
        currentStreak: 7,
        longestStreak: 15,
        lastActiveDate: new Date(),
        streakFreezeCount: 0,
      } as never)

      const res = await streakPOST()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.usedFreeze).toBe(true)
      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ streakFreezeCount: 0 }),
        })
      )
    })

    it("güncellenen streak DB'ye kaydedilir ve response'da döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date("2026-03-09"),
        streakFreezeCount: 0,
        lastStreakFreezeUsed: null,
      } as never)
      mockIsStreakActive.mockReturnValueOnce(true)
      mockUpdateStreak.mockReturnValueOnce({
        currentStreak: 2,
        longestStreak: 2,
        lastActiveDate: new Date("2026-03-10"),
      })
      mockUser.update.mockResolvedValueOnce({
        currentStreak: 2,
        longestStreak: 2,
        lastActiveDate: new Date("2026-03-10"),
        streakFreezeCount: 0,
      } as never)

      const res = await streakPOST()
      const body = await res.json()

      expect(mockUser.update).toHaveBeenCalledOnce()
      expect(body.currentStreak).toBe(2)
      expect(body.longestStreak).toBe(2)
    })

    it("freeze yokken streak kırılırsa updateStreak normal akışı çalışır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      // freeze yok (0) → freeze koşulu sağlanamaz, updateStreak çalışır (streak sıfırlanır)
      mockUser.findUnique.mockResolvedValueOnce({
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: threeDaysAgo,
        streakFreezeCount: 0,
        lastStreakFreezeUsed: null,
      } as never)
      mockIsStreakActive.mockReturnValueOnce(false)
      mockUpdateStreak.mockReturnValueOnce({
        currentStreak: 1,
        longestStreak: 10,
        lastActiveDate: new Date(),
      })
      mockUser.update.mockResolvedValueOnce({
        currentStreak: 1,
        longestStreak: 10,
        lastActiveDate: new Date(),
        streakFreezeCount: 0,
      } as never)

      const res = await streakPOST()
      const body = await res.json()

      expect(body.usedFreeze).toBe(false)
      expect(mockUpdateStreak).toHaveBeenCalledOnce()
    })
  })
})
