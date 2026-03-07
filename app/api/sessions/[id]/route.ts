import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { updateSessionSchema } from "@/lib/validators/session"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veriler" }, { status: 400 })
  }

  const existing = await prisma.focusSession.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 })
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  }

  const { status, actualMinutes, breakMinutes, note, mood } = parsed.data

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status,
      actualMinutes: actualMinutes ?? existing.actualMinutes,
      breakMinutes: breakMinutes ?? existing.breakMinutes,
      note: note ?? existing.note,
      mood: mood ?? existing.mood,
      endedAt: status === "COMPLETED" || status === "CANCELLED" ? new Date() : existing.endedAt,
    },
  })

  return NextResponse.json({ success: true, session: updated })
}
