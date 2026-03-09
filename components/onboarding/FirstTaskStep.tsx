"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FirstTaskStepProps {
  onComplete: (taskTitle?: string) => void
  onBack: () => void
  loading: boolean
}

export function FirstTaskStep({ onComplete, onBack, loading }: FirstTaskStepProps) {
  const [title, setTitle] = useState("")

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">İlk görevinizi ekleyin</h2>
        <p className="text-sm text-muted-foreground mt-1">
          İsteğe bağlı — daha sonra da ekleyebilirsiniz.
        </p>
      </div>

      <Input
        placeholder="Örn: Raporu tamamla"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onComplete(title.trim() || undefined)}
        className="max-w-xs"
        autoFocus
      />

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Geri
        </Button>
        <Button
          onClick={() => onComplete(title.trim() || undefined)}
          disabled={loading}
          className="min-w-[140px]"
        >
          {loading ? "Kaydediliyor..." : "Başlayalım!"}
        </Button>
      </div>
    </div>
  )
}
