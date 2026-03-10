// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSessionRecorder } from "@/hooks/useSessionRecorder"
import { sounds } from "@/lib/utils/sounds"
import type { TimerCompletePayload } from "@/hooks/useTimer"

vi.mock("@/lib/utils/sounds", () => ({
  sounds: {
    workComplete: vi.fn(),
    breakEnd: vi.fn(),
    taskDone: vi.fn(),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Yardımcı sabitler ve fabrikalar
// ---------------------------------------------------------------------------

const SESSION_ID = "session-abc-123"

const focusPayload: TimerCompletePayload = {
  mode: "POMODORO",
  phase: "FOCUS",
  durationSeconds: 1500, // 25 dakika
  taskId: null,
}

const shortBreakPayload: TimerCompletePayload = {
  mode: "POMODORO",
  phase: "SHORT_BREAK",
  durationSeconds: 300,
  taskId: null,
}

const flowtimePayload: TimerCompletePayload = {
  mode: "FLOWTIME",
  phase: "FOCUS",
  durationSeconds: 3600, // 60 dakika
  taskId: "task-xyz",
}

const tooShortPayload: TimerCompletePayload = {
  mode: "POMODORO",
  phase: "FOCUS",
  durationSeconds: 59, // 60 saniyenin altı — kayıt edilmez
  taskId: null,
}

/** Başarılı üç aşamalı fetch akışı (POST → PATCH → streak POST) */
function mockSuccessfulFlow() {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ session: { id: SESSION_ID } }),
    })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// onTimerComplete — başarı senaryoları
// ---------------------------------------------------------------------------

describe("useSessionRecorder — onTimerComplete: başarılı akış", () => {
  it("FOCUS fazı tamamlandığında POST /api/sessions çağrılır", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    expect(fetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("POST sonrası session.id ile PATCH /api/sessions/:id çağrılır", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    expect(fetch).toHaveBeenCalledWith(
      `/api/sessions/${SESSION_ID}`,
      expect.objectContaining({ method: "PATCH" })
    )
  })

  it("PATCH isteği doğru body ile gönderilir (status: COMPLETED, actualMinutes hesaplı)", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    const patchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[1]
    const body = JSON.parse(patchCall[1].body)
    expect(body.status).toBe("COMPLETED")
    expect(body.actualMinutes).toBe(25) // Math.floor(1500 / 60)
  })

  it("streak güncellemek için POST /api/stats/streak çağrılır", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    expect(fetch).toHaveBeenCalledWith("/api/stats/streak", { method: "POST" })
  })

  it("başarılı kayıt sonrası session.id döner", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = null
    await act(async () => {
      returnedId = await result.current.onTimerComplete(focusPayload)
    })

    expect(returnedId).toBe(SESSION_ID)
  })

  it("sounds.workComplete() FOCUS fazı tamamlandığında çağrılır", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    expect(sounds.workComplete).toHaveBeenCalledOnce()
  })

  it("POST body'sine mode ve taskId doğru aktarılır", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(flowtimePayload)
    })

    const postCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(postCall[1].body)
    expect(body.mode).toBe("FLOWTIME")
    expect(body.taskId).toBe("task-xyz")
  })

  it("taskId null olduğunda body'de taskId undefined olarak gönderilir", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    const postCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(postCall[1].body)
    // JSON.stringify undefined değerleri serialize etmez, bu yüzden alan yoktur
    expect("taskId" in body).toBe(false)
  })

  it("FLOWTIME modunda 60 saniyenin üzerinde bir oturum kaydedilir", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = null
    await act(async () => {
      returnedId = await result.current.onTimerComplete(flowtimePayload)
    })

    expect(returnedId).toBe(SESSION_ID)
  })
})

// ---------------------------------------------------------------------------
// onTimerComplete — atlama / erken çıkış senaryoları
// ---------------------------------------------------------------------------

describe("useSessionRecorder — onTimerComplete: kayıt dışı bırakılan durumlar", () => {
  it("POMODORO SHORT_BREAK fazında kayıt yapılmaz ve null döner", async () => {
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete(shortBreakPayload)
    })

    expect(returnedId).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("POMODORO LONG_BREAK fazında kayıt yapılmaz ve null döner", async () => {
    const longBreakPayload: TimerCompletePayload = {
      mode: "POMODORO",
      phase: "LONG_BREAK",
      durationSeconds: 900,
      taskId: null,
    }
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete(longBreakPayload)
    })

    expect(returnedId).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("60 saniyenin altındaki oturumlar kaydedilmez", async () => {
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete(tooShortPayload)
    })

    expect(returnedId).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("tam 60 saniyelik oturum (sınır değer) kayıt edilmez (< 60 koşulu)", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete({
        ...focusPayload,
        durationSeconds: 59,
      })
    })

    expect(returnedId).toBeNull()
  })

  it("tam 60 saniyelik oturum (eşit sınır, >= 60) kayıt edilir", async () => {
    mockSuccessfulFlow()
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = null
    await act(async () => {
      returnedId = await result.current.onTimerComplete({
        ...focusPayload,
        durationSeconds: 60,
      })
    })

    expect(returnedId).toBe(SESSION_ID)
  })

  it("kısa oturumda sounds.workComplete çağrılmaz", async () => {
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(tooShortPayload)
    })

    expect(sounds.workComplete).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// onTimerComplete — hata senaryoları
// ---------------------------------------------------------------------------

describe("useSessionRecorder — onTimerComplete: hata yönetimi", () => {
  it("POST başarısız olursa null döner ve PATCH çağrılmaz", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false })
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete(focusPayload)
    })

    expect(returnedId).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("fetch ağ hatası fırlatırsa null döner ve uygulama çökmez", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = "sentinel"
    await act(async () => {
      returnedId = await result.current.onTimerComplete(focusPayload)
    })

    expect(returnedId).toBeNull()
  })

  it("POST ok=false olsa bile sounds.workComplete() daha önce çağrılmış olur", async () => {
    // sounds.workComplete() fetch'ten önce çağrılır; POST başarısız olsa da ses çalınır
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false })
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.onTimerComplete(focusPayload)
    })

    expect(sounds.workComplete).toHaveBeenCalledOnce()
  })

  it("PATCH başarısız olsa bile session.id döner (hata fırlatmaz)", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ session: { id: SESSION_ID } }),
      })
      .mockResolvedValueOnce({ ok: false }) // PATCH başarısız
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // streak

    const { result } = renderHook(() => useSessionRecorder())

    let returnedId: string | null = null
    await act(async () => {
      returnedId = await result.current.onTimerComplete(focusPayload)
    })

    // Hook hata fırlatmaz ve id'yi döndürür
    expect(returnedId).toBe(SESSION_ID)
  })
})

// ---------------------------------------------------------------------------
// submitMood
// ---------------------------------------------------------------------------

describe("useSessionRecorder — submitMood", () => {
  it("doğru session id ve mood ile PATCH isteği atar", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.submitMood(SESSION_ID, 4)
    })

    expect(fetch).toHaveBeenCalledWith(
      `/api/sessions/${SESSION_ID}`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ mood: 4 }),
      })
    )
  })

  it("PATCH body'de yalnızca mood alanı gönderilir", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.submitMood("session-mood-test", 3)
    })

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(Object.keys(body)).toEqual(["mood"])
    expect(body.mood).toBe(3)
  })

  it("sınır mood değeri 1 kabul edilir", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.submitMood(SESSION_ID, 1)
    })

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(JSON.parse(call[1].body).mood).toBe(1)
  })

  it("sınır mood değeri 5 kabul edilir", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useSessionRecorder())

    await act(async () => {
      await result.current.submitMood(SESSION_ID, 5)
    })

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(JSON.parse(call[1].body).mood).toBe(5)
  })

  it("ağ hatası olursa uygulama çökmez (hata sessizce geçilir)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useSessionRecorder())

    await expect(
      act(async () => {
        await result.current.submitMood(SESSION_ID, 3)
      })
    ).resolves.not.toThrow()
  })

  it("PATCH başarısız (ok=false) olsa bile hata fırlatmaz", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    const { result } = renderHook(() => useSessionRecorder())

    await expect(
      act(async () => {
        await result.current.submitMood(SESSION_ID, 2)
      })
    ).resolves.not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Hook arayüzü
// ---------------------------------------------------------------------------

describe("useSessionRecorder — hook arayüzü", () => {
  it("onTimerComplete ve submitMood fonksiyonlarını döner", () => {
    global.fetch = vi.fn()
    const { result } = renderHook(() => useSessionRecorder())

    expect(typeof result.current.onTimerComplete).toBe("function")
    expect(typeof result.current.submitMood).toBe("function")
  })

  it("birden fazla render arasında referanslar sabit kalır (useCallback)", () => {
    global.fetch = vi.fn()
    const { result, rerender } = renderHook(() => useSessionRecorder())

    const first = result.current.onTimerComplete
    rerender()
    expect(result.current.onTimerComplete).toBe(first)
  })
})
