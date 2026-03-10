import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock cagrilari hoist edilir — factory icinde dis scope degiskenlerine erisim OLMAZ.
// Bu nedenle mocklar modul seviyesinde tanimlanip vi.mocked() ile alinir.

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password-xyz"),
  },
}))

import { prisma } from "@/lib/db/client"
import bcrypt from "bcryptjs"
import { POST } from "@/app/api/auth/register/route"

const mockUser = vi.mocked(prisma.user)
const mockBcrypt = vi.mocked(bcrypt)

// ─────────────────────────────────────────────────────────────
// Test yardimcilari
// ─────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

const VALID_PAYLOAD = {
  name: "Test Kullanici",
  email: "test@example.com",
  password: "guvenli-sifre",
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register — kullanici kaydi
// ─────────────────────────────────────────────────────────────

describe("POST /api/auth/register — kullanici kaydi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Varsayilan: kullanici mevcut degil
    mockUser.findUnique.mockResolvedValue(null)
    mockUser.create.mockResolvedValue({
      id: "new-user-123",
      name: VALID_PAYLOAD.name,
      email: VALID_PAYLOAD.email,
      passwordHash: "hashed-password-xyz",
    })
  })

  it("gecerli veri ile kayit basarili olur ve 201 doner", async () => {
    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
  })

  it("gecersiz email ile 400 doner", async () => {
    const res = await POST(
      makeRequest({ ...VALID_PAYLOAD, email: "bu-email-degil" })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("kisa sifre (<8 karakter) ile 400 doner", async () => {
    const res = await POST(
      makeRequest({ ...VALID_PAYLOAD, password: "kisa" })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("tam 8 karakterli sifre ile basarili kayit olur", async () => {
    const res = await POST(
      makeRequest({ ...VALID_PAYLOAD, password: "12345678" })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
  })

  it("isim olmadan 400 doner", async () => {
    const { name: _, ...withoutName } = VALID_PAYLOAD

    const res = await POST(makeRequest(withoutName))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("bos isim string ile 400 doner", async () => {
    const res = await POST(
      makeRequest({ ...VALID_PAYLOAD, name: "" })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("mevcut email ile 409 'Bu email zaten kayıtlı' doner", async () => {
    mockUser.findUnique.mockResolvedValue({
      id: "existing-user",
      email: VALID_PAYLOAD.email,
    })

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toBe("Bu email zaten kayıtlı")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("sifre hash'lenir — bcrypt.hash dogru argümanlarla cagirilir", async () => {
    await POST(makeRequest(VALID_PAYLOAD))

    expect(mockBcrypt.hash).toHaveBeenCalledWith(VALID_PAYLOAD.password, 12)
    expect(mockBcrypt.hash).toHaveBeenCalledOnce()
  })

  it("prisma.create hash'lenmis sifre ve dogru veriyle cagirilir", async () => {
    await POST(makeRequest(VALID_PAYLOAD))

    expect(mockUser.create).toHaveBeenCalledWith({
      data: {
        name: VALID_PAYLOAD.name,
        email: VALID_PAYLOAD.email,
        passwordHash: "hashed-password-xyz",
      },
    })
  })

  it("prisma.create hata firlatinca 500 doner", async () => {
    mockUser.create.mockRejectedValue(new Error("DB baglantisi kesildi"))

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Sunucu hatası")
  })

  it("bcrypt hata firlatinca 500 doner", async () => {
    mockBcrypt.hash.mockRejectedValue(new Error("bcrypt basarisiz"))

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Sunucu hatası")
    expect(mockUser.create).not.toHaveBeenCalled()
  })

  it("email findUnique dogrulanir — dogru where ile cagirilir", async () => {
    await POST(makeRequest(VALID_PAYLOAD))

    expect(mockUser.findUnique).toHaveBeenCalledWith({
      where: { email: VALID_PAYLOAD.email },
    })
  })

  it("response body'de passwordHash alanı donulmez", async () => {
    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(body.passwordHash).toBeUndefined()
    expect(body.password).toBeUndefined()
  })
})
