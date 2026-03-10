import { useTimerStore } from "@/stores/timer-store"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_STATE = {
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
  useTimerStore.setState(DEFAULT_STATE)
})

// ---------------------------------------------------------------------------
// initFromSession — extended coverage
// ---------------------------------------------------------------------------

describe("timer-store — initFromSession extended", () => {
  it("updates pomodoroMinutes from custom config", () => {
    useTimerStore.getState().initFromSession({ pomodoroMinutes: 50 })
    expect(useTimerStore.getState().config.pomodoroMinutes).toBe(50)
    expect(useTimerStore.getState().secondsLeft).toBe(50 * 60)
    expect(useTimerStore.getState().initialized).toBe(true)
  })

  it("sets secondsLeft to 0 when defaultTimerMode is FLOWTIME", () => {
    useTimerStore.getState().initFromSession({ defaultTimerMode: "FLOWTIME" })
    expect(useTimerStore.getState().mode).toBe("FLOWTIME")
    expect(useTimerStore.getState().secondsLeft).toBe(0)
  })

  it("does not update state when initialized is true and force is false (default)", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, initialized: true, secondsLeft: 9999 })
    useTimerStore.getState().initFromSession({ pomodoroMinutes: 45 })
    // secondsLeft must stay unchanged because the guard short-circuits
    expect(useTimerStore.getState().secondsLeft).toBe(9999)
    expect(useTimerStore.getState().config.pomodoroMinutes).toBe(25)
  })

  it("overrides config when initialized is true and force is explicitly true", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, initialized: true })
    useTimerStore.getState().initFromSession({ pomodoroMinutes: 45 }, true)
    expect(useTimerStore.getState().config.pomodoroMinutes).toBe(45)
    expect(useTimerStore.getState().secondsLeft).toBe(45 * 60)
  })

  it("preserves default shortBreakMinutes and longBreakMinutes when only pomodoroMinutes provided", () => {
    useTimerStore.getState().initFromSession({ pomodoroMinutes: 30 })
    const cfg = useTimerStore.getState().config
    expect(cfg.pomodoroMinutes).toBe(30)
    expect(cfg.shortBreakMinutes).toBe(5)   // default preserved
    expect(cfg.longBreakMinutes).toBe(15)   // default preserved
    expect(cfg.longBreakInterval).toBe(4)   // always default (not configurable via initFromSession)
  })

  it("falls back to defaults when passed an empty config object", () => {
    useTimerStore.getState().initFromSession({})
    const cfg = useTimerStore.getState().config
    expect(cfg.pomodoroMinutes).toBe(25)
    expect(cfg.shortBreakMinutes).toBe(5)
    expect(cfg.longBreakMinutes).toBe(15)
    expect(useTimerStore.getState().secondsLeft).toBe(25 * 60)
  })

  it("treats undefined pomodoroMinutes as not provided, keeping default 25", () => {
    useTimerStore.getState().initFromSession({ pomodoroMinutes: undefined })
    expect(useTimerStore.getState().config.pomodoroMinutes).toBe(25)
  })

  it("updates both shortBreakMinutes and longBreakMinutes independently", () => {
    useTimerStore.getState().initFromSession({ shortBreakMinutes: 8, longBreakMinutes: 20 })
    const cfg = useTimerStore.getState().config
    expect(cfg.shortBreakMinutes).toBe(8)
    expect(cfg.longBreakMinutes).toBe(20)
    expect(cfg.pomodoroMinutes).toBe(25) // default preserved
  })

  it("sets initialized to true after first call", () => {
    expect(useTimerStore.getState().initialized).toBe(false)
    useTimerStore.getState().initFromSession({})
    expect(useTimerStore.getState().initialized).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// computeNextPhase / nextPhase — edge cases
// ---------------------------------------------------------------------------

describe("timer-store — computeNextPhase via nextPhase", () => {
  it("FOCUS → SHORT_BREAK on first completion (pomodoroCount 0)", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, phase: "FOCUS", pomodoroCount: 0 })
    useTimerStore.getState().nextPhase()
    expect(useTimerStore.getState().phase).toBe("SHORT_BREAK")
    expect(useTimerStore.getState().pomodoroCount).toBe(1)
    expect(useTimerStore.getState().status).toBe("IDLE")
  })

  it("FOCUS → LONG_BREAK after 3rd pomodoro (pomodoroCount 3)", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, phase: "FOCUS", pomodoroCount: 3 })
    useTimerStore.getState().nextPhase()
    expect(useTimerStore.getState().phase).toBe("LONG_BREAK")
    expect(useTimerStore.getState().pomodoroCount).toBe(4)
  })

  it("SHORT_BREAK → FOCUS, pomodoroCount unchanged", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, phase: "SHORT_BREAK", pomodoroCount: 2 })
    useTimerStore.getState().nextPhase()
    expect(useTimerStore.getState().phase).toBe("FOCUS")
    expect(useTimerStore.getState().pomodoroCount).toBe(2)
  })

  it("LONG_BREAK → FOCUS resets pomodoroCount to 0", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, phase: "LONG_BREAK", pomodoroCount: 4 })
    useTimerStore.getState().nextPhase()
    expect(useTimerStore.getState().phase).toBe("FOCUS")
    expect(useTimerStore.getState().pomodoroCount).toBe(0)
  })

  it("nextPhase sets secondsLeft to correct phase duration from config", () => {
    // Custom config: shortBreak = 8 min
    useTimerStore.setState({
      ...DEFAULT_STATE,
      phase: "FOCUS",
      pomodoroCount: 0,
      config: { pomodoroMinutes: 25, shortBreakMinutes: 8, longBreakMinutes: 20, longBreakInterval: 4 },
    })
    useTimerStore.getState().nextPhase()
    expect(useTimerStore.getState().phase).toBe("SHORT_BREAK")
    expect(useTimerStore.getState().secondsLeft).toBe(8 * 60)
  })
})

// ---------------------------------------------------------------------------
// reset — FLOWTIME mode
// ---------------------------------------------------------------------------

describe("timer-store — reset in FLOWTIME mode", () => {
  it("resets secondsLeft to 0 in FLOWTIME mode", () => {
    useTimerStore.setState({ ...DEFAULT_STATE, mode: "FLOWTIME", secondsLeft: 3600 })
    useTimerStore.getState().reset()
    expect(useTimerStore.getState().secondsLeft).toBe(0)
    expect(useTimerStore.getState().status).toBe("IDLE")
  })

  it("reset does not change mode or phase", () => {
    useTimerStore.setState({
      ...DEFAULT_STATE,
      mode: "FLOWTIME",
      phase: "FOCUS",
      secondsLeft: 100,
      status: "RUNNING",
    })
    useTimerStore.getState().reset()
    expect(useTimerStore.getState().mode).toBe("FLOWTIME")
    expect(useTimerStore.getState().phase).toBe("FOCUS")
  })

  it("reset restores Pomodoro secondsLeft from config", () => {
    useTimerStore.setState({
      ...DEFAULT_STATE,
      secondsLeft: 100,
      config: { pomodoroMinutes: 30, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakInterval: 4 },
    })
    useTimerStore.getState().reset()
    expect(useTimerStore.getState().secondsLeft).toBe(30 * 60)
  })
})

// ---------------------------------------------------------------------------
// setDeepFocusMode — toggle behaviour
// ---------------------------------------------------------------------------

describe("timer-store — setDeepFocusMode", () => {
  it("is false by default", () => {
    expect(useTimerStore.getState().deepFocusMode).toBe(false)
  })

  it("setDeepFocusMode(true) enables deep focus mode", () => {
    useTimerStore.getState().setDeepFocusMode(true)
    expect(useTimerStore.getState().deepFocusMode).toBe(true)
  })

  it("setDeepFocusMode(false) disables deep focus mode", () => {
    useTimerStore.getState().setDeepFocusMode(true)
    useTimerStore.getState().setDeepFocusMode(false)
    expect(useTimerStore.getState().deepFocusMode).toBe(false)
  })

  it("toggling does not affect other store fields", () => {
    const before = useTimerStore.getState().secondsLeft
    useTimerStore.getState().setDeepFocusMode(true)
    expect(useTimerStore.getState().secondsLeft).toBe(before)
    expect(useTimerStore.getState().status).toBe("IDLE")
  })
})
