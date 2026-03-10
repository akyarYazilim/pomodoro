"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateTaskInput } from "@/lib/validators/task"

const priorityOptions = [
  { value: "P1", label: "P1 — Acil" },
  { value: "P2", label: "P2 — Yüksek" },
  { value: "P3", label: "P3 — Normal" },
  { value: "P4", label: "P4 — Düşük" },
]

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>
  onCancel?: () => void
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"P1" | "P2" | "P3" | "P4">("P3")
  const [estimatedMinutes, setEstimatedMinutes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        priority,
        tags: [],
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      })
      toast.success("Görev eklendi")
      setTitle("")
      setEstimatedMinutes("")
      setPriority("P3")
    } catch {
      toast.error("Görev eklenemedi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="task-title">Görev</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ne yapacaksın?"
          autoFocus
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="task-priority">Öncelik</Label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <Label htmlFor="task-estimate">Tahmini (dk)</Label>
          <Input
            id="task-estimate"
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="25"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            İptal
          </Button>
        )}
        <Button type="submit" size="sm" disabled={loading || !title.trim()}>
          {loading ? "Ekleniyor..." : "Ekle"}
        </Button>
      </div>
    </form>
  )
}
