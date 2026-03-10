// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTasks } from "@/hooks/useTasks"
import { useTaskStore } from "@/stores/task-store"
import { sounds } from "@/lib/utils/sounds"

vi.mock("@/lib/utils/sounds", () => ({
  sounds: {
    workComplete: vi.fn(),
    breakEnd: vi.fn(),
    taskDone: vi.fn(),
  },
}))

const mockTask = {
  id: "task-1",
  title: "Test Görevi",
  status: "TODO" as const,
  priority: "P3" as const,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  description: null,
  estimatedMinutes: null,
  actualMinutes: 0,
  dueDate: null,
  sortOrder: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  useTaskStore.setState({ tasks: [mockTask], loading: false, initialized: true })
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ task: mockTask }) })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useTasks — completeTask", () => {
  it("TODO → DONE geçişinde sounds.taskDone çağrılır", async () => {
    const { result } = renderHook(() => useTasks())
    await act(async () => {
      await result.current.completeTask("task-1")
    })
    expect(sounds.taskDone).toHaveBeenCalledOnce()
  })

  it("DONE → TODO geçişinde sounds.taskDone çağrılmaz", async () => {
    useTaskStore.setState({ tasks: [{ ...mockTask, status: "DONE" }], loading: false, initialized: true })
    const { result } = renderHook(() => useTasks())
    await act(async () => {
      await result.current.completeTask("task-1")
    })
    expect(sounds.taskDone).not.toHaveBeenCalled()
  })

  it("var olmayan task için hiçbir şey yapmaz", async () => {
    const { result } = renderHook(() => useTasks())
    await act(async () => {
      await result.current.completeTask("nonexistent")
    })
    expect(sounds.taskDone).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe("useTasks — createTask", () => {
  it("başarılı create true döner", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ task: { ...mockTask, id: "task-new" } }),
    })
    const { result } = renderHook(() => useTasks())
    let success: boolean | undefined
    await act(async () => {
      success = await result.current.createTask({ title: "Yeni Görev", priority: "P3", tags: [] })
    })
    expect(success).toBe(true)
  })

  it("başarısız create false döner", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    const { result } = renderHook(() => useTasks())
    let success: boolean | undefined
    await act(async () => {
      success = await result.current.createTask({ title: "Yeni Görev", priority: "P3", tags: [] })
    })
    expect(success).toBe(false)
  })
})
