"use client"

import type { RoomMember } from "@/hooks/useRoom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RoomParticipantsProps {
  members: RoomMember[]
  currentUserId: string
}

export function RoomParticipants({ members, currentUserId }: RoomParticipantsProps) {
  const working = members.filter((m) => m.isWorking)
  const idle = members.filter((m) => !m.isWorking)

  return (
    <div className="space-y-4">
      {working.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Şu an çalışıyor 💪
          </p>
          <div className="space-y-2">
            {working.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isYou={member.userId === currentUserId}
                working
              />
            ))}
          </div>
        </div>
      )}

      {idle.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Bekliyor
          </p>
          <div className="space-y-2">
            {idle.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isYou={member.userId === currentUserId}
                working={false}
              />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Henüz kimse yok
        </p>
      )}
    </div>
  )
}

function MemberRow({
  member,
  isYou,
  working,
}: {
  member: RoomMember
  isYou: boolean
  working: boolean
}) {
  const initials = (member.user.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        {working && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <span className="text-sm font-medium flex-1">
        {member.user.name ?? "Anonim"}
        {isYou && (
          <span className="text-xs text-muted-foreground ml-1">(sen)</span>
        )}
      </span>
      {working && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-500">
          Çalışıyor
        </Badge>
      )}
    </div>
  )
}
