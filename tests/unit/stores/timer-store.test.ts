import { describe, it, expect, beforeEach } from "vitest"
import { useTimerStore } from "@/stores/timer-store"

describe("Timer Store", () => {
  beforeEach(() => {
    useTimerStore.setState({
      mode: "POMODORO",
      phase: "FOCUS",
      status: "IDLE",
      secondsLeft: 25 * 60,
      pomodoroCount: 0,
      activeTaskId: null,
    })
  })

  it("başlangıç state doğru", () => {
    const state = useTimerStore.getState()
    expect(state.mode).toBe("POMODORO")
    expect(state.phase).toBe("FOCUS")
    expect(state.status).toBe("IDLE")
    expect(state.secondsLeft).toBe(25 * 60)
    expect(state.pomodoroCount).toBe(0)
    expect(state.activeTaskId).toBeNull()
  })

  describe("setMode", () => {
    it("mod değiştirir", () => {
      useTimerStore.getState().setMode("FLOWTIME")
      expect(useTimerStore.getState().mode).toBe("FLOWTIME")
    })

    it("diğer state alanları değişmez", () => {
      const before = useTimerStore.getState().secondsLeft
      useTimerStore.getState().setMode("FLOWTIME")
      expect(useTimerStore.getState().secondsLeft).toBe(before)
    })
  })

  describe("setStatus", () => {
    it("status değiştirir", () => {
      useTimerStore.getState().setStatus("RUNNING")
      expect(useTimerStore.getState().status).toBe("RUNNING")
    })
  })

  describe("setSecondsLeft", () => {
    it("saniyeyi günceller", () => {
      useTimerStore.getState().setSecondsLeft(300)
      expect(useTimerStore.getState().secondsLeft).toBe(300)
    })
  })

  describe("setActiveTask", () => {
    it("aktif görevi atar", () => {
      useTimerStore.getState().setActiveTask("task-123")
      expect(useTimerStore.getState().activeTaskId).toBe("task-123")
    })

    it("null atanabilir", () => {
      useTimerStore.getState().setActiveTask("task-123")
      useTimerStore.getState().setActiveTask(null)
      expect(useTimerStore.getState().activeTaskId).toBeNull()
    })
  })

  describe("reset", () => {
    it("status IDLE olur", () => {
      useTimerStore.getState().setStatus("RUNNING")
      useTimerStore.getState().reset()
      expect(useTimerStore.getState().status).toBe("IDLE")
    })

    it("Pomodoro modunda reset 25 dakikaya döner", () => {
      useTimerStore.getState().setSecondsLeft(100)
      useTimerStore.getState().reset()
      expect(useTimerStore.getState().secondsLeft).toBe(25 * 60)
    })
  })

  describe("nextPhase", () => {
    it("FOCUS → SHORT_BREAK geçer", () => {
      useTimerStore.getState().nextPhase()
      expect(useTimerStore.getState().phase).toBe("SHORT_BREAK")
    })

    it("SHORT_BREAK → FOCUS geçer", () => {
      useTimerStore.setState({ phase: "SHORT_BREAK" })
      useTimerStore.getState().nextPhase()
      expect(useTimerStore.getState().phase).toBe("FOCUS")
    })

    it("4. pomodoro sonrası LONG_BREAK geçer", () => {
      useTimerStore.setState({ phase: "FOCUS", pomodoroCount: 3 })
      useTimerStore.getState().nextPhase()
      expect(useTimerStore.getState().phase).toBe("LONG_BREAK")
    })
  })
})
