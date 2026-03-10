import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const allSessions = await prisma.focusSession.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      startedAt: { gte: fourteenDaysAgo },
    },
    select: { startedAt: true, actualMinutes: true },
  })

  // Günlük toplamları oluştur (son 7 gün)
  const days: { date: string; minutes: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const dateStr = d.toISOString().split("T")[0]

    const minutes = allSessions
      .filter((s) => {
        const sd = new Date(s.startedAt)
        sd.setHours(0, 0, 0, 0)
        return sd.getTime() === d.getTime()
      })
      .reduce((sum, s) => sum + s.actualMinutes, 0)

    days.push({ date: dateStr, minutes })
  }

  // Önceki hafta toplamı (7-13 gün önce)
  const now = Date.now()
  const previousWeekTotal = allSessions
    .filter((s) => {
      const daysAgo = Math.floor((now - new Date(s.startedAt).getTime()) / (1000 * 60 * 60 * 24))
      return daysAgo >= 7 && daysAgo <= 13
    })
    .reduce((sum, s) => sum + s.actualMinutes, 0)

  const currentWeekTotal = days.reduce((sum, d) => sum + d.minutes, 0)

  return NextResponse.json({ days, currentWeekTotal, previousWeekTotal })
}
