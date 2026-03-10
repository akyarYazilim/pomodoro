import { describe, it, expect, beforeEach } from "vitest"
import { useTaskStore } from "@/stores/task-store"
import type { Task } from "@/types/task"

const mockTask: Task = {
  id: "task-1",
  title: "Test görevi",
  priority: "P2",
  status: "TODO",
  estimatedMinutes: 25,
  actualMinutes: 0,
}

describe("Task Store", () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      loading: false,
      initialized: false,
    })
  })

  it("başlangıç state doğru", () => {
    const state = useTaskStore.getState()
    expect(state.tasks).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(false)
  })

  describe("addTask", () => {
    it("görevi listeye ekler", () => {
      useTaskStore.getState().addTask(mockTask)
      expect(useTaskStore.getState().tasks).toHaveLength(1)
      expect(useTaskStore.getState().tasks[0]).toEqual(mockTask)
    })

    it("yeni görev listenin başına eklenir", () => {
      const task2: Task = { ...mockTask, id: "task-2", title: "İkinci görev" }
      useTaskStore.getState().addTask(mockTask)
      useTaskStore.getState().addTask(task2)
      expect(useTaskStore.getState().tasks[0].id).toBe("task-2")
    })
  })

  describe("updateTask", () => {
    it("görevi günceller", () => {
      useTaskStore.setState({ tasks: [mockTask] })
      useTaskStore.getState().updateTask("task-1", { status: "DONE" })
      expect(useTaskStore.getState().tasks[0].status).toBe("DONE")
    })

    it("diğer alanları değiştirmez", () => {
      useTaskStore.setState({ tasks: [mockTask] })
      useTaskStore.getState().updateTask("task-1", { status: "DONE" })
      expect(useTaskStore.getState().tasks[0].title).toBe("Test görevi")
    })

    it("olmayan id'yi güncellemeye çalışmak listeyi değiştirmez", () => {
      useTaskStore.setState({ tasks: [mockTask] })
      useTaskStore.getState().updateTask("nonexistent", { status: "DONE" })
      expect(useTaskStore.getState().tasks[0].status).toBe("TODO")
    })
  })

  describe("removeTask", () => {
    it("görevi siler", () => {
      useTaskStore.setState({ tasks: [mockTask] })
      useTaskStore.getState().removeTask("task-1")
      expect(useTaskStore.getState().tasks).toHaveLength(0)
    })

    it("olmayan id'yi silmeye çalışmak listeyi değiştirmez", () => {
      useTaskStore.setState({ tasks: [mockTask] })
      useTaskStore.getState().removeTask("nonexistent")
      expect(useTaskStore.getState().tasks).toHaveLength(1)
    })
  })
})
