import { describe, it, expect } from "vitest"
import {
  createFlowtimeState,
  startFocus,
  pauseFocus,
  resumeFocus,
  endFocus,
  addElapsed,
} from "@/lib/timer/flowtime"

describe("Flowtime Timer", () => {
  describe("createFlowtimeState", () => {
    it("başlangıçta IDLE durumunda", () => {
      const state = createFlowtimeState()
      expect(state.status).toBe("IDLE")
      expect(state.elapsedSeconds).toBe(0)
      expect(state.pausedSeconds).toBe(0)
    })

    it("suggestedBreakMinutes başlangıçta 0", () => {
      const state = createFlowtimeState()
      expect(state.suggestedBreakMinutes).toBe(0)
    })
  })

  describe("startFocus", () => {
    it("RUNNING durumuna geçer", () => {
      const state = createFlowtimeState()
      const next = startFocus(state)
      expect(next.status).toBe("RUNNING")
    })

    it("orijinal state'i mutate etmez", () => {
      const state = createFlowtimeState()
      startFocus(state)
      expect(state.status).toBe("IDLE")
    })

    it("startedAt kaydeder", () => {
      const state = createFlowtimeState()
      const next = startFocus(state)
      expect(next.startedAt).not.toBeNull()
    })
  })

  describe("pauseFocus", () => {
    it("PAUSED durumuna geçer", () => {
      const running = startFocus(createFlowtimeState())
      const paused = pauseFocus(running)
      expect(paused.status).toBe("PAUSED")
    })

    it("orijinal state'i mutate etmez", () => {
      const running = startFocus(createFlowtimeState())
      pauseFocus(running)
      expect(running.status).toBe("RUNNING")
    })
  })

  describe("resumeFocus", () => {
    it("RUNNING durumuna geri döner", () => {
      const running = startFocus(createFlowtimeState())
      const paused = pauseFocus(running)
      const resumed = resumeFocus(paused)
      expect(resumed.status).toBe("RUNNING")
    })
  })

  describe("addElapsed", () => {
    it("elapsed seconds artar", () => {
      const state = startFocus(createFlowtimeState())
      const next = addElapsed(state, 60)
      expect(next.elapsedSeconds).toBe(60)
    })

    it("orijinal state'i mutate etmez", () => {
      const state = startFocus(createFlowtimeState())
      addElapsed(state, 60)
      expect(state.elapsedSeconds).toBe(0)
    })
  })

  describe("endFocus", () => {
    it("önerilen mola süresini hesaplar", () => {
      const state = { ...createFlowtimeState(), status: "RUNNING" as const, elapsedSeconds: 25 * 60 }
      const result = endFocus(state)
      expect(result.suggestedBreakMinutes).toBe(5)
    })

    it("90 dakika odaklanma → 18 dakika mola önerir", () => {
      const state = { ...createFlowtimeState(), status: "RUNNING" as const, elapsedSeconds: 90 * 60 }
      const result = endFocus(state)
      expect(result.suggestedBreakMinutes).toBe(18)
    })

    it("COMPLETED durumuna geçer", () => {
      const state = { ...createFlowtimeState(), status: "RUNNING" as const, elapsedSeconds: 25 * 60 }
      const result = endFocus(state)
      expect(result.status).toBe("COMPLETED")
    })
  })
})
