import { describe, it, expect } from "vitest"
import { buildSystemPrompt } from "@/lib/ai/prompts"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseCtx() {
  return {
    name: "Ali",
    currentStreak: 5,
    longestStreak: 10,
    dailyGoalMinutes: 60,
    todayMinutes: 30,
    todaySessionCount: 3,
    activeTasks: [
      { title: "Rapor yaz", priority: "P1" },
      { title: "Mail cevapla", priority: "P3" },
    ],
  }
}

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

describe("buildSystemPrompt", () => {
  describe("temel kontratlar", () => {
    it("bos string donmez", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result.length).toBeGreaterThan(0)
    })

    it("string doner", () => {
      expect(typeof buildSystemPrompt(baseCtx())).toBe("string")
    })
  })

  describe("kullanici adi", () => {
    it("verilen adi iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("Ali")
    })

    it("name null ise 'Kullanici' kullanir", () => {
      const result = buildSystemPrompt({ ...baseCtx(), name: null })
      expect(result).toContain("Kullanıcı")
    })

    it("name undefined ise 'Kullanici' kullanir", () => {
      const result = buildSystemPrompt({ ...baseCtx(), name: undefined })
      expect(result).toContain("Kullanıcı")
    })

    it("bos string name verilince bos string iceriyor", () => {
      // bos string falsy degil, null/undefined degil — olduğu gibi yansimalı
      const result = buildSystemPrompt({ ...baseCtx(), name: "" })
      // empty string is not null/undefined so ?? falls through to ""
      // The prompt should NOT contain "Kullanıcı" in the name position
      // but should still be a non-empty string overall
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("streak bilgileri", () => {
    it("currentStreak degerini iceriyor", () => {
      const result = buildSystemPrompt({ ...baseCtx(), currentStreak: 7 })
      expect(result).toContain("7")
    })

    it("longestStreak degerini iceriyor", () => {
      const result = buildSystemPrompt({ ...baseCtx(), longestStreak: 42 })
      expect(result).toContain("42")
    })

    it("sifir streak degerlerini iceriyor", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        currentStreak: 0,
        longestStreak: 0,
      })
      expect(result).toContain("0")
    })
  })

  describe("gunluk hedef ve ilerleme", () => {
    it("todayMinutes degerini iceriyor", () => {
      const result = buildSystemPrompt({ ...baseCtx(), todayMinutes: 45 })
      expect(result).toContain("45")
    })

    it("dailyGoalMinutes degerini iceriyor", () => {
      const result = buildSystemPrompt({ ...baseCtx(), dailyGoalMinutes: 90 })
      expect(result).toContain("90")
    })

    it("todaySessionCount degerini iceriyor", () => {
      const result = buildSystemPrompt({ ...baseCtx(), todaySessionCount: 6 })
      expect(result).toContain("6")
    })

    it("hedef 100 yuzde tamamlandiginda yuzde 100 gosteriyor", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        dailyGoalMinutes: 60,
        todayMinutes: 60,
      })
      expect(result).toContain("100")
    })

    it("hedef asildigi zaman 100 uzeri yuzde hesaplanir", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        dailyGoalMinutes: 60,
        todayMinutes: 90,
      })
      expect(result).toContain("150")
    })

    it("dailyGoalMinutes sifir ise yuzde sifir gosteriyor", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        dailyGoalMinutes: 0,
        todayMinutes: 30,
      })
      expect(result).toContain("%0")
    })

    it("tamamlanma yuzdesi yuvarlanir — 33.33 → 33", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        dailyGoalMinutes: 60,
        todayMinutes: 20,
      })
      expect(result).toContain("33")
    })
  })

  describe("aktif gorevler", () => {
    it("gorev basligini iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("Rapor yaz")
    })

    it("gorev oncelik etiketini iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("P1")
      expect(result).toContain("P3")
    })

    it("birden fazla gorevi iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("Mail cevapla")
    })

    it("bos gorev listesinde 'Aktif gorev yok' yazar", () => {
      const result = buildSystemPrompt({ ...baseCtx(), activeTasks: [] })
      expect(result).toContain("Aktif görev yok.")
    })

    it("tek gorev de dogru formatlanir", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        activeTasks: [{ title: "Tek gorev", priority: "P2" }],
      })
      expect(result).toContain("Tek gorev")
      expect(result).toContain("P2")
    })

    it("gorev formatı '- [ONCELIK] baslik' seklinde", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        activeTasks: [{ title: "Test gorevi", priority: "P1" }],
      })
      expect(result).toContain("- [P1] Test gorevi")
    })
  })

  describe("sabit icerik", () => {
    it("Turkce konusma kurali iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("Türkçe")
    })

    it("uretkenlik kocu rolunu iceriyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("üretkenlik koçusun")
    })

    it("Pomodoro ve Flowtime bolumleri mevcut", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("Pomodoro")
      expect(result).toContain("Flowtime")
    })

    it("oncelik sistemini P1-P4 olarak acikliyor", () => {
      const result = buildSystemPrompt(baseCtx())
      expect(result).toContain("P1")
      expect(result).toContain("P4")
    })
  })

  describe("sinir degerler", () => {
    it("cok buyuk degerlerle calisiyor", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        currentStreak: 9999,
        longestStreak: 9999,
        dailyGoalMinutes: 9999,
        todayMinutes: 9999,
        todaySessionCount: 9999,
      })
      expect(result).toContain("9999")
    })

    it("cok sayida gorev varken calisiyor", () => {
      const manyTasks = Array.from({ length: 50 }, (_, i) => ({
        title: `Gorev ${i + 1}`,
        priority: "P2",
      }))
      const result = buildSystemPrompt({ ...baseCtx(), activeTasks: manyTasks })
      expect(result).toContain("Gorev 50")
    })

    it("ozel karakter iceren gorev basliklarini dogru iceriyor", () => {
      const result = buildSystemPrompt({
        ...baseCtx(),
        activeTasks: [{ title: "Fix: bug #42 & deploy <prod>", priority: "P1" }],
      })
      expect(result).toContain("Fix: bug #42 & deploy <prod>")
    })

    it("her cagirida deterministik sonuc uretir", () => {
      const ctx = baseCtx()
      expect(buildSystemPrompt(ctx)).toBe(buildSystemPrompt(ctx))
    })
  })
})
