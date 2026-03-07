export type SessionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED"
export type SessionMode = "POMODORO" | "FLOWTIME"

export interface Session {
  id: string
  userId: string
  taskId: string | null
  mode: SessionMode
  status: SessionStatus
  startedAt: Date
  endedAt: Date | null
  plannedMinutes: number | null
  actualMinutes: number
  breakMinutes: number
  note: string | null
  mood: number | null
}

export interface CreateSessionInput {
  taskId?: string
  mode: SessionMode
  plannedMinutes?: number
}

export interface UpdateSessionInput {
  status: SessionStatus
  actualMinutes?: number
  breakMinutes?: number
  note?: string
  mood?: number
}
