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
  const finalMinutes = actualMinutes ?? existing.actualMinutes

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status,
      actualMinutes: finalMinutes,
      breakMinutes: breakMinutes ?? existing.breakMinutes,
      note: note ?? existing.note,
      mood: mood ?? existing.mood,
      endedAt: status === "COMPLETED" || status === "CANCELLED" ? new Date() : existing.endedAt,
    },
  })

  if (status === "COMPLETED") {
    // İlk tamamlanan seans — firstSessionAt kaydet
    await prisma.user.updateMany({
      where: { id: session.user.id, firstSessionAt: null },
      data: { firstSessionAt: new Date() },
    })

    // Kişisel rekorları güncelle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { longestSession: true, bestDayMinutes: true },
    })

    if (user) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todaySessions = await prisma.focusSession.aggregate({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
          startedAt: { gte: today, lt: tomorrow },
        },
        _sum: { actualMinutes: true },
      })
      const todayTotal = todaySessions._sum.actualMinutes ?? 0

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          longestSession: Math.max(user.longestSession, finalMinutes),
          bestDayMinutes: Math.max(user.bestDayMinutes, todayTotal),
        },
      })
    }
  }

  return NextResponse.json({ success: true, session: updated })
}
