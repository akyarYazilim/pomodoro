import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
})

// POST /api/teams — create a new team
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = createTeamSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
    },
  })

  return NextResponse.json({ team }, { status: 201 })
}

// GET /api/teams — get the team the current user belongs to
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
            orderBy: { joinedAt: "asc" },
          },
          invites: {
            where: { acceptedAt: null, expiresAt: { gt: new Date() } },
            select: { id: true, email: true, createdAt: true },
          },
        },
      },
    },
  })

  if (!membership) {
    return NextResponse.json({ team: null })
  }

  return NextResponse.json({ team: membership.team, role: membership.role })
}
