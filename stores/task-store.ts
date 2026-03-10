import { create } from "zustand"
import type { Task } from "@/types/task"

interface TaskStore {
  tasks: Task[]
  loading: boolean
  initialized: boolean
  fetchTasks: () => Promise<void>
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: true,
  initialized: false,

  fetchTasks: async () => {
    if (get().initialized) return
    set((state) => ({ ...state, initialized: true, loading: true }))

    const res = await fetch("/api/tasks")
    if (res.ok) {
      const data = await res.json()
      set((state) => ({ ...state, tasks: data.tasks, loading: false }))
    } else {
      set((state) => ({ ...state, loading: false }))
    }
  },

  addTask: (task) =>
    set((state) => ({ ...state, tasks: [task, ...state.tasks] })),

  updateTask: (id, patch) =>
    set((state) => ({
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTask: (id) =>
    set((state) => ({ ...state, tasks: state.tasks.filter((t) => t.id !== id) })),
}))
