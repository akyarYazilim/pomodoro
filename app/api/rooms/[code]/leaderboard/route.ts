import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// GET /api/rooms/[code]/leaderboard — weekly focus minutes per room member
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await params

  const room = await prisma.sharedRoom.findUnique({
    where: { code },
    include: { members: { select: { userId: true } } },
  })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const memberIds = room.members.map((m) => m.userId)

  // Current week: Monday 00:00 UTC
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0=Sun
  const daysFromMonday = (dayOfWeek + 6) % 7
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysFromMonday)
  weekStart.setUTCHours(0, 0, 0, 0)

  // Previous week start
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setUTCDate(weekStart.getUTCDate() - 7)

  const [currentSessions, prevSessions, users] = await Promise.all([
    prisma.focusSession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: memberIds },
        status: "COMPLETED",
        startedAt: { gte: weekStart },
      },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: memberIds },
        status: "COMPLETED",
        startedAt: { gte: prevWeekStart, lt: weekStart },
      },
      _sum: { actualMinutes: true },
    }),
    prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, image: true },
    }),
  ])

  const currentMap = new Map(
    currentSessions.map((s) => [s.userId, s._sum.actualMinutes ?? 0])
  )
  const prevMap = new Map(
    prevSessions.map((s) => [s.userId, s._sum.actualMinutes ?? 0])
  )

  const entries = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      image: u.image,
      currentWeekMinutes: currentMap.get(u.id) ?? 0,
      prevWeekMinutes: prevMap.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.currentWeekMinutes - a.currentWeekMinutes)

  return NextResponse.json({ entries, weekStart: weekStart.toISOString() })
}
