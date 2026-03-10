"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOSInstructions, setIsIOSInstructions] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already installed as PWA — no banner needed
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Previously dismissed
    if (localStorage.getItem("pwa-banner-dismissed")) return

    // Android/Chrome: capture native install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handleInstallPrompt)

    // iOS Safari: no prompt available, show manual instructions
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/CriOS|Chrome/.test(navigator.userAgent)
    if (isIOS && isSafari) {
      setIsIOSInstructions(true)
      setVisible(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt)
  }, [])

  function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then(() => setInstallPrompt(null))
    setVisible(false)
  }

  function handleDismiss() {
    localStorage.setItem("pwa-banner-dismissed", "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 rounded-xl border bg-background shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xl select-none">
          🍅
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Uygulamayı Yükle</p>
          {isIOSInstructions ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Safari&apos;de <strong>Paylaş</strong> → <strong>Ana Ekrana Ekle</strong>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Offline çalış, hızlıca eriş
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {!isIOSInstructions && (
        <Button size="sm" className="w-full mt-3 gap-2" onClick={handleInstall}>
          <Download className="h-3.5 w-3.5" />
          Yükle
        </Button>
      )}
    </div>
  )
}
