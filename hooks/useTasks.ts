"use client"

import { useEffect } from "react"
import { useTaskStore } from "@/stores/task-store"
import { sounds } from "@/lib/utils/sounds"
import type { CreateTaskInput } from "@/lib/validators/task"

export function useTasks() {
  const { tasks, loading, fetchTasks, addTask, updateTask, removeTask } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const activeTasks = tasks.filter((t) => t.status !== "DONE" && t.status !== "ARCHIVED")
  const doneTasks = tasks.filter((t) => t.status === "DONE")

  async function createTask(input: CreateTaskInput): Promise<boolean> {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const { task } = await res.json()
      addTask(task)
      return true
    }
    return false
  }

  async function completeTask(id: string) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newStatus = task.status === "DONE" ? "TODO" : "DONE"
    if (newStatus === "DONE") sounds.taskDone()
    updateTask(id, { status: newStatus })
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  async function deleteTask(id: string) {
    removeTask(id)
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
  }

  async function decomposeTask(title: string): Promise<string[]> {
    const res = await fetch("/api/coach/decompose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.steps ?? []
  }

  return { tasks, activeTasks, doneTasks, loading, createTask, completeTask, deleteTask, decomposeTask }
}
