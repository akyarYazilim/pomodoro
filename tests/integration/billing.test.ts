import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock cagrilari hoist edilir — factory icinde dis scope degiskenlerine erisim OLMAZ.
// constructEvent mock'u vi.hoisted ile alttaki mock instance ile eslestiriliyor.

const { mockConstructEvent, mockPrismaUser } = vi.hoisted(() => {
  return {
    mockConstructEvent: vi.fn(),
    mockPrismaUser: {
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  }
})

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: mockPrismaUser,
  },
}))

// Stripe mock — getStripe() factory'nin new Stripe() cagrisini yakala.
// Arrow function constructor olamaz, class syntax gerekli.
vi.mock("stripe", () => {
  class MockStripe {
    webhooks = { constructEvent: mockConstructEvent }
    constructor() {}
  }
  return { default: MockStripe }
})

import { prisma } from "@/lib/db/client"
import { POST } from "@/app/api/billing/webhook/route"

// ─────────────────────────────────────────────────────────────
// Test yardimcilari
// ─────────────────────────────────────────────────────────────

function makeWebhookRequest(body: string, signature = "valid-sig"): Request {
  return new Request("http://localhost/api/billing/webhook", {
    method: "POST",
    body,
    headers: { "stripe-signature": signature },
  })
}

function makeCheckoutEvent(
  overrides: {
    userId?: string
    period?: string
    customer?: string
    subscription?: string
  } = {}
): object {
  const {
    userId = "user-xyz",
    period = "monthly",
    customer = "cus_123",
    subscription = "sub_456",
  } = overrides

  return {
    type: "checkout.session.completed",
    data: {
      object: {
        metadata: { userId, period },
        customer,
        subscription,
      },
    },
  }
}

function makeSubscriptionDeletedEvent(subscriptionId = "sub_456"): object {
  return {
    type: "customer.subscription.deleted",
    data: {
      object: { id: subscriptionId },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/billing/webhook
// ─────────────────────────────────────────────────────────────

describe("POST /api/billing/webhook — Stripe webhook isleme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("checkout.session.completed (monthly) → kullanici pro plana guncellenir, 1 ay gecerlilik eklenir", async () => {
    const event = makeCheckoutEvent({ period: "monthly" })
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.update.mockResolvedValue({})

    const before = new Date()
    const res = await POST(makeWebhookRequest(JSON.stringify(event)))
    const body = await res.json()
    const after = new Date()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(mockPrismaUser.update).toHaveBeenCalledOnce()

    const updateCall = mockPrismaUser.update.mock.calls[0][0]
    expect(updateCall.where).toEqual({ id: "user-xyz" })
    expect(updateCall.data.plan).toBe("pro")
    expect(updateCall.data.stripeCustomerId).toBe("cus_123")
    expect(updateCall.data.stripeSubscriptionId).toBe("sub_456")

    // planExpiresAt 1 ay sonrasi olmali — yaklasik olarak kontrol edilir (±2 saniye tolerans)
    const expires: Date = updateCall.data.planExpiresAt
    expect(expires).toBeInstanceOf(Date)
    const expectedMin = new Date(before)
    expectedMin.setMonth(expectedMin.getMonth() + 1)
    const expectedMax = new Date(after)
    expectedMax.setMonth(expectedMax.getMonth() + 1)
    expectedMax.setSeconds(expectedMax.getSeconds() + 2) // 2 saniye tolerans
    expect(expires.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime())
    expect(expires.getTime()).toBeLessThanOrEqual(expectedMax.getTime())
  })

  it("checkout.session.completed (yearly) → planExpiresAt 1 yil sonra atanir", async () => {
    const event = makeCheckoutEvent({ period: "yearly" })
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.update.mockResolvedValue({})

    const before = new Date()
    await POST(makeWebhookRequest(JSON.stringify(event)))

    const updateCall = mockPrismaUser.update.mock.calls[0][0]
    const expires: Date = updateCall.data.planExpiresAt

    expect(updateCall.data.plan).toBe("pro")
    expect(expires).toBeInstanceOf(Date)

    // 1 yil = yaklasik 365 gun — en az 364 gun ileride olmali
    const minExpected = new Date(before)
    minExpected.setFullYear(minExpected.getFullYear() + 1)
    minExpected.setDate(minExpected.getDate() - 1) // 1 gun tolerans
    expect(expires.getTime()).toBeGreaterThanOrEqual(minExpected.getTime())
  })

  it("checkout.session.completed (lifetime) → plan 'lifetime', planExpiresAt null kalir", async () => {
    const event = makeCheckoutEvent({ period: "lifetime", subscription: undefined as unknown as string })
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.update.mockResolvedValue({})

    await POST(makeWebhookRequest(JSON.stringify(event)))

    const updateCall = mockPrismaUser.update.mock.calls[0][0]
    expect(updateCall.data.plan).toBe("lifetime")
    expect(updateCall.data.planExpiresAt).toBeNull()
  })

  it("customer.subscription.deleted → kullanici free plana dusurulur", async () => {
    const event = makeSubscriptionDeletedEvent("sub_456")
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.updateMany.mockResolvedValue({ count: 1 })

    const res = await POST(makeWebhookRequest(JSON.stringify(event)))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(mockPrismaUser.updateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_456" },
      data: { plan: "free", stripeSubscriptionId: null, planExpiresAt: null },
    })
  })

  it("gecersiz imza → 400 'Webhook imzası geçersiz' doner", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload")
    })

    const res = await POST(makeWebhookRequest("{}", "bad-signature"))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Webhook imzası geçersiz")
    expect(mockPrismaUser.update).not.toHaveBeenCalled()
    expect(mockPrismaUser.updateMany).not.toHaveBeenCalled()
  })

  it("eksik userId metadata → 400 'Eksik metadata' doner", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { period: "monthly" }, // userId yok
          customer: "cus_123",
          subscription: "sub_456",
        },
      },
    }
    mockConstructEvent.mockReturnValue(event)

    const res = await POST(makeWebhookRequest(JSON.stringify(event)))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Eksik metadata")
    expect(mockPrismaUser.update).not.toHaveBeenCalled()
  })

  it("eksik period metadata → 400 'Eksik metadata' doner", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-xyz" }, // period yok
          customer: "cus_123",
          subscription: "sub_456",
        },
      },
    }
    mockConstructEvent.mockReturnValue(event)

    const res = await POST(makeWebhookRequest(JSON.stringify(event)))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Eksik metadata")
    expect(mockPrismaUser.update).not.toHaveBeenCalled()
  })

  it("bilinmeyen event type → 200 { received: true } pass-through doner", async () => {
    const event = {
      type: "payment_intent.succeeded",
      data: { object: {} },
    }
    mockConstructEvent.mockReturnValue(event)

    const res = await POST(makeWebhookRequest(JSON.stringify(event)))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(mockPrismaUser.update).not.toHaveBeenCalled()
    expect(mockPrismaUser.updateMany).not.toHaveBeenCalled()
  })

  it("checkout subscription string degil ise stripeSubscriptionId null olur", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-xyz", period: "monthly" },
          customer: "cus_123",
          subscription: { id: "sub_obj" }, // string degil, obje
        },
      },
    }
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.update.mockResolvedValue({})

    await POST(makeWebhookRequest(JSON.stringify(event)))

    const updateCall = mockPrismaUser.update.mock.calls[0][0]
    expect(updateCall.data.stripeSubscriptionId).toBeNull()
  })

  it("customer null olunca stripeCustomerId null olarak kaydedilir", async () => {
    // Stripe null customer gonderdiginde route null olarak yazmalı
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-xyz", period: "monthly" },
          customer: null,       // Stripe customer yokken null gonderir
          subscription: "sub_789",
        },
      },
    }
    mockConstructEvent.mockReturnValue(event)
    mockPrismaUser.update.mockResolvedValue({})

    await POST(makeWebhookRequest(JSON.stringify(event)))

    const updateCall = mockPrismaUser.update.mock.calls[0][0]
    expect(updateCall.data.stripeCustomerId).toBeNull()
  })
})
