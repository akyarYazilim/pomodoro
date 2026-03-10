"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function NotificationPermissionCard() {
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "loading">("idle")

  useEffect(() => {
    if (typeof Notification === "undefined") return
    if (Notification.permission === "granted") setStatus("granted")
    else if (Notification.permission === "denied") setStatus("denied")
  }, [])

  async function handleEnable() {
    if (typeof Notification === "undefined") return
    setStatus("loading")

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      setStatus("denied")
      return
    }

    await fetch("/api/user/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "browser-notification-enabled" }),
    }).catch(() => {})

    setStatus("granted")
  }

  async function handleDisable() {
    setStatus("loading")
    await fetch("/api/user/notifications", { method: "DELETE" }).catch(() => {})
    setStatus("idle")
  }

  if (status === "denied") return null

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Bildirimler</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status === "granted"
                ? "Streak hatırlatıcıları ve haftalık özet için bildirimler açık."
                : "Günlük hatırlatıcı ve haftalık özet için bildirimleri etkinleştir."}
            </p>
          </div>
        </div>

        {status === "granted" ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleDisable}
            disabled={false}
          >
            <BellOff className="h-3.5 w-3.5 mr-1.5" />
            Kapat
          </Button>
        ) : (
          <Button
            size="sm"
            className="shrink-0"
            onClick={handleEnable}
            disabled={status === "loading"}
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Etkinleştir
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
