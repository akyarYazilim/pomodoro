"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useRoom } from "@/hooks/useRoom"
import { useTimerStore } from "@/stores/timer-store"
import { RoomParticipants } from "@/components/room/RoomParticipants"
import { Leaderboard } from "@/components/room/Leaderboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  ArrowLeft,
  Users,
  Trophy,
} from "lucide-react"

interface PageProps {
  params: Promise<{ code: string }>
}

export default function RoomCodePage({ params }: PageProps) {
  const { code } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const { room, leaderboard, loading, error, updateStatus } = useRoom(code)
  const timerStatus = useTimerStore((s) => s.status)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<"participants" | "leaderboard">("participants")

  // Sync timer status → room working status
  useEffect(() => {
    if (!session?.user?.id) return
    const isWorking = timerStatus === "RUNNING"
    updateStatus(isWorking)
  }, [timerStatus, updateStatus, session?.user?.id])

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading && !room) {
    return (
      <div className="max-w-md mx-auto space-y-4 pt-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto pt-8 text-center space-y-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/room")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    )
  }

  const currentUserId = session?.user?.id ?? ""
  const memberCount = room?.members.length ?? 0
  const workingCount = room?.members.filter((m) => m.isWorking).length ?? 0

  return (
    <div className="max-w-md mx-auto space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/room")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{room?.name ?? "Çalışma Odası"}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm text-muted-foreground">{code}</span>
            <button onClick={copyCode} className="text-muted-foreground hover:text-foreground transition-colors">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
          {workingCount}/{memberCount}
        </Badge>
      </div>

      {/* Timer sync hint */}
      <p className="text-xs text-muted-foreground text-center">
        Timer&apos;ı başlatınca durumun otomatik güncellenir
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setTab("participants")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "participants"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Katılımcılar
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "leaderboard"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          Bu Hafta
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {tab === "participants" ? "Odadakiler" : "Haftalık Sıralama"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab === "participants" ? (
            <RoomParticipants
              members={room?.members ?? []}
              currentUserId={currentUserId}
            />
          ) : (
            <Leaderboard entries={leaderboard} currentUserId={currentUserId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
