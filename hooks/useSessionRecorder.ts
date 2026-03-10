"use client"

import { useRef, useCallback } from "react"
import { toast } from "sonner"
import type { TimerCompletePayload } from "@/hooks/useTimer"
import { sounds } from "@/lib/utils/sounds"

interface SessionRecorderReturn {
  onTimerComplete: (payload: TimerCompletePayload) => Promise<void>
}

export function useSessionRecorder(): SessionRecorderReturn {
  const activeSessionIdRef = useRef<string | null>(null)

  const onTimerComplete = useCallback(async (payload: TimerCompletePayload) => {
    const { mode, phase, durationSeconds, taskId } = payload

    // Only record FOCUS phases (not breaks)
    if (mode === "POMODORO" && phase !== "FOCUS") return
    if (durationSeconds < 60) return

    sounds.workComplete()

    const actualMinutes = Math.floor(durationSeconds / 60)

    try {
      if (activeSessionIdRef.current) {
        // Complete the existing session
        await fetch(`/api/sessions/${activeSessionIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED", actualMinutes }),
        })
        activeSessionIdRef.current = null
      } else {
        // Create + immediately complete (single-shot recording)
        const createRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, taskId: taskId ?? undefined }),
        })
        if (!createRes.ok) return
        const { session } = await createRes.json()

        await fetch(`/api/sessions/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED", actualMinutes }),
        })

        // Streak güncelle
        await fetch("/api/stats/streak", { method: "POST" })
      }
      toast.success(`${actualMinutes} dakika odaklanma kaydedildi`)
    } catch {
      // Session kaydı arka planda — hata kullanıcıyı engellemez
    }
  }, [])

  return { onTimerComplete }
}
