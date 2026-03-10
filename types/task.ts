export type TaskPriority = "P1" | "P2" | "P3" | "P4"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED"

export interface Task {
  id: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  estimatedMinutes: number | null
  actualMinutes: number
}
