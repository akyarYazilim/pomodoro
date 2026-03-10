"use client"

import { useState } from "react"
import { Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskItem } from "./TaskItem"
import { TaskForm } from "./TaskForm"
import { useTasks } from "@/hooks/useTasks"
import { cn } from "@/lib/utils"
import type { CreateTaskInput } from "@/lib/validators/task"

interface TaskListProps {
  onStartTimer?: (taskId: string) => void
}

const PRIORITY_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 } as const

export function TaskList({ onStartTimer }: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const { activeTasks, doneTasks, loading, createTask, completeTask, deleteTask, decomposeTask } = useTasks()

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

  const sortedActive = [...activeTasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
  const displayedTasks = focusMode ? sortedActive.slice(0, 3) : sortedActive
  const hiddenCount = focusMode ? Math.max(0, sortedActive.length - 3) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Görevler ({activeTasks.length})
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFocusMode(!focusMode)}
            className={cn(focusMode && "text-primary bg-primary/10")}
            title={focusMode ? "Tüm görevleri göster" : "Odak modu (3 görev)"}
          >
            <Target className="h-4 w-4 mr-1" />
            Odak
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Ekle
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border p-3">
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-1.5">
        {displayedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={completeTask}
            onDelete={deleteTask}
            onStartTimer={onStartTimer}
            onDecompose={decomposeTask}
            onCreateSubtask={(title) => createTask({ title, priority: "P4", tags: [] })}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            className="w-full text-xs text-muted-foreground text-center py-1.5 hover:text-foreground transition-colors"
            onClick={() => setFocusMode(false)}
          >
            + {hiddenCount} görev daha — tümünü göster
          </button>
        )}
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
