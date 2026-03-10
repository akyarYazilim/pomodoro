"use client"

import { useState } from "react"
import { Check, Trash2, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  priority: "P1" | "P2" | "P3" | "P4"
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED"
  estimatedMinutes: number | null
  actualMinutes: number
}

interface TaskItemProps {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onStartTimer?: (id: string) => void
}

const priorityColors: Record<Task["priority"], string> = {
  P1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  P2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  P3: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  P4: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

export function TaskItem({ task, onComplete, onDelete, onStartTimer }: TaskItemProps) {
  const isDone = task.status === "DONE"
  const [bouncing, setBouncing] = useState(false)

  function handleComplete() {
    if (!isDone) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 1000)
    }
    onComplete(task.id)
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
      isDone && "opacity-50"
    )}>
      <button
        onClick={handleComplete}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isDone
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/40 hover:border-emerald-500",
          bouncing && "animate-bounce"
        )}
      >
        {isDone && <Check className="h-3 w-3" />}
      </button>

      <span className={cn("flex-1 text-sm", isDone && "line-through text-muted-foreground")}>
        {task.title}
      </span>

      <div className="flex items-center gap-1.5">
        <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", priorityColors[task.priority])}>
          {task.priority}
        </span>
        {task.estimatedMinutes && (
          <span className="text-xs text-muted-foreground">{task.estimatedMinutes}dk</span>
        )}
        {onStartTimer && !isDone && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onStartTimer(task.id)}
            title="Timer başlat"
          >
            <Timer className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(task.id)}
          title="Sil"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
