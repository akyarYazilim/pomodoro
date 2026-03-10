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

  const [sessions, user] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        startedAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyGoalMinutes: true },
    }),
  ])

  const totalMinutes = sessions.reduce((sum, s) => sum + s.actualMinutes, 0)
  const pomodoroCount = sessions.filter((s) => s.mode === "POMODORO").length
  const flowtimeCount = sessions.filter((s) => s.mode === "FLOWTIME").length

  return NextResponse.json({
    totalMinutes,
    sessionCount: sessions.length,
    pomodoroCount,
    flowtimeCount,
    dailyGoalMinutes: user?.dailyGoalMinutes ?? 120,
  })
}
