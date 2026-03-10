"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTeam } from "@/hooks/useTeam"
import { TeamStats } from "@/components/team/TeamStats"
import { TeamMembers } from "@/components/team/TeamMembers"
import { InviteDialog } from "@/components/team/InviteDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, RefreshCw } from "lucide-react"

export default function TeamPage() {
  const { data: session } = useSession()
  const { team, role, stats, totalMinutes, totalTasks, loading, error, createTeam, inviteMember, refreshStats } =
    useTeam()
  const [teamName, setTeamName] = useState("")
  const [creating, setCreating] = useState(false)

  const currentUserId = session?.user?.id ?? ""
  const canInvite = role === "OWNER" || role === "ADMIN"

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    setCreating(true)
    await createTeam(teamName.trim())
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto pt-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  // No team yet — create or join
  if (!team) {
    return (
      <div className="max-w-sm mx-auto pt-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Takım Oluştur</h1>
          <p className="text-sm text-muted-foreground">
            Ekibinizle birlikte odaklanın, birlikte büyüyün.
          </p>
        </div>

        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="team-name">Takım Adı</Label>
                <Input
                  id="team-name"
                  placeholder="Örn: Ürün Takımı"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={creating}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating || !teamName.trim()}>
                {creating ? "Oluşturuluyor..." : "Takım Oluştur"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{team.name}</h1>
          <p className="text-xs text-muted-foreground">{team.members.length} üye</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshStats}
            title="Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canInvite && (
            <InviteDialog
              onInvite={inviteMember}
              pendingInvites={team.invites}
            />
          )}
        </div>
      </div>

      {/* Weekly aggregate stats */}
      <TeamStats
        totalMinutes={totalMinutes}
        totalTasks={totalTasks}
        memberCount={team.members.length}
      />

      {/* Member leaderboard */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Bu Haftaki Sıralama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeamMembers entries={stats} currentUserId={currentUserId} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        $5/kişi/ay · Aylık fatura
      </p>
    </div>
  )
}
