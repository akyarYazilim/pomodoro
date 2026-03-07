import { describe, it, expect } from "vitest"
import { createTaskSchema, updateTaskSchema } from "@/lib/validators/task"

describe("Task Validators", () => {
  describe("createTaskSchema", () => {
    it("geçerli task oluşturur", () => {
      const result = createTaskSchema.safeParse({
        title: "Proje tamamla",
        priority: "P1",
      })
      expect(result.success).toBe(true)
    })

    it("başlık zorunlu", () => {
      const result = createTaskSchema.safeParse({
        priority: "P1",
      })
      expect(result.success).toBe(false)
    })

    it("boş başlık reddedilir", () => {
      const result = createTaskSchema.safeParse({
        title: "",
        priority: "P1",
      })
      expect(result.success).toBe(false)
    })

    it("geçersiz priority reddedilir", () => {
      const result = createTaskSchema.safeParse({
        title: "Test",
        priority: "P5",
      })
      expect(result.success).toBe(false)
    })

    it("varsayılan priority P3", () => {
      const result = createTaskSchema.safeParse({ title: "Test" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.priority).toBe("P3")
      }
    })

    it("isteğe bağlı alanlar çalışır", () => {
      const result = createTaskSchema.safeParse({
        title: "Test",
        description: "Açıklama",
        estimatedMinutes: 30,
        tags: ["tag1", "tag2"],
        dueDate: new Date().toISOString(),
      })
      expect(result.success).toBe(true)
    })

    it("estimatedMinutes negatif olamaz", () => {
      const result = createTaskSchema.safeParse({
        title: "Test",
        estimatedMinutes: -5,
      })
      expect(result.success).toBe(false)
    })

    it("başlık max 255 karakter", () => {
      const result = createTaskSchema.safeParse({
        title: "a".repeat(256),
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateTaskSchema", () => {
    it("kısmi güncelleme desteklenir", () => {
      const result = updateTaskSchema.safeParse({ title: "Yeni başlık" })
      expect(result.success).toBe(true)
    })

    it("boş obje geçerli", () => {
      const result = updateTaskSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("status geçerli değer alır", () => {
      const result = updateTaskSchema.safeParse({ status: "DONE" })
      expect(result.success).toBe(true)
    })

    it("geçersiz status reddedilir", () => {
      const result = updateTaskSchema.safeParse({ status: "INVALID" })
      expect(result.success).toBe(false)
    })
  })
})
