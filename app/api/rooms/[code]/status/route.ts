import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// PATCH /api/rooms/[code]/status — update own working status in room
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await params
  const body = await req.json().catch(() => ({}))
  const isWorking: boolean = Boolean(body.isWorking)

  const room = await prisma.sharedRoom.findUnique({ where: { code } })
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  await prisma.roomMember.update({
    where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
    data: { isWorking },
  })

  return NextResponse.json({ ok: true })
}
