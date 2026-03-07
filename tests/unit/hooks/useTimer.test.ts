// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTimer } from "@/hooks/useTimer"
import { useTimerStore } from "@/stores/timer-store"

// Mock @testing-library/react is available via @testing-library/react
// but we need to ensure the store resets between tests
beforeEach(() => {
  vi.useFakeTimers()
  useTimerStore.setState({
    mode: "POMODORO",
    phase: "FOCUS",
    status: "IDLE",
    secondsLeft: 25 * 60,
    pomodoroCount: 0,
    activeTaskId: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useTimer — Pomodoro", () => {
  it("starts in IDLE status", () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.status).toBe("IDLE")
    expect(result.current.secondsLeft).toBe(25 * 60)
  })

  it("start() sets status to RUNNING", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    expect(result.current.status).toBe("RUNNING")
  })

  it("countdown decrements secondsLeft each second", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(25 * 60 - 3)
  })

  it("pause() stops countdown", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.pause())
    const secondsAfterPause = result.current.secondsLeft
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(secondsAfterPause)
  })

  it("resume() continues countdown after pause", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.pause())
    act(() => result.current.resume())
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.secondsLeft).toBe(25 * 60 - 7)
  })

  it("stop() resets to IDLE", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.stop())
    expect(result.current.status).toBe("IDLE")
    expect(result.current.secondsLeft).toBe(25 * 60)
  })

  it("skipPhase() advances to next phase", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => result.current.skipPhase())
    expect(result.current.phase).toBe("SHORT_BREAK")
    expect(result.current.status).toBe("IDLE")
  })

  it("calls onComplete when phase ends naturally", () => {
    const onComplete = vi.fn()
    useTimerStore.setState({ ...useTimerStore.getState(), secondsLeft: 2 })
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2000))
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "POMODORO", phase: "FOCUS" })
    )
  })

  it("auto-advances to next phase after countdown completes", () => {
    useTimerStore.setState({ ...useTimerStore.getState(), secondsLeft: 1 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.phase).toBe("SHORT_BREAK")
  })
})

describe("useTimer — Flowtime", () => {
  beforeEach(() => {
    useTimerStore.setState({
      mode: "FLOWTIME",
      phase: "FOCUS",
      status: "IDLE",
      secondsLeft: 0,
      pomodoroCount: 0,
      activeTaskId: null,
    })
  })

  it("starts with secondsLeft = 0", () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.secondsLeft).toBe(0)
  })

  it("counts UP each second", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10000))
    expect(result.current.secondsLeft).toBe(10)
  })

  it("resets elapsed to 0 on start()", () => {
    useTimerStore.setState({ ...useTimerStore.getState(), secondsLeft: 300 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(3)
  })

  it("stop() calls onComplete with elapsed duration", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(60000))
    act(() => result.current.stop())
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "FLOWTIME", durationSeconds: 60 })
    )
  })

  it("stop() does not call onComplete when IDLE", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.stop())
    expect(onComplete).not.toHaveBeenCalled()
  })
})
