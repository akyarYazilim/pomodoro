import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const now = new Date()

  // Bu hafta: son 7 gün
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - 6)
  thisWeekStart.setHours(0, 0, 0, 0)

  // Geçen hafta: 8-14 gün önce
  const lastWeekStart = new Date(now)
  lastWeekStart.setDate(now.getDate() - 13)
  lastWeekStart.setHours(0, 0, 0, 0)

  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setMilliseconds(-1)

  const [thisWeekSessions, lastWeekSessions, user] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        startedAt: { gte: thisWeekStart },
      },
      select: { actualMinutes: true, mode: true, startedAt: true },
    }),
    prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        startedAt: { gte: lastWeekStart, lte: lastWeekEnd },
      },
      select: { actualMinutes: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyGoalMinutes: true },
    }),
  ])

  const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.actualMinutes, 0)
  const lastWeekMinutes = lastWeekSessions.reduce((sum, s) => sum + s.actualMinutes, 0)
  const thisWeekSessions7 = thisWeekSessions.length

  const longestSession = thisWeekSessions.reduce(
    (max, s) => Math.max(max, s.actualMinutes),
    0
  )

  const pomodoroCount = thisWeekSessions.filter((s) => s.mode === "POMODORO").length
  const flowtimeCount = thisWeekSessions.filter((s) => s.mode === "FLOWTIME").length

  const dailyGoalMinutes = user?.dailyGoalMinutes ?? 120
  const weeklyGoalMinutes = dailyGoalMinutes * 7
  const goalPercent = weeklyGoalMinutes > 0
    ? Math.round((thisWeekMinutes / weeklyGoalMinutes) * 100)
    : 0

  const changePercent =
    lastWeekMinutes > 0
      ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : null

  return NextResponse.json({
    thisWeekMinutes,
    lastWeekMinutes,
    thisWeekSessions: thisWeekSessions7,
    longestSessionMinutes: longestSession,
    pomodoroCount,
    flowtimeCount,
    goalPercent,
    changePercent,
  })
}
