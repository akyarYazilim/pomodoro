import { z } from "zod"

export const createSessionSchema = z.object({
  mode: z.enum(["POMODORO", "FLOWTIME"]),
  taskId: z.string().optional(),
  plannedMinutes: z.number().int().min(1, "Planlanan süre pozitif olmalı").optional(),
})

export const updateSessionSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "PAUSED"]),
  actualMinutes: z.number().int().min(0, "Süre negatif olamaz").optional(),
  breakMinutes: z.number().int().min(0, "Mola süresi negatif olamaz").optional(),
  note: z.string().max(1000).optional(),
  mood: z.number().int().min(1, "Mood 1-5 arasında olmalı").max(5, "Mood 1-5 arasında olmalı").optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
