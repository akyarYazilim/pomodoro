import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendBadge } from "./TeamStats"
import type { TeamMemberEntry } from "@/hooks/useTeam"

interface TeamMembersProps {
  entries: TeamMemberEntry[]
  currentUserId: string
}

const roleLabel: Record<string, string> = {
  OWNER: "Kurucu",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
}

function formatMins(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}s ${m}d`
  return `${m}d`
}

export function TeamMembers({ entries, currentUserId }: TeamMembersProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Henüz üye yok</p>
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <div
          key={entry.userId}
          className={`flex items-center gap-3 p-2 rounded-lg ${
            entry.userId === currentUserId ? "bg-muted/50" : ""
          }`}
        >
          <span className="text-sm font-mono text-muted-foreground w-5 text-right">
            {idx + 1}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {(entry.name ?? "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">
                {entry.name ?? "İsimsiz"}
                {entry.userId === currentUserId && (
                  <span className="text-muted-foreground ml-1">(sen)</span>
                )}
              </span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                {roleLabel[entry.role] ?? entry.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatMins(entry.thisWeekMinutes)}
              </span>
              <TrendBadge thisWeek={entry.thisWeekMinutes} prevWeek={entry.prevWeekMinutes} />
              {entry.tasksCompleted > 0 && (
                <span className="text-xs text-muted-foreground">
                  · {entry.tasksCompleted} görev
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
