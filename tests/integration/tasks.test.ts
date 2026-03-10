import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock cagrilari hoist edilir — factory icinde dis scope degiskenlerine erisim OLMAZ.
// Bu nedenle mocklar modul seviyesinde tanimlanip vi.mocked() ile alinir.

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/client", () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock referanslari import'lardan sonra alinir
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { GET, POST } from "@/app/api/tasks/route"
import { PATCH, DELETE } from "@/app/api/tasks/[id]/route"

const mockAuth = vi.mocked(auth)
const mockTask = vi.mocked(prisma.task)

// ─────────────────────────────────────────────────────────────
// Test yardimcilari
// ─────────────────────────────────────────────────────────────

const AUTHENTICATED_SESSION = {
  user: { id: "user-abc", email: "test@example.com", name: "Test Kullanicisi" },
}

const TASK_FIXTURE = {
  id: "task-1",
  userId: "user-abc",
  title: "Test gorevi",
  description: null,
  priority: "P3",
  status: "TODO",
  tags: [] as string[],
  estimatedMinutes: null,
  dueDate: null,
  completedAt: null,
  sortOrder: 0,
  createdAt: new Date("2026-01-01T10:00:00Z"),
  updatedAt: new Date("2026-01-01T10:00:00Z"),
}

function makeRequest(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Request {
  const { method = "GET", body } = options
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { "Content-Type": "application/json" }
  }
  return new Request(url, init)
}

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

// ─────────────────────────────────────────────────────────────
// GET /api/tasks
// ─────────────────────────────────────────────────────────────
describe("GET /api/tasks — gorev listesi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await GET(makeRequest("http://localhost/api/tasks"))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
  })

  it("auth'lu istek gorevleri doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findMany.mockResolvedValue([TASK_FIXTURE])

    const res = await GET(makeRequest("http://localhost/api/tasks"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.tasks).toHaveLength(1)
    expect(body.tasks[0].id).toBe("task-1")
    expect(mockTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-abc" }),
      })
    )
  })

  it("bos gorev listesi bos dizi doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findMany.mockResolvedValue([])

    const res = await GET(makeRequest("http://localhost/api/tasks"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.tasks).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────
// POST /api/tasks
// ─────────────────────────────────────────────────────────────
describe("POST /api/tasks — gorev olusturma", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gecerli veri ile gorev olusturulur ve 201 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.create.mockResolvedValue({ ...TASK_FIXTURE, title: "Yeni gorev" })

    const res = await POST(
      makeRequest("http://localhost/api/tasks", {
        method: "POST",
        body: { title: "Yeni gorev", priority: "P2" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.task.title).toBe("Yeni gorev")
    expect(mockTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-abc",
          title: "Yeni gorev",
          priority: "P2",
        }),
      })
    )
  })

  it("title olmadan 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await POST(
      makeRequest("http://localhost/api/tasks", {
        method: "POST",
        body: { priority: "P1" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
    expect(mockTask.create).not.toHaveBeenCalled()
  })

  it("bos title string ile 400 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)

    const res = await POST(
      makeRequest("http://localhost/api/tasks", {
        method: "POST",
        body: { title: "" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe("Geçersiz veriler")
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(
      makeRequest("http://localhost/api/tasks", {
        method: "POST",
        body: { title: "Gorev" },
      })
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockTask.create).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/tasks/:id
// ─────────────────────────────────────────────────────────────
describe("PATCH /api/tasks/:id — gorev guncelleme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gorev basariyla guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue(TASK_FIXTURE)
    const updatedTask = { ...TASK_FIXTURE, title: "Guncellenmis gorev", status: "IN_PROGRESS" }
    mockTask.update.mockResolvedValue(updatedTask)

    const res = await PATCH(
      makeRequest("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        body: { title: "Guncellenmis gorev", status: "IN_PROGRESS" },
      }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.task.title).toBe("Guncellenmis gorev")
    expect(body.task.status).toBe("IN_PROGRESS")
  })

  it("status DONE olunca completedAt guncellenir", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue(TASK_FIXTURE)
    const completedTask = { ...TASK_FIXTURE, status: "DONE", completedAt: new Date() }
    mockTask.update.mockResolvedValue(completedTask)

    const res = await PATCH(
      makeRequest("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        body: { status: "DONE" },
      }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.task.status).toBe("DONE")
    expect(mockTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedAt: expect.any(Date),
        }),
      })
    )
  })

  it("olmayan gorev 404 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue(null)

    const res = await PATCH(
      makeRequest("http://localhost/api/tasks/gorev-yok", {
        method: "PATCH",
        body: { title: "Deneme" },
      }),
      makeParams("gorev-yok")
    )
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe("Bulunamadı")
    expect(mockTask.update).not.toHaveBeenCalled()
  })

  it("baska kullanicinin gorevi 403 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue({ ...TASK_FIXTURE, userId: "baska-kullanici" })

    const res = await PATCH(
      makeRequest("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        body: { title: "Deneme" },
      }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toBe("Yetkisiz")
    expect(mockTask.update).not.toHaveBeenCalled()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await PATCH(
      makeRequest("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        body: { title: "Deneme" },
      }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
  })
})

// ─────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
// ─────────────────────────────────────────────────────────────
describe("DELETE /api/tasks/:id — gorev silme", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gorev basariyla silinir (ARCHIVED durumuna alinir)", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue(TASK_FIXTURE)
    mockTask.update.mockResolvedValue({ ...TASK_FIXTURE, status: "ARCHIVED" })

    const res = await DELETE(
      makeRequest("http://localhost/api/tasks/task-1", { method: "DELETE" }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockTask.update).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: { status: "ARCHIVED" },
    })
  })

  it("olmayan gorev silinmeye calisilinca 404 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue(null)

    const res = await DELETE(
      makeRequest("http://localhost/api/tasks/gorev-yok", { method: "DELETE" }),
      makeParams("gorev-yok")
    )
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe("Bulunamadı")
    expect(mockTask.update).not.toHaveBeenCalled()
  })

  it("auth olmadan 401 doner", async () => {
    mockAuth.mockResolvedValue(null)

    const res = await DELETE(
      makeRequest("http://localhost/api/tasks/task-1", { method: "DELETE" }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe("Yetkisiz")
    expect(mockTask.findUnique).not.toHaveBeenCalled()
  })

  it("baska kullanicinin gorevi silinmeye calisilinca 403 doner", async () => {
    mockAuth.mockResolvedValue(AUTHENTICATED_SESSION)
    mockTask.findUnique.mockResolvedValue({ ...TASK_FIXTURE, userId: "baska-kullanici" })

    const res = await DELETE(
      makeRequest("http://localhost/api/tasks/task-1", { method: "DELETE" }),
      makeParams("task-1")
    )
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toBe("Yetkisiz")
    expect(mockTask.update).not.toHaveBeenCalled()
  })
})
