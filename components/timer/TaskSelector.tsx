"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  priority: "P1" | "P2" | "P3" | "P4"
}

interface TaskSelectorProps {
  activeTaskId: string | null
  onSelect: (taskId: string | null) => void
  disabled?: boolean
}

const priorityColors: Record<Task["priority"], string> = {
  P1: "text-red-600 dark:text-red-400",
  P2: "text-orange-500 dark:text-orange-400",
  P3: "text-blue-600 dark:text-blue-400",
  P4: "text-zinc-500",
}

export function TaskSelector({ activeTaskId, onSelect, disabled }: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks?.filter((t: Task & { status: string }) => t.status !== "DONE") ?? []))
      .catch(() => {})
  }, [])

  const activeTask = tasks.find((t) => t.id === activeTaskId)

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
          "hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
          activeTask ? "border-border" : "border-dashed text-muted-foreground"
        )}
      >
        {activeTask ? (
          <>
            <span className={priorityColors[activeTask.priority]}>{activeTask.priority}</span>
            <span className="max-w-[180px] truncate">{activeTask.title}</span>
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onSelect(null) }}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <span>Görev seç (opsiyonel)</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-20 w-72 rounded-lg border bg-popover shadow-md">
            {tasks.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aktif görev yok
              </p>
            ) : (
              <ul className="max-h-48 overflow-y-auto p-1">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                        task.id === activeTaskId && "bg-muted"
                      )}
                      onClick={() => { onSelect(task.id); setOpen(false) }}
                    >
                      <span className={cn("font-medium text-xs", priorityColors[task.priority])}>
                        {task.priority}
                      </span>
                      <span className="truncate">{task.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
