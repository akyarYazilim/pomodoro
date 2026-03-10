// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useDailyTip } from "@/hooks/useCoach"
import { useChat } from "@/hooks/useChat"

// jsdom'da scrollIntoView yoktur; stub olarak tanımlıyoruz
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// useDailyTip
// ---------------------------------------------------------------------------

describe("useDailyTip", () => {
  it("başlangıçta loading=true ve tip=null döndürür", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useDailyTip())
    expect(result.current.loading).toBe(true)
    expect(result.current.tip).toBeNull()
  })

  it("başarılı istekte tip değerini set eder ve loading=false olur", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ tip: "Kısa molalar verimliliği artırır." }),
    })

    const { result } = renderHook(() => useDailyTip())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tip).toBe("Kısa molalar verimliliği artırır.")
  })

  it("API yanıtında tip alanı yoksa tip=null kalır", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useDailyTip())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tip).toBeNull()
  })

  it("HTTP hatası (non-ok) durumunda tip=null ve loading=false olur", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useDailyTip())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tip).toBeNull()
  })

  it("ağ hatası (fetch reject) durumunda tip=null ve loading=false olur", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useDailyTip())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tip).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// useChat
// ---------------------------------------------------------------------------

const mockHistory = {
  messages: [
    { role: "USER", content: "Merhaba", createdAt: "2026-03-10T10:00:00Z" },
    { role: "ASSISTANT", content: "Nasıl yardımcı olabilirim?", createdAt: "2026-03-10T10:00:01Z" },
  ],
}

function mockGetFetch(data = mockHistory) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  })
}

function mockPostFetch(reply: string, ok = true) {
  global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (opts?.method === "POST") {
      return Promise.resolve({
        ok,
        status: ok ? 200 : 500,
        json: () =>
          Promise.resolve(ok ? { reply } : { error: "Sunucu hatası" }),
      })
    }
    // GET — geçmiş yükleme
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messages: [] }),
    })
  })
}

describe("useChat", () => {
  it("başlangıçta boş mesaj listesi, boş input ve streaming=false döndürür", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toEqual([])
    expect(result.current.input).toBe("")
    expect(result.current.streaming).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("mount sonrası geçmiş mesajları API'dan yükler", async () => {
    mockGetFetch()

    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(2))

    expect(result.current.messages[0]).toEqual({ role: "user", content: "Merhaba" })
    expect(result.current.messages[1]).toEqual({ role: "assistant", content: "Nasıl yardımcı olabilirim?" })
  })

  it("geçmişte USER/ASSISTANT dışındaki roller filtrelenir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          messages: [
            { role: "USER", content: "Merhaba", createdAt: "" },
            { role: "SYSTEM", content: "Sistem mesajı", createdAt: "" },
          ],
        }),
    })

    const { result } = renderHook(() => useChat())

    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    expect(result.current.messages[0].role).toBe("user")
  })

  it("geçmiş yükleme başarısız olursa messages boş kalır ve hata fırlatılmaz", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useChat())

    // mount etkisi settle olana kadar bekle; hata olmadığından loading yok,
    // sadece mesajların boş kaldığını doğruluyoruz
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("boş input gönderildiğinde sendMessage API çağrısı yapmaz", async () => {
    mockGetFetch({ messages: [] })
    const { result } = renderHook(() => useChat())

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => {
      await result.current.sendMessage()
    })

    // POST çağrısı yapılmamalı
    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
  })

  it("sadece boşluktan oluşan input gönderildiğinde API çağrısı yapılmaz", async () => {
    mockGetFetch({ messages: [] })
    const { result } = renderHook(() => useChat())

    act(() => result.current.setInput("   "))

    const fetchSpy = vi.spyOn(global, "fetch")
    fetchSpy.mockClear()

    await act(async () => {
      await result.current.sendMessage()
    })

    const postCalls = fetchSpy.mock.calls.filter(
      ([, opts]) => (opts as RequestInit | undefined)?.method === "POST"
    )
    expect(postCalls).toHaveLength(0)
  })

  it("başarılı mesaj gönderiminde kullanıcı + asistan mesajları eklenir", async () => {
    mockPostFetch("Harika bir soru!")

    const { result } = renderHook(() => useChat())

    // Mount etkisinin (GET /api/coach) settle olmasını bekle
    await act(async () => { await Promise.resolve() })

    act(() => result.current.setInput("Pomodoro nedir?"))

    await act(async () => {
      await result.current.sendMessage()
    })

    await waitFor(() => expect(result.current.streaming).toBe(false))

    const msgs = result.current.messages
    expect(msgs.at(-2)).toEqual({ role: "user", content: "Pomodoro nedir?" })
    expect(msgs.at(-1)).toEqual({ role: "assistant", content: "Harika bir soru!" })
  })

  it("başarılı gönderi sonrası input temizlenir", async () => {
    mockPostFetch("Tamam!")

    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Merhaba"))

    await act(async () => {
      await result.current.sendMessage()
    })

    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.input).toBe("")
  })

  it("API non-ok döndürdüğünde error state doldurulur ve asistan mesajı eklenmez", async () => {
    mockPostFetch("", false)

    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru"))

    await act(async () => {
      await result.current.sendMessage()
    })

    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBe("Sunucu hatası")
    const assistantMsgs = result.current.messages.filter((m) => m.role === "assistant")
    expect(assistantMsgs).toHaveLength(0)
  })

  it("ağ hatası durumunda error state varsayılan hata mesajıyla doldurulur", async () => {
    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return Promise.reject(new Error("Network error"))
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: [] }),
      })
    })

    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru"))

    await act(async () => {
      await result.current.sendMessage()
    })

    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBeTruthy()
  })

  it("gönderim sırasında (streaming=true) ikinci sendMessage çağrısı ihmal edilir", async () => {
    let resolvePost!: (v: unknown) => void
    global.fetch = vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return new Promise((res) => {
          resolvePost = res
        })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: [] }),
      })
    })

    const { result } = renderHook(() => useChat())

    // Mount etkisinin (GET) settle olmasını bekle
    await act(async () => { await Promise.resolve() })

    act(() => result.current.setInput("İlk mesaj"))

    // İlk gönderimi başlat (tamamlanmıyor — POST Promise askıda)
    act(() => { result.current.sendMessage() })

    // streaming=true olana kadar bekle
    await waitFor(() => expect(result.current.streaming).toBe(true))

    // İkinci gönderim denemesi — streaming guard nedeniyle ihmal edilmeli
    act(() => result.current.setInput("İkinci mesaj"))
    await act(async () => {
      await result.current.sendMessage()
    })

    // Mesaj listesinde sadece ilk kullanıcı mesajı olmalı
    const userMsgs = result.current.messages.filter((m) => m.role === "user")
    expect(userMsgs).toHaveLength(1)
    expect(userMsgs[0].content).toBe("İlk mesaj")

    // POST'u tamamla
    resolvePost({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ reply: "Cevap" }),
    })
    await waitFor(() => expect(result.current.streaming).toBe(false))
  })

  it("handleKeyDown Enter tuşunda sendMessage çağırır", async () => {
    mockPostFetch("Merhaba!")

    const { result } = renderHook(() => useChat())

    // Mount etkisinin (GET) settle olmasını bekle
    await act(async () => { await Promise.resolve() })

    act(() => result.current.setInput("Test"))

    await act(async () => {
      result.current.handleKeyDown({
        key: "Enter",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
      // handleKeyDown içindeki sendMessage async — bir tick bekle
      await Promise.resolve()
    })

    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.messages.some((m) => m.content === "Test")).toBe(true)
  })

  it("handleKeyDown Shift+Enter kombinasyonu sendMessage çağırmaz", async () => {
    mockGetFetch({ messages: [] })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Satır satır"))

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
  })

  it("handleKeyDown Enter dışı bir tuş sendMessage çağırmaz", async () => {
    mockGetFetch({ messages: [] })
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Bir şey"))

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

  it("başarılı gönderim sonrası error state sıfırlanır", async () => {
    // Önce hatalı istek
    mockPostFetch("", false)
    const { result } = renderHook(() => useChat())
    act(() => result.current.setInput("Soru 1"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))
    expect(result.current.error).toBeTruthy()

    // Ardından başarılı istek
    mockPostFetch("Cevap geldi!")
    act(() => result.current.setInput("Soru 2"))

    await act(async () => { await result.current.sendMessage() })
    await waitFor(() => expect(result.current.streaming).toBe(false))

    expect(result.current.error).toBeNull()
  })

  it("geçmiş yükleme yanıtında messages alanı yoksa mesaj listesi boş kalır", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useChat())

    await act(async () => { await Promise.resolve() })

    expect(result.current.messages).toEqual([])
  })
})
