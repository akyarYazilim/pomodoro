import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email(),
})

// POST /api/teams/[id]/invite — invite a member by email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId: session.user.id } },
  })
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin" }, { status: 400 })
  }

  const { email } = parsed.data

  // Check already member
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    const alreadyMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: existingUser.id } },
    })
    if (alreadyMember) {
      return NextResponse.json({ error: "Bu kullanıcı zaten üye" }, { status: 409 })
    }
  }

  // Upsert invite (replace expired ones)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const invite = await prisma.teamInvite.create({
    data: { teamId: id, email, expiresAt },
  })

  return NextResponse.json({ invite }, { status: 201 })
}
