import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// POST /api/rooms — create a new shared room
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const name: string | undefined = body.name

  // Generate unique code
  let code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const existing = await prisma.sharedRoom.findUnique({ where: { code } })
    if (!existing) break
    code = generateCode()
    attempts++
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const room = await prisma.sharedRoom.create({
    data: {
      code,
      name: name ?? null,
      hostId: session.user.id,
      expiresAt,
      members: {
        create: {
          userId: session.user.id,
          isWorking: false,
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  return NextResponse.json({ room }, { status: 201 })
}
