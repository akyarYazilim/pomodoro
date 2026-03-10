"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import type { TimerCompletePayload } from "@/hooks/useTimer"
import { sounds } from "@/lib/utils/sounds"

interface SessionRecorderReturn {
  onTimerComplete: (payload: TimerCompletePayload) => Promise<string | null>
  submitMood: (sessionId: string, mood: number) => Promise<void>
}

export function useSessionRecorder(): SessionRecorderReturn {
  const onTimerComplete = useCallback(async (payload: TimerCompletePayload): Promise<string | null> => {
    const { mode, phase, durationSeconds, taskId } = payload

    // Only record FOCUS phases (not breaks)
    if (mode === "POMODORO" && phase !== "FOCUS") return null
    if (durationSeconds < 60) return null

    sounds.workComplete()

    const actualMinutes = Math.floor(durationSeconds / 60)

    try {
      // Create + immediately complete (single-shot recording)
      const createRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, taskId: taskId ?? undefined }),
      })
      if (!createRes.ok) return null
      const { session } = await createRes.json()

      await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", actualMinutes }),
      })

      // Streak güncelle
      await fetch("/api/stats/streak", { method: "POST" })

      toast.success(`${actualMinutes} dakika odaklanma kaydedildi`)
      return session.id
    } catch {
      // Session kaydı arka planda — hata kullanıcıyı engellemez
      return null
    }
  }, [])

  const submitMood = useCallback(async (sessionId: string, mood: number) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      })
    } catch {
      // Mood kaydı opsiyonel — hata sessizce geçilir
    }
  }, [])

  return { onTimerComplete, submitMood }
}
