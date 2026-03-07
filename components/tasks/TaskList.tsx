"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskItem } from "./TaskItem"
import { TaskForm } from "./TaskForm"
import type { CreateTaskInput } from "@/lib/validators/task"

interface Task {
  id: string
  title: string
  priority: "P1" | "P2" | "P3" | "P4"
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED"
  estimatedMinutes: number | null
  actualMinutes: number
}

interface TaskListProps {
  onStartTimer?: (taskId: string) => void
}

export function TaskList({ onStartTimer }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks")
    if (res.ok) {
      const data = await res.json()
      setTasks(data.tasks)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleCreate(input: CreateTaskInput) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const { task } = await res.json()
      setTasks((prev) => [task, ...prev])
      setShowForm(false)
    }
  }

  async function handleComplete(id: string) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newStatus = task.status === "DONE" ? "TODO" : "DONE"

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))

    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
  }

  const activeTasks = tasks.filter((t) => t.status !== "DONE")
  const doneTasks = tasks.filter((t) => t.status === "DONE")

  if (loading) {
    return <div className="text-sm text-muted-foreground py-4 text-center">Yükleniyor...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Görevler ({activeTasks.length})
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Ekle
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-3">
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-1.5">
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onStartTimer={onStartTimer}
          />
        ))}
        {activeTasks.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Henüz görev yok. Ekle butonuna bas!
          </p>
        )}
      </div>

      {doneTasks.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t">
          <p className="text-xs text-muted-foreground">Tamamlananlar ({doneTasks.length})</p>
          {doneTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
