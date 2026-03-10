"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useTimerStore } from "@/stores/timer-store"

const POMODORO_DURATIONS = [15, 20, 25, 30, 45]
const BREAK_DURATIONS = [5, 10, 15, 20]
const LONG_BREAK_DURATIONS = [10, 15, 20, 30]

export default function SettingsPage() {
  const { update } = useSession()
  const { config, mode: storeMode, initFromSession } = useTimerStore()

  const [timerMode, setTimerMode] = useState<"POMODORO" | "FLOWTIME">(storeMode)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(config.pomodoroMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(config.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(config.longBreakMinutes)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.defaultTimerMode) setTimerMode(data.defaultTimerMode)
        if (data.pomodoroMinutes) setPomodoroMinutes(data.pomodoroMinutes)
        if (data.shortBreakMinutes) setShortBreakMinutes(data.shortBreakMinutes)
        if (data.longBreakMinutes) setLongBreakMinutes(data.longBreakMinutes)
        if (data.dailyGoalMinutes) setDailyGoalMinutes(data.dailyGoalMinutes)
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultTimerMode: timerMode,
          pomodoroMinutes,
          shortBreakMinutes,
          longBreakMinutes,
          dailyGoalMinutes,
        }),
      })

      if (!res.ok) {
        toast.error("Ayarlar kaydedilemedi")
        return
      }

      // JWT'yi güncelle
      await update({
        pomodoroMinutes,
        shortBreakMinutes,
        longBreakMinutes,
        defaultTimerMode: timerMode,
      })

      // Store'u güncelle (force=true: timer çalışmıyorsa override et)
      initFromSession({
        pomodoroMinutes,
        shortBreakMinutes,
        longBreakMinutes,
        defaultTimerMode: timerMode,
      }, true)

      toast.success("Ayarlar kaydedildi")
    } catch {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Yükleniyor...</div>
  }

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-1">Timer ve hedef tercihlerinizi yönetin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timer Modu</CardTitle>
          <CardDescription>Varsayılan çalışma modu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {(["POMODORO", "FLOWTIME"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTimerMode(m)}
                className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  timerMode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {m === "POMODORO" ? "Pomodoro" : "Flowtime"}
              </button>
            ))}
          </div>

          {timerMode === "POMODORO" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Çalışma süresi</Label>
                <div className="flex gap-2 flex-wrap">
                  {POMODORO_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setPomodoroMinutes(d)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        pomodoroMinutes === d
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {d}dk
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Kısa mola</Label>
                <div className="flex gap-2 flex-wrap">
                  {BREAK_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setShortBreakMinutes(d)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        shortBreakMinutes === d
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {d}dk
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Uzun mola</Label>
                <div className="flex gap-2 flex-wrap">
                  {LONG_BREAK_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setLongBreakMinutes(d)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        longBreakMinutes === d
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {d}dk
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Günlük Hedef</CardTitle>
          <CardDescription>Günde ne kadar odaklanmak istiyorsunuz?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              max={600}
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">dakika / gün</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  )
}
