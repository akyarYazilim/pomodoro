import { describe, it, expect } from "vitest"
import { createSessionSchema, updateSessionSchema } from "@/lib/validators/session"

describe("Session Validators", () => {
  describe("createSessionSchema", () => {
    it("Pomodoro oturumu geçerli", () => {
      const result = createSessionSchema.safeParse({ mode: "POMODORO" })
      expect(result.success).toBe(true)
    })

    it("Flowtime oturumu geçerli", () => {
      const result = createSessionSchema.safeParse({ mode: "FLOWTIME" })
      expect(result.success).toBe(true)
    })

    it("geçersiz mode reddedilir", () => {
      const result = createSessionSchema.safeParse({ mode: "INVALID" })
      expect(result.success).toBe(false)
    })

    it("mode zorunlu", () => {
      const result = createSessionSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it("isteğe bağlı taskId kabul edilir", () => {
      const result = createSessionSchema.safeParse({
        mode: "POMODORO",
        taskId: "cuid123",
      })
      expect(result.success).toBe(true)
    })

    it("plannedMinutes pozitif olmalı", () => {
      const result = createSessionSchema.safeParse({
        mode: "POMODORO",
        plannedMinutes: -5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateSessionSchema", () => {
    it("COMPLETED status geçerli", () => {
      const result = updateSessionSchema.safeParse({ status: "COMPLETED" })
      expect(result.success).toBe(true)
    })

    it("CANCELLED status geçerli", () => {
      const result = updateSessionSchema.safeParse({ status: "CANCELLED" })
      expect(result.success).toBe(true)
    })

    it("geçersiz status reddedilir", () => {
      const result = updateSessionSchema.safeParse({ status: "DONE" })
      expect(result.success).toBe(false)
    })

    it("status zorunlu", () => {
      const result = updateSessionSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it("mood 1-5 arasında olmalı", () => {
      expect(updateSessionSchema.safeParse({ status: "COMPLETED", mood: 0 }).success).toBe(false)
      expect(updateSessionSchema.safeParse({ status: "COMPLETED", mood: 6 }).success).toBe(false)
      expect(updateSessionSchema.safeParse({ status: "COMPLETED", mood: 3 }).success).toBe(true)
    })

    it("actualMinutes negatif olamaz", () => {
      const result = updateSessionSchema.safeParse({
        status: "COMPLETED",
        actualMinutes: -1,
      })
      expect(result.success).toBe(false)
    })
  })
})
