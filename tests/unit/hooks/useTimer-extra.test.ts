// @vitest-environment jsdom
import { vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTimer } from "@/hooks/useTimer"
import { useTimerStore } from "@/stores/timer-store"

vi.mock("@/lib/utils/sounds", () => ({
  sounds: {
    workComplete: vi.fn(),
    breakEnd: vi.fn(),
    taskDone: vi.fn(),
  },
}))

import { sounds } from "@/lib/utils/sounds"

const DEFAULT_POMODORO_STATE = {
  mode: "POMODORO" as const,
  phase: "FOCUS" as const,
  status: "IDLE" as const,
  secondsLeft: 25 * 60,
  pomodoroCount: 0,
  activeTaskId: null,
  config: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  },
  initialized: false,
  deepFocusMode: false,
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  useTimerStore.setState(DEFAULT_POMODORO_STATE)
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Basic controls
// ---------------------------------------------------------------------------

describe("useTimer — start/pause/resume/stop/skip controls", () => {
  it("start() sets status to RUNNING", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    expect(result.current.status).toBe("RUNNING")
  })

  it("pause() sets status to PAUSED", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => result.current.pause())
    expect(result.current.status).toBe("PAUSED")
  })

  it("resume() sets status back to RUNNING after pause", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => result.current.pause())
    act(() => result.current.resume())
    expect(result.current.status).toBe("RUNNING")
  })

  it("stop() resets to IDLE and restores secondsLeft", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.stop())
    expect(result.current.status).toBe("IDLE")
    expect(result.current.secondsLeft).toBe(25 * 60)
  })

  it("stop() in POMODORO mode does not call onComplete", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.stop())
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("skipPhase() calls nextPhase and moves to SHORT_BREAK", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => result.current.skipPhase())
    expect(result.current.phase).toBe("SHORT_BREAK")
    expect(result.current.status).toBe("IDLE")
  })
})

// ---------------------------------------------------------------------------
// Tick / countdown
// ---------------------------------------------------------------------------

describe("useTimer — Pomodoro tick", () => {
  it("secondsLeft decrements each second when RUNNING", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(25 * 60 - 3)
  })

  it("calls onComplete when countdown reaches zero", () => {
    const onComplete = vi.fn()
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 2 })
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2000))
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "POMODORO", phase: "FOCUS" })
    )
  })

  it("auto-advances to SHORT_BREAK after FOCUS countdown ends", () => {
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 1 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.phase).toBe("SHORT_BREAK")
  })
})

// ---------------------------------------------------------------------------
// quickStart
// ---------------------------------------------------------------------------

describe("useTimer — quickStart", () => {
  it("quickStart(5) sets secondsLeft to 5 minutes and status to RUNNING", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.quickStart(5))
    expect(result.current.secondsLeft).toBe(5 * 60)
    expect(result.current.status).toBe("RUNNING")
  })

  it("quickStart(10) sets secondsLeft to 10 minutes and status to RUNNING", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.quickStart(10))
    expect(result.current.secondsLeft).toBe(10 * 60)
    expect(result.current.status).toBe("RUNNING")
  })

  it("quickStart(1) immediately counts down", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.quickStart(1))
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(60 - 3)
  })

  it("quickStart works from PAUSED state without calling start first", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => result.current.pause())
    act(() => result.current.quickStart(3))
    expect(result.current.status).toBe("RUNNING")
    expect(result.current.secondsLeft).toBe(3 * 60)
  })
})

// ---------------------------------------------------------------------------
// Flowtime mode
// ---------------------------------------------------------------------------

describe("useTimer — Flowtime", () => {
  beforeEach(() => {
    useTimerStore.setState({
      ...DEFAULT_POMODORO_STATE,
      mode: "FLOWTIME" as const,
      secondsLeft: 0,
    })
  })

  it("counts UP each second", () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10000))
    expect(result.current.secondsLeft).toBe(10)
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

  it("stop() resets to IDLE after calling onComplete", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(onComplete))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.stop())
    expect(result.current.status).toBe("IDLE")
  })
})

// ---------------------------------------------------------------------------
// breakEnd sound
// ---------------------------------------------------------------------------

describe("useTimer — breakEnd sound", () => {
  it("breakEnd plays when SHORT_BREAK countdown ends", () => {
    useTimerStore.setState({
      ...DEFAULT_POMODORO_STATE,
      phase: "SHORT_BREAK" as const,
      secondsLeft: 1,
    })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1000))
    expect(sounds.breakEnd).toHaveBeenCalledOnce()
  })

  it("breakEnd plays when LONG_BREAK countdown ends", () => {
    useTimerStore.setState({
      ...DEFAULT_POMODORO_STATE,
      phase: "LONG_BREAK" as const,
      secondsLeft: 1,
    })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1000))
    expect(sounds.breakEnd).toHaveBeenCalledOnce()
  })

  it("breakEnd does not play when FOCUS phase ends", () => {
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 1 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1000))
    expect(sounds.breakEnd).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Page Visibility API — visibilitychange handler (lines 107-113)
// ---------------------------------------------------------------------------

describe("useTimer — visibilitychange sync", () => {
  it("syncs elapsed time when tab becomes visible after a long delay", () => {
    // Start the timer and let a few seconds pass before simulating the tab hidden
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 120 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())

    // Advance the real-time reference used by lastTickRef via the interval
    act(() => vi.advanceTimersByTime(1000))
    const afterOneTick = result.current.secondsLeft // should be 119

    // Simulate tab being hidden by NOT advancing the interval, then manually
    // set Date.now to jump forward 10 seconds beyond lastTickRef
    const fakeNow = Date.now() + 10_000
    vi.setSystemTime(fakeNow)

    // Fire the visibilitychange event with the tab becoming visible
    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      })
      document.dispatchEvent(new Event("visibilitychange"))
    })

    // The elapsed was >= 2, so advanceTick should have been called with ~10s
    expect(result.current.secondsLeft).toBeLessThan(afterOneTick - 1)
  })

  it("does not sync when elapsed is less than 2 seconds", () => {
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 120 })
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())

    // Let one interval tick set lastTickRef
    act(() => vi.advanceTimersByTime(1000))
    const beforeVisibility = result.current.secondsLeft

    // Advance real time by only 1 second (below the 2-second threshold)
    vi.setSystemTime(Date.now() + 1000)

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      })
      document.dispatchEvent(new Event("visibilitychange"))
    })

    // No extra sync should have fired — secondsLeft should not have jumped
    expect(result.current.secondsLeft).toBe(beforeVisibility)
  })

  it("visibilitychange listener is removed when status stops RUNNING", () => {
    useTimerStore.setState({ ...DEFAULT_POMODORO_STATE, secondsLeft: 120 })
    const removeListenerSpy = vi.spyOn(document, "removeEventListener")
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => result.current.pause())

    expect(removeListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    )
  })
})
