"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskItem } from "./TaskItem"
import { TaskForm } from "./TaskForm"
import { useTasks } from "@/hooks/useTasks"
import type { CreateTaskInput } from "@/lib/validators/task"

interface TaskListProps {
  onStartTimer?: (taskId: string) => void
}

export function TaskList({ onStartTimer }: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const { activeTasks, doneTasks, loading, createTask, completeTask, deleteTask } = useTasks()

  async function handleCreate(input: CreateTaskInput) {
    const ok = await createTask(input)
    if (ok) setShowForm(false)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
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
            onComplete={completeTask}
            onDelete={deleteTask}
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
              onComplete={completeTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
