"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRoom } from "@/hooks/useRoom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, ArrowRight } from "lucide-react"

export default function RoomPage() {
  const router = useRouter()
  const { createRoom, joinRoom, loading, error } = useRoom()
  const [roomName, setRoomName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle")

  const handleCreate = async () => {
    const code = await createRoom(roomName.trim() || undefined)
    if (code) router.push(`/room/${code}`)
  }

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    const ok = await joinRoom(code)
    if (ok) router.push(`/room/${code}`)
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-8">
      <div className="text-center space-y-2">
        <Users className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Birlikte Çalış</h1>
        <p className="text-muted-foreground text-sm">
          Arkadaşınla aynı anda timer başlat — body doubling ile odaklanma artar
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {mode === "idle" && (
        <div className="grid gap-3">
          <Button size="lg" onClick={() => setMode("create")} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Oda Oluştur
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setMode("join")}
            className="w-full"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Odaya Katıl
          </Button>
        </div>
      )}

      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yeni Oda</CardTitle>
            <CardDescription>Oda adı isteğe bağlı — linki paylaşarak arkadaşını davet et</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Oda adı (isteğe bağlı)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("idle")}
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Oluşturuluyor…" : "Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "join" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Odaya Katıl</CardTitle>
            <CardDescription>Arkadaşının paylaştığı 6 haneli kodu gir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Örnek: ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("idle")}
                className="flex-1"
              >
                Geri
              </Button>
              <Button
                onClick={handleJoin}
                disabled={loading || joinCode.trim().length !== 6}
                className="flex-1"
              >
                {loading ? "Katılıyor…" : "Katıl"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
