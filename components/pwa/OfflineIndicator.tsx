"use client"

import { WifiOff } from "lucide-react"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 text-sm font-semibold text-yellow-950">
      <WifiOff className="h-4 w-4" />
      Çevrimdışı — timer çalışmaya devam ediyor
    </div>
  )
}
