import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      startedAt: { gte: today, lt: tomorrow },
    },
    select: { mood: true },
  })

  const rated = sessions.filter((s) => s.mood !== null)
  const avgMood =
    rated.length > 0
      ? rated.reduce((sum, s) => sum + (s.mood ?? 0), 0) / rated.length
      : null

  return NextResponse.json({
    avgMood,
    ratedCount: rated.length,
    totalCount: sessions.length,
  })
}
