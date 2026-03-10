import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ---------------------------------------------------------------------------
// Module mocks — hoisted automatically by Vitest before any imports
// ---------------------------------------------------------------------------

vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn()
  return {
    // The default export is a class used with `new`, so the implementation
    // must be a regular function (not an arrow function).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: vi.fn().mockImplementation(function (this: any) {
      this.messages = { create: mockCreate }
    }),
  }
})

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}))

import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { getCoachReply, type ChatMessage } from "@/lib/ai/coach"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A key that satisfies the >50 char length check. */
const LONG_KEY = "sk-ant-" + "a".repeat(100)

/** A key short enough to be rejected (falls through to .env.local). */
const SHORT_KEY = "short"

/** Build a minimal successful Anthropic text-block response. */
function makeTextResponse(text: string) {
  return { content: [{ type: "text", text }] }
}

/** Build a response whose first content block is NOT a text block. */
function makeNonTextResponse() {
  return {
    content: [
      { type: "image", source: { type: "base64", media_type: "image/png", data: "" } },
    ],
  }
}

/**
 * Return a fresh mockCreate spy and wire up the Anthropic constructor to use it.
 * The implementation must be a real function (not an arrow function) so that
 * `new Anthropic(...)` in the source works correctly.
 */
function setupMockCreate(resolvedValue: unknown) {
  const mockCreate = vi.fn().mockResolvedValue(resolvedValue)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(Anthropic).mockImplementation(function (this: any) {
    this.messages = { create: mockCreate }
  } as unknown as typeof Anthropic)
  return mockCreate
}

const SYSTEM_PROMPT = "Sen bir verimlilik koçusun."

const MESSAGES: ChatMessage[] = [
  { role: "user", content: "Pomodoro tekniği nedir?" },
]

// ---------------------------------------------------------------------------
// getApiKey — tested indirectly through getCoachReply
// ---------------------------------------------------------------------------

describe("getApiKey — API anahtarı çözümlemesi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it("ANTHROPIC_API_KEY 50 karakterden uzunsa doğrudan kullanılır", async () => {
    process.env.ANTHROPIC_API_KEY = LONG_KEY
    setupMockCreate(makeTextResponse("ok"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({ apiKey: LONG_KEY })
  })

  it("ANTHROPIC_API_KEY 50 karakter veya daha kısaysa .env.local'e fallback yapılır", async () => {
    process.env.ANTHROPIC_API_KEY = SHORT_KEY
    const fileKey = "sk-ant-from-file-" + "b".repeat(90)

    vi.mocked(readFileSync).mockReturnValueOnce(`ANTHROPIC_API_KEY="${fileKey}"\n`)
    setupMockCreate(makeTextResponse("ok"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(vi.mocked(readFileSync)).toHaveBeenCalled()
    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({ apiKey: fileKey })
  })

  it(".env.local'de geçerli ANTHROPIC_API_KEY varsa kullanılır", async () => {
    const fileKey = "sk-ant-from-env-local-" + "c".repeat(80)

    vi.mocked(readFileSync).mockReturnValueOnce(
      `OTHER_VAR="something"\nANTHROPIC_API_KEY="${fileKey}"\n`,
    )
    setupMockCreate(makeTextResponse("ok"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({ apiKey: fileKey })
  })

  it("ne env'de ne .env.local'de key yoksa hata fırlatılır", async () => {
    vi.mocked(readFileSync).mockReturnValueOnce('OTHER_VAR="no-key-here"\n')

    await expect(getCoachReply(MESSAGES, SYSTEM_PROMPT)).rejects.toThrow(
      "ANTHROPIC_API_KEY not found in env or .env.local",
    )
  })

  it(".env.local dosyası bulunamazsa (readFileSync throw) hata fırlatılır", async () => {
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw new Error("ENOENT: no such file or directory")
    })

    await expect(getCoachReply(MESSAGES, SYSTEM_PROMPT)).rejects.toThrow(
      "ANTHROPIC_API_KEY not found in env or .env.local",
    )
  })
})

// ---------------------------------------------------------------------------
// getCoachReply — API çağrısı parametreleri
// ---------------------------------------------------------------------------

describe("getCoachReply — API çağrısı parametreleri", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = LONG_KEY
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it("doğru model, max_tokens, system ve messages ile API çağrılır", async () => {
    const mockCreate = setupMockCreate(makeTextResponse("Cevap"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockCreate).toHaveBeenCalledWith({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: MESSAGES,
    })
  })

  it("birden fazla mesaj içeren dizi API'ye olduğu gibi iletilir", async () => {
    const multiMessages: ChatMessage[] = [
      { role: "user", content: "İlk soru" },
      { role: "assistant", content: "İlk cevap" },
      { role: "user", content: "İkinci soru" },
    ]

    const mockCreate = setupMockCreate(makeTextResponse("Son cevap"))

    await getCoachReply(multiMessages, SYSTEM_PROMPT)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ messages: multiMessages }),
    )
  })

  it("boş mesaj dizisiyle çağrıldığında API'ye boş dizi iletilir", async () => {
    const mockCreate = setupMockCreate(makeTextResponse(""))

    await getCoachReply([], SYSTEM_PROMPT)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [] }),
    )
  })
})

// ---------------------------------------------------------------------------
// getCoachReply — yanıt işleme
// ---------------------------------------------------------------------------

describe("getCoachReply — yanıt işleme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = LONG_KEY
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it("text tipi block'tan metin döndürülür", async () => {
    setupMockCreate(makeTextResponse("Merhaba!"))

    const result = await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(result).toBe("Merhaba!")
  })

  it("text olmayan block türü (image vb.) için boş string döner", async () => {
    setupMockCreate(makeNonTextResponse())

    const result = await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(result).toBe("")
  })

  it("API hatası propagate edilir — getCoachReply reject eder", async () => {
    const apiError = new Error("API rate limit exceeded")
    const mockCreate = vi.fn().mockRejectedValue(apiError)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(Anthropic).mockImplementation(function (this: any) {
      this.messages = { create: mockCreate }
    } as unknown as typeof Anthropic)

    await expect(getCoachReply(MESSAGES, SYSTEM_PROMPT)).rejects.toThrow(
      "API rate limit exceeded",
    )
  })

  it("boş text içeren text block için boş string döner", async () => {
    setupMockCreate(makeTextResponse(""))

    const result = await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(result).toBe("")
  })

  it("çok satırlı text block içeriği olduğu gibi döndürülür", async () => {
    const multilineText = "Birinci satır.\nİkinci satır.\n\nÜçüncü paragraf."
    setupMockCreate(makeTextResponse(multilineText))

    const result = await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(result).toBe(multilineText)
  })
})

// ---------------------------------------------------------------------------
// getClient — Anthropic constructor davranışı
// ---------------------------------------------------------------------------

describe("getClient — Anthropic constructor davranışı", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = LONG_KEY
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it("Anthropic doğru apiKey ile oluşturulur", async () => {
    setupMockCreate(makeTextResponse("ok"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({ apiKey: LONG_KEY })
  })

  it("her getCoachReply çağrısında yeni bir Anthropic client oluşturulur", async () => {
    setupMockCreate(makeTextResponse("ok"))

    await getCoachReply(MESSAGES, SYSTEM_PROMPT)
    await getCoachReply(MESSAGES, SYSTEM_PROMPT)

    expect(vi.mocked(Anthropic)).toHaveBeenCalledTimes(2)
  })
})
