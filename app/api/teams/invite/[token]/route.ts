import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// POST /api/teams/invite/[token] — accept invite
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { token } = await params

  const invite = await prisma.teamInvite.findUnique({ where: { token } })
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Davet geçersiz veya süresi dolmuş" }, { status: 404 })
  }

  // Add user to team
  const member = await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: invite.teamId, userId: session.user.id } },
    create: { teamId: invite.teamId, userId: session.user.id, role: "MEMBER" },
    update: {},
  })

  await prisma.teamInvite.update({
    where: { token },
    data: { acceptedAt: new Date() },
  })

  return NextResponse.json({ member })
}

// GET /api/teams/invite/[token] — preview invite (team name, inviter)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: { select: { name: true } } },
  })

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Davet geçersiz veya süresi dolmuş" }, { status: 404 })
  }

  return NextResponse.json({ teamName: invite.team.name, email: invite.email })
}
