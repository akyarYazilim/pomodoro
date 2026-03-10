import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mock'lar (import'lardan önce tanımlanmalı) ---

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/client", () => ({
  prisma: {
    coachMessage: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    focusSession: {
      findMany: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock("@/lib/ai/coach", () => ({
  getCoachReply: vi.fn(),
}))

vi.mock("@/lib/ai/prompts", () => ({
  buildSystemPrompt: vi.fn().mockReturnValue("system prompt"),
}))

// --- Mock import'ları (vi.mock çağrılarından sonra) ---

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { getCoachReply } from "@/lib/ai/coach"
import { GET, POST } from "@/app/api/coach/route"
import { GET as getDailyTip } from "@/app/api/coach/daily-tip/route"
import { POST as decompose } from "@/app/api/coach/decompose/route"

// --- Tip güvenli mock referansları ---

const mockAuth = vi.mocked(auth)
const mockCoachMessage = vi.mocked(prisma.coachMessage)
const mockUser = vi.mocked(prisma.user)
const mockFocusSession = vi.mocked(prisma.focusSession)
const mockTask = vi.mocked(prisma.task)
const mockGetCoachReply = vi.mocked(getCoachReply)

// --- Sabitler ---

const AUTHENTICATED_SESSION = {
  user: { id: "user-abc", email: "test@example.com", name: "Test" },
}

// Kullanıcı bağlamı için varsayılan Prisma dönüş değerleri
function setupDefaultUserContext() {
  mockUser.findUnique.mockResolvedValue({
    name: "Test",
    currentStreak: 3,
    longestStreak: 7,
    dailyGoalMinutes: 120,
  } as never)
  mockFocusSession.findMany.mockResolvedValue([
    { actualMinutes: 25 },
    { actualMinutes: 30 },
  ] as never)
  mockTask.findMany.mockResolvedValue([
    { title: "Proje raporu", priority: "HIGH" },
  ] as never)
}

// Request yardımcısı
function makeRequest(
  url: string,
  options: { method?: string; body?: unknown } = {},
): Request {
  const { method = "GET", body } = options
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { "Content-Type": "application/json" }
  }
  return new Request(url, init)
}

// --- Test Suite ---

describe("Coach API (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Konsol gürültüsünü bastır
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  // ================================================================
  // GET /api/coach — Sohbet geçmişi
  // ================================================================
  describe("GET /api/coach — sohbet geçmişi", () => {
    it("kimlik doğrulama olmadan 401 döner", async () => {
      // Auth null dönerse yetkilendirilmemiş kabul edilmeli
      mockAuth.mockResolvedValueOnce(null)

      const req = makeRequest("http://localhost/api/coach")
      const res = await GET()

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    it("kullanıcıya ait mesaj geçmişini döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const fakeMessages = [
        { role: "USER", content: "Merhaba", createdAt: new Date("2026-03-10T10:00:00Z") },
        { role: "ASSISTANT", content: "Nasıl yardımcı olabilirim?", createdAt: new Date("2026-03-10T10:00:01Z") },
      ]
      mockCoachMessage.findMany.mockResolvedValueOnce(fakeMessages as never)

      const res = await GET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.messages).toHaveLength(2)
      expect(body.messages[0].role).toBe("USER")
      expect(body.messages[1].role).toBe("ASSISTANT")

      // findMany sadece USER ve ASSISTANT rollerini sorgular, createdAt asc
      expect(mockCoachMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-abc",
            role: expect.objectContaining({ in: ["USER", "ASSISTANT"] }),
          }),
          orderBy: { createdAt: "asc" },
          take: 40,
        }),
      )
    })

    it("kayıtlı mesaj yoksa boş dizi döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.findMany.mockResolvedValueOnce([] as never)

      const res = await GET()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.messages).toEqual([])
    })
  })

  // ================================================================
  // POST /api/coach — Mesaj gönderme
  // ================================================================
  describe("POST /api/coach — mesaj gönderme", () => {
    it("geçerli mesaj gönderilir, AI cevabı döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.count.mockResolvedValueOnce(5 as never)      // rate limit altında
      mockCoachMessage.create.mockResolvedValue({} as never)
      setupDefaultUserContext()
      mockGetCoachReply.mockResolvedValueOnce("Bugün harika çalışıyorsun!")

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Nasılım?", history: [] },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.reply).toBe("Bugün harika çalışıyorsun!")
    })

    it("kimlik doğrulama olmadan 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null)

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Merhaba" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(401)
    })

    it("boş mesaj ile 400 Geçersiz istek döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Geçersiz istek")
    })

    it("2000 karakter üzeri mesaj ile 400 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const uzunMesaj = "a".repeat(2001)
      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: uzunMesaj },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Geçersiz istek")
    })

    it("saatlik 20 mesaj limitini aşınca 429 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      // count === 20 → limit aşıldı (< 20 değil)
      mockCoachMessage.count.mockResolvedValueOnce(20 as never)

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Yine ben" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(429)
      const body = await res.json()
      expect(body.error).toBe("Saatte en fazla 20 mesaj gönderebilirsiniz.")
    })

    it("rate limit altındaysa mesaj gönderime izin verilir", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.count.mockResolvedValueOnce(19 as never)     // limit = 20, count = 19 → izin var
      mockCoachMessage.create.mockResolvedValue({} as never)
      setupDefaultUserContext()
      mockGetCoachReply.mockResolvedValueOnce("Devam et!")

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "19. mesajım" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(200)
    })

    it("getCoachReply hata fırlatırsa 500 döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.count.mockResolvedValueOnce(0 as never)
      mockCoachMessage.create.mockResolvedValue({} as never)
      setupDefaultUserContext()
      mockGetCoachReply.mockRejectedValueOnce(new Error("OpenAI bağlantı hatası"))

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Selam" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(500)
    })

    it("AI boş cevap dönerse ASSISTANT mesajı DB'ye kaydedilmez", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.count.mockResolvedValueOnce(0 as never)
      mockCoachMessage.create.mockResolvedValue({} as never)
      setupDefaultUserContext()
      mockGetCoachReply.mockResolvedValueOnce("")   // boş reply

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Sessizlik testi" },
      })
      const res = await POST(req as never)

      expect(res.status).toBe(200)
      // İlk create çağrısı USER mesajı için yapılır; ASSISTANT için ikinci create olmaz
      expect(mockCoachMessage.create).toHaveBeenCalledTimes(1)
      expect(mockCoachMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: "USER" }) }),
      )
    })

    it("history mesajları AI'ya doğru şekilde iletilir", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.count.mockResolvedValueOnce(0 as never)
      mockCoachMessage.create.mockResolvedValue({} as never)
      setupDefaultUserContext()
      mockGetCoachReply.mockResolvedValueOnce("Anlıyorum.")

      const history = [
        { role: "user", content: "Önceki mesaj" },
        { role: "assistant", content: "Önceki cevap" },
      ]

      const req = makeRequest("http://localhost/api/coach", {
        method: "POST",
        body: { message: "Yeni mesaj", history },
      })
      await POST(req as never)

      // getCoachReply: history + yeni mesaj birleşik olarak gönderilmeli
      expect(mockGetCoachReply).toHaveBeenCalledWith(
        [
          { role: "user", content: "Önceki mesaj" },
          { role: "assistant", content: "Önceki cevap" },
          { role: "user", content: "Yeni mesaj" },
        ],
        "system prompt",
      )
    })
  })

  // ================================================================
  // GET /api/coach/daily-tip — Günlük ipucu
  // ================================================================
  describe("GET /api/coach/daily-tip — günlük ipucu", () => {
    it("kimlik doğrulama olmadan 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null)

      const res = await getDailyTip()

      expect(res.status).toBe(401)
    })

    it("bugün için cache'lenmiş ipucu varsa DB'den döner, yeni generate etmez", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const cachedTip = {
        id: "tip-1",
        role: "SYSTEM",
        content: "Cache'den gelen ipucu",
        createdAt: new Date(),
      }
      mockCoachMessage.findFirst.mockResolvedValueOnce(cachedTip as never)

      const res = await getDailyTip()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.tip).toBe("Cache'den gelen ipucu")

      // Yeni ipucu generate edilmemeli
      expect(mockGetCoachReply).not.toHaveBeenCalled()
      expect(mockCoachMessage.create).not.toHaveBeenCalled()
    })

    it("cache yoksa yeni ipucu generate eder ve kaydeder", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.findFirst.mockResolvedValueOnce(null)   // cache yok
      setupDefaultUserContext()
      mockGetCoachReply.mockResolvedValueOnce("Bugün 25 dakika odaklanmayı dene.")
      mockCoachMessage.create.mockResolvedValue({} as never)

      const res = await getDailyTip()

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.tip).toBe("Bugün 25 dakika odaklanmayı dene.")

      // Yeni ipucu SYSTEM rolüyle kaydedilmeli
      expect(mockCoachMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-abc",
            role: "SYSTEM",
            content: "Bugün 25 dakika odaklanmayı dene.",
          }),
        }),
      )
    })

    it("generate sırasında hata olursa 500 Sunucu hatası döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockCoachMessage.findFirst.mockResolvedValueOnce(null)
      setupDefaultUserContext()
      mockGetCoachReply.mockRejectedValueOnce(new Error("AI servisi çalışmıyor"))

      const res = await getDailyTip()

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe("Sunucu hatası")
    })
  })

  // ================================================================
  // POST /api/coach/decompose — Görev ayrıştırma
  // ================================================================
  describe("POST /api/coach/decompose — görev ayrıştırma", () => {
    it("kimlik doğrulama olmadan 401 döner", async () => {
      mockAuth.mockResolvedValueOnce(null)

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Bir görev" },
      })
      const res = await decompose(req as never)

      expect(res.status).toBe(401)
    })

    it("geçerli görev adı ile adımlar döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockGetCoachReply.mockResolvedValueOnce(
        "- Araştırma yap\n- Plan oluştur\n- Kodlamaya başla",
      )

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Proje başlat" },
      })
      const res = await decompose(req as never)

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.steps).toHaveLength(3)
      expect(body.steps).toEqual(["Araştırma yap", "Plan oluştur", "Kodlamaya başla"])
    })

    it("boş title ile 400 Geçersiz istek döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "" },
      })
      const res = await decompose(req as never)

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Geçersiz istek")
    })

    it("bullet işaretleri (-, •, *) adımlardan temizlenir", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockGetCoachReply.mockResolvedValueOnce(
        "- Adım bir\n• Adım iki\n* Adım üç",
      )

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Herhangi bir görev" },
      })
      const res = await decompose(req as never)

      const body = await res.json()
      // Prefix karakterleri kaldırılmış olmalı
      expect(body.steps).toEqual(["Adım bir", "Adım iki", "Adım üç"])
    })

    it("5 adım limitini aşan cevaplar 5 ile kısıtlanır", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      // 7 satırlık cevap — max 5 alınmalı
      mockGetCoachReply.mockResolvedValueOnce(
        "- Adım 1\n- Adım 2\n- Adım 3\n- Adım 4\n- Adım 5\n- Adım 6\n- Adım 7",
      )

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Uzun görev" },
      })
      const res = await decompose(req as never)

      const body = await res.json()
      expect(body.steps).toHaveLength(5)
    })

    it("3 karakter veya daha kısa satırlar filtrelenir", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      // "ok" (2 char), "hem" (3 char) → her ikisi de filtrelenmeli (> 3 koşulu)
      mockGetCoachReply.mockResolvedValueOnce(
        "- ok\n- hem\n- Geçerli adım burada",
      )

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Filtre testi" },
      })
      const res = await decompose(req as never)

      const body = await res.json()
      // Sadece > 3 karakter olanlar kalır
      expect(body.steps).toEqual(["Geçerli adım burada"])
    })

    it("getCoachReply boş string dönerse boş steps dizisi döner", async () => {
      mockAuth.mockResolvedValueOnce(AUTHENTICATED_SESSION as never)
      mockGetCoachReply.mockResolvedValueOnce("")

      const req = makeRequest("http://localhost/api/coach/decompose", {
        method: "POST",
        body: { title: "Boş cevap testi" },
      })
      const res = await decompose(req as never)

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.steps).toEqual([])
    })
  })
})
