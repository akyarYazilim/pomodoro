import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// POST /api/rooms/[code]/join — join an existing room
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await params

  const room = await prisma.sharedRoom.findUnique({ where: { code } })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  if (room.expiresAt < new Date()) {
    return NextResponse.json({ error: "Room expired" }, { status: 410 })
  }

  // Upsert — already in room is fine
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
    update: {},
    create: { roomId: room.id, userId: session.user.id, isWorking: false },
  })

  const updated = await prisma.sharedRoom.findUnique({
    where: { code },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  })

  return NextResponse.json({ room: updated })
}
