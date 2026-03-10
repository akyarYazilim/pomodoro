import { describe, it, expect } from "vitest"
import {
  createPomodoroState,
  tick,
  getNextPhase,
  isBreakPhase,
  advancePhase,
  getPhaseSeconds,
} from "@/lib/timer/pomodoro"

describe("Pomodoro Timer", () => {
  describe("createPomodoroState", () => {
    it("varsayılan state 25 dakika odaklanma ile başlar", () => {
      const state = createPomodoroState()
      expect(state.secondsLeft).toBe(25 * 60)
      expect(state.phase).toBe("FOCUS")
      expect(state.pomodoroCount).toBe(0)
    })

    it("özel dakika ile başlatılabilir", () => {
      const state = createPomodoroState({ pomodoroMinutes: 50 })
      expect(state.secondsLeft).toBe(50 * 60)
    })

    it("başlangıç durumu IDLE", () => {
      const state = createPomodoroState()
      expect(state.status).toBe("IDLE")
      expect(state.completed).toBe(false)
    })
  })

  describe("tick", () => {
    it("her tick'te 1 saniye azaltır", () => {
      const state = createPomodoroState()
      const next = tick(state)
      expect(next.secondsLeft).toBe(state.secondsLeft - 1)
    })

    it("orijinal state'i mutate etmez (immutable)", () => {
      const state = createPomodoroState()
      const next = tick(state)
      expect(state.secondsLeft).toBe(25 * 60)
      expect(next).not.toBe(state)
    })

    it("0'a gelince tamamlandı işaretler", () => {
      const state = { ...createPomodoroState(), secondsLeft: 1 }
      const next = tick(state)
      expect(next.completed).toBe(true)
    })

    it("negatife düşmez", () => {
      const state = { ...createPomodoroState(), secondsLeft: 0 }
      const next = tick(state)
      expect(next.secondsLeft).toBe(0)
    })
  })

  describe("getNextPhase", () => {
    it("4. pomodoro sonrası uzun mola verir", () => {
      const state = { ...createPomodoroState(), phase: "FOCUS" as const, pomodoroCount: 3 }
      expect(getNextPhase(state)).toBe("LONG_BREAK")
    })

    it("kısa mola sonrası tekrar odaklanma geçer", () => {
      const state = { ...createPomodoroState(), phase: "SHORT_BREAK" as const }
      expect(getNextPhase(state)).toBe("FOCUS")
    })

    it("uzun mola sonrası odaklanmaya döner", () => {
      const state = { ...createPomodoroState(), phase: "LONG_BREAK" as const, pomodoroCount: 4 }
      const next = getNextPhase(state)
      expect(next).toBe("FOCUS")
    })

    it("1-3. pomodoro sonrası kısa mola verir", () => {
      const state = { ...createPomodoroState(), phase: "FOCUS" as const, pomodoroCount: 0 }
      expect(getNextPhase(state)).toBe("SHORT_BREAK")
    })
  })

  describe("isBreakPhase", () => {
    it("kısa mola → true", () => {
      expect(isBreakPhase("SHORT_BREAK")).toBe(true)
    })

    it("uzun mola → true", () => {
      expect(isBreakPhase("LONG_BREAK")).toBe(true)
    })

    it("odaklanma → false", () => {
      expect(isBreakPhase("FOCUS")).toBe(false)
    })
  })

  describe("advancePhase", () => {
    it("FOCUS → SHORT_BREAK geçer ve saniyeyi günceller", () => {
      const state = createPomodoroState()
      const next = advancePhase(state)
      expect(next.phase).toBe("SHORT_BREAK")
      expect(next.secondsLeft).toBe(5 * 60)
      expect(next.pomodoroCount).toBe(1)
    })

    it("3. pomodoro sonrası FOCUS → LONG_BREAK geçer", () => {
      const state = { ...createPomodoroState(), phase: "FOCUS" as const, pomodoroCount: 3 }
      const next = advancePhase(state)
      expect(next.phase).toBe("LONG_BREAK")
      expect(next.secondsLeft).toBe(15 * 60)
    })

    it("SHORT_BREAK → FOCUS geçer, pomodoroCount değişmez", () => {
      const state = { ...createPomodoroState(), phase: "SHORT_BREAK" as const, pomodoroCount: 1 }
      const next = advancePhase(state)
      expect(next.phase).toBe("FOCUS")
      expect(next.secondsLeft).toBe(25 * 60)
      expect(next.pomodoroCount).toBe(1)
    })

    it("LONG_BREAK → FOCUS geçer ve pomodoroCount sıfırlanır", () => {
      const state = { ...createPomodoroState(), phase: "LONG_BREAK" as const, pomodoroCount: 4 }
      const next = advancePhase(state)
      expect(next.phase).toBe("FOCUS")
      expect(next.pomodoroCount).toBe(0)
    })

    it("özel config ile doğru süreyi kullanır", () => {
      const state = createPomodoroState()
      const next = advancePhase(state, { shortBreakMinutes: 10 })
      expect(next.phase).toBe("SHORT_BREAK")
      expect(next.secondsLeft).toBe(10 * 60)
    })

    it("completed false'a sıfırlar, status IDLE olur", () => {
      const state = { ...createPomodoroState(), completed: true, status: "RUNNING" as const }
      const next = advancePhase(state)
      expect(next.completed).toBe(false)
      expect(next.status).toBe("IDLE")
    })

    it("orijinal state'i mutate etmez", () => {
      const state = createPomodoroState()
      advancePhase(state)
      expect(state.phase).toBe("FOCUS")
    })
  })

  describe("getPhaseSeconds", () => {
    it("FOCUS → 25 * 60", () => {
      expect(getPhaseSeconds("FOCUS")).toBe(25 * 60)
    })

    it("SHORT_BREAK → 5 * 60", () => {
      expect(getPhaseSeconds("SHORT_BREAK")).toBe(5 * 60)
    })

    it("LONG_BREAK → 15 * 60", () => {
      expect(getPhaseSeconds("LONG_BREAK")).toBe(15 * 60)
    })

    it("özel config ile doğru saniyeyi döner", () => {
      expect(getPhaseSeconds("FOCUS", { pomodoroMinutes: 50 })).toBe(50 * 60)
      expect(getPhaseSeconds("SHORT_BREAK", { shortBreakMinutes: 10 })).toBe(10 * 60)
      expect(getPhaseSeconds("LONG_BREAK", { longBreakMinutes: 20 })).toBe(20 * 60)
    })
  })
})
