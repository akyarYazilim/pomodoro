import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      startedAt: { gte: sevenDaysAgo },
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

    const minutes = sessions
      .filter((s) => {
        const sd = new Date(s.startedAt)
        sd.setHours(0, 0, 0, 0)
        return sd.getTime() === d.getTime()
      })
      .reduce((sum, s) => sum + s.actualMinutes, 0)

    days.push({ date: dateStr, minutes })
  }

  return NextResponse.json({ days })
}
