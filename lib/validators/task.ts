import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().min(1, "Başlık boş olamaz").max(255, "Başlık 255 karakterden uzun olamaz"),
  description: z.string().optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  tags: z.array(z.string()).optional().default([]),
  estimatedMinutes: z.number().int().min(0, "Süre negatif olamaz").optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Başlık boş olamaz")
    .max(255, "Başlık 255 karakterden uzun olamaz")
    .optional(),
  description: z.string().optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  estimatedMinutes: z.number().int().min(0, "Süre negatif olamaz").optional(),
  dueDate: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
