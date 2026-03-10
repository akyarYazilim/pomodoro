// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useChat } from "@/hooks/useChat"

// jsdom'da scrollIntoView yoktur; stub olarak tanımlıyoruz
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Helper: GET ve POST yanıtlarını ayrı ayrı kontrol eden tek bir fetch mock'u oluşturur.
function makeFetch({
  getMessages = [] as object[],
  postReply = "Cevap",
  postOk = true,
  postError = "Sunucu hatası",
  postReject = null as Error | null,
} = {}) {
  global.fetch = vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
    if (opts?.method === "POST") {
      if (postReject) return Promise.reject(postReject)
      return Promise.resolve({
        ok: postOk,
        status: postOk ? 200 : 500,
        json: () =>
          Promise.resolve(postOk ? { reply: postReply } : { error: postError }),
      })
    }
    // GET — geçmiş yükleme
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messages: getMessages }),
    })
  })
}

// GET tamamlanana kadar (bir mikrotask tick) bekler.
async function waitForGetToSettle() {
  await act(async () => { await Promise.resolve() })
}

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — başlangıç durumu", () => {
  it("başlangıçta mesajlar boş, streaming false, error null ve input boş olmalı", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toEqual([])
    expect(result.current.streaming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.input).toBe("")
  })

  it("bottomRef hook tarafından döndürülmeli", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useChat())

    expect(result.current.bottomRef).toBeDefined()
  })

  it("sendMessage ve handleKeyDown fonksiyonları export edilmeli", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useChat())

    expect(typeof result.current.sendMessage).toBe("function")
    expect(typeof result.current.handleKeyDown).toBe("function")
    expect(typeof result.current.setInput).toBe("function")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — geçmiş mesajları yükleme", () => {
  it("mount olduğunda /api/coach GET isteği atılmalı", async () => {
    makeFetch()
    renderHook(() => useChat())

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/coach")
    })
  })

  it("API'den gelen USER ve ASSISTANT mesajları doğru role ile set edilmeli", async () => {
    makeFetch({
      getMessages: [
        { role: "USER", content: "Merhaba", createdAt: "2026-03-10T10:00:00Z" },
        { role: "ASSISTANT", content: "Nasıl yardımcı olabilirim?", createdAt: "2026-03-10T10:00:01Z" },
      ],
    })
    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(2))

    expect(result.current.messages[0]).toEqual({ role: "user", content: "Merhaba" })
    expect(result.current.messages[1]).toEqual({ role: "assistant", content: "Nasıl yardımcı olabilirim?" })
  })

  it("messages alanı yoksa mesaj listesi boş kalmalı", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
    const { result } = renderHook(() => useChat())

    await waitForGetToSettle()

    expect(result.current.messages).toEqual([])
  })

  it("USER/ASSISTANT dışındaki roller (örn. SYSTEM) filtrelenmeli", async () => {
    makeFetch({
      getMessages: [
        { role: "SYSTEM", content: "Sistem mesajı", createdAt: "2026-03-10T09:00:00Z" },
        { role: "USER", content: "Kullanıcı mesajı", createdAt: "2026-03-10T10:00:00Z" },
      ],
    })
    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    expect(result.current.messages[0].role).toBe("user")
  })

  it("GET isteği başarısız olursa mesajlar boş kalmalı ve error state nil olmalı", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useChat())

    await waitForGetToSettle()

    expect(result.current.messages).toEqual([])
    expect(result.current.error).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — sendMessage", () => {
  it("başarılı gönderimde kullanıcı ve asistan mesajları listeye eklenmeli", async () => {
    makeFetch({ postReply: "Size yardımcı olabilirim!" })
    const { result } = renderHook(() => useChat())
    await waitForGetToSettle()

    act(() => result.current.setInput("Pomodoro nedir?"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.messages.at(-2)).toEqual({ role: "user", content: "Pomodoro nedir?" })
    expect(result.current.messages.at(-1)).toEqual({ role: "assistant", content: "Size yardımcı olabilirim!" })
  })

  it("gönderim sonrası input temizlenmeli", async () => {
    makeFetch({ postReply: "Cevap" })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Bir soru"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.input).toBe("")
  })

  it("gönderim sonrası streaming false olmalı", async () => {
    makeFetch({ postReply: "Cevap" })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Bir soru"))

    await act(async () => { await result.current.sendMessage() })

    expect(result.current.streaming).toBe(false)
  })

  it("POST isteği doğru method, headers ve body ile atılmalı", async () => {
    makeFetch({ postReply: "Cevap" })
    const { result } = renderHook(() => useChat())
    await waitForGetToSettle()

    act(() => result.current.setInput("Test mesajı"))
    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    const allCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const postCall = allCalls.find((c: unknown[]) => (c[1] as RequestInit | undefined)?.method === "POST")
    expect(postCall).toBeDefined()
    expect(postCall![0]).toBe("/api/coach")
    const body = JSON.parse((postCall![1] as RequestInit).body as string)
    expect(body.message).toBe("Test mesajı")
    expect((postCall![1] as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" })
  })

  it("boş input ile sendMessage POST atmamalı", async () => {
    makeFetch()
    const { result } = renderHook(() => useChat())

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => { await result.current.sendMessage() })

    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
  })

  it("sadece boşluktan oluşan input ile sendMessage POST atmamalı", async () => {
    makeFetch()
    const { result } = renderHook(() => useChat())

    act(() => result.current.setInput("   "))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => { await result.current.sendMessage() })

    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
  })

  it("streaming=true iken ikinci sendMessage ihmal edilmeli", async () => {
    let resolvePost!: (v: unknown) => void
    global.fetch = vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return new Promise((res) => { resolvePost = res })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: [] }),
      })
    })

    const { result } = renderHook(() => useChat())
    await waitForGetToSettle()

    act(() => result.current.setInput("İlk mesaj"))
    act(() => { result.current.sendMessage() })

    await waitFor(() => expect(result.current.streaming).toBe(true))

    // İkinci gönderim denemesi — streaming guard devrede
    act(() => result.current.setInput("İkinci mesaj"))
    await act(async () => { await result.current.sendMessage() })

    const userMsgs = result.current.messages.filter((m) => m.role === "user")
    expect(userMsgs).toHaveLength(1)
    expect(userMsgs[0].content).toBe("İlk mesaj")

    resolvePost({ ok: true, status: 200, json: () => Promise.resolve({ reply: "Cevap" }) })
    await waitFor(() => expect(result.current.streaming).toBe(false))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — hata yönetimi", () => {
  it("API non-ok yanıt döndürürse error state doldurulmalı ve asistan mesajı eklenmemeli", async () => {
    makeFetch({ postOk: false, postError: "Sunucu hatası" })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBe("Sunucu hatası")
    expect(result.current.messages.filter((m) => m.role === "assistant")).toHaveLength(0)
  })

  it("API'den error alanı yoksa varsayılan hata mesajı kullanılmalı", async () => {
    global.fetch = vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: [] }),
      })
    })

    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBe("Bir hata oluştu.")
  })

  it("network hatasında error state set edilmeli ve streaming false olmalı", async () => {
    makeFetch({ postReject: new Error("Network çöktü") })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBe("Network çöktü")
    expect(result.current.streaming).toBe(false)
  })

  it("yeni başarılı gönderimde önceki hata temizlenmeli", async () => {
    // İlk istek: hata
    makeFetch({ postOk: false, postError: "Geçici hata" })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Hatalı mesaj"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))
    expect(result.current.error).toBeTruthy()

    // İkinci istek: başarılı — fetch mock'unu değiştir
    makeFetch({ postReply: "Cevap geldi" })
    act(() => result.current.setInput("Başarılı mesaj"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — mesaj geçmişi", () => {
  it("birden fazla gönderimde mesajlar birikimli olarak korunmalı", async () => {
    makeFetch({ postReply: "İlk cevap" })
    const { result } = renderHook(() => useChat())
    await waitForGetToSettle()

    act(() => result.current.setInput("İlk soru"))
    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    // İkinci gönderim için farklı cevap
    makeFetch({ postReply: "İkinci cevap" })
    act(() => result.current.setInput("İkinci soru"))
    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.messages).toHaveLength(4)
    expect(result.current.messages[0]).toEqual({ role: "user", content: "İlk soru" })
    expect(result.current.messages[1]).toEqual({ role: "assistant", content: "İlk cevap" })
    expect(result.current.messages[2]).toEqual({ role: "user", content: "İkinci soru" })
    expect(result.current.messages[3]).toEqual({ role: "assistant", content: "İkinci cevap" })
  })

  it("POST body history alanı mevcut mesajların son 18'ini içermeli", async () => {
    // 20 mesajlık geçmiş oluştur
    const storedMessages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "USER" : "ASSISTANT",
      content: `Mesaj ${i + 1}`,
      createdAt: `2026-03-10T10:${String(i).padStart(2, "0")}:00Z`,
    }))

    makeFetch({ getMessages: storedMessages, postReply: "Cevap" })
    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(20))

    act(() => result.current.setInput("Son soru"))
    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    const allCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const postCall = allCalls.find((c: unknown[]) => (c[1] as RequestInit | undefined)?.method === "POST")
    expect(postCall).toBeDefined()
    const body = JSON.parse((postCall![1] as RequestInit).body as string)
    expect(body.history).toHaveLength(18)
    // Son 18 mesaj olmalı: index 2..19 → "Mesaj 3" ile "Mesaj 20"
    expect(body.history[0].content).toBe("Mesaj 3")
    expect(body.history[17].content).toBe("Mesaj 20")
  })

  it("18 veya daha az mesaj varsa history tümü gönderilmeli", async () => {
    const storedMessages = Array.from({ length: 5 }, (_, i) => ({
      role: i % 2 === 0 ? "USER" : "ASSISTANT",
      content: `Kısa Mesaj ${i + 1}`,
      createdAt: `2026-03-10T10:0${i}:00Z`,
    }))

    makeFetch({ getMessages: storedMessages, postReply: "Cevap" })
    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(5))

    act(() => result.current.setInput("Soru"))
    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    const allCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const postCall = allCalls.find((c: unknown[]) => (c[1] as RequestInit | undefined)?.method === "POST")
    expect(postCall).toBeDefined()
    const body = JSON.parse((postCall![1] as RequestInit).body as string)
    expect(body.history).toHaveLength(5)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe("useChat — handleKeyDown", () => {
  it("Enter tuşu sendMessage çağırmalı ve preventDefault tetiklenmeli", async () => {
    makeFetch({ postReply: "Enter cevabı" })
    const { result } = renderHook(() => useChat())
    await waitForGetToSettle()

    act(() => result.current.setInput("Enter ile gönder"))

    const mockPreventDefault = vi.fn()
    await act(async () => {
      result.current.handleKeyDown({
        key: "Enter",
        shiftKey: false,
        preventDefault: mockPreventDefault,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
      await Promise.resolve()
    })

    expect(mockPreventDefault).toHaveBeenCalled()
    await waitFor(() => expect(result.current.streaming).toBe(false))
    expect(result.current.messages.some((m) => m.content === "Enter ile gönder")).toBe(true)
  })

  it("Shift+Enter kombinasyonu sendMessage çağırmamalı", async () => {
    makeFetch()
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Satır atla"))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
    expect(result.current.messages).toHaveLength(0)
  })

  it("Enter dışındaki tuşlarda sendMessage çağrılmamalı", async () => {
    makeFetch()
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Farklı tuş"))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    act(() => {
      result.current.handleKeyDown({
        key: "a",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
  })
})
