import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { createSessionSchema } from "@/lib/validators/session"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

  const sessions = await prisma.focusSession.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { task: { select: { title: true } } },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veriler" }, { status: 400 })
  }

  const { mode, taskId, plannedMinutes } = parsed.data

  const focusSession = await prisma.focusSession.create({
    data: {
      userId: session.user.id,
      mode,
      taskId: taskId ?? null,
      plannedMinutes: plannedMinutes ?? null,
      status: "ACTIVE",
    },
  })

  return NextResponse.json({ success: true, session: focusSession }, { status: 201 })
}
