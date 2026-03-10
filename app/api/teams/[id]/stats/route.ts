import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// GET /api/teams/[id]/stats — weekly focus minutes per member
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify membership
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId: session.user.id } },
  })
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)

  const userIds = members.map((m) => m.userId)

  const [thisWeek, prevWeek, taskCounts] = await Promise.all([
    prisma.focusSession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        startedAt: { gte: weekStart },
        status: "COMPLETED",
      },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        startedAt: { gte: prevWeekStart, lt: weekStart },
        status: "COMPLETED",
      },
      _sum: { actualMinutes: true },
    }),
    prisma.task.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        status: "DONE",
        completedAt: { gte: weekStart },
      },
      _count: { id: true },
    }),
  ])

  const statsMap = new Map<string, { thisWeek: number; prevWeek: number; tasksCompleted: number }>()
  for (const uid of userIds) {
    statsMap.set(uid, { thisWeek: 0, prevWeek: 0, tasksCompleted: 0 })
  }
  for (const row of thisWeek) {
    const s = statsMap.get(row.userId)
    if (s) s.thisWeek = row._sum.actualMinutes ?? 0
  }
  for (const row of prevWeek) {
    const s = statsMap.get(row.userId)
    if (s) s.prevWeek = row._sum.actualMinutes ?? 0
  }
  for (const row of taskCounts) {
    const s = statsMap.get(row.userId)
    if (s) s.tasksCompleted = row._count.id
  }

  const entries = members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    image: m.user.image,
    role: m.role,
    thisWeekMinutes: statsMap.get(m.userId)?.thisWeek ?? 0,
    prevWeekMinutes: statsMap.get(m.userId)?.prevWeek ?? 0,
    tasksCompleted: statsMap.get(m.userId)?.tasksCompleted ?? 0,
  }))

  entries.sort((a, b) => b.thisWeekMinutes - a.thisWeekMinutes)

  const totalMinutes = entries.reduce((sum, e) => sum + e.thisWeekMinutes, 0)
  const totalTasks = entries.reduce((sum, e) => sum + e.tasksCompleted, 0)

  return NextResponse.json({ entries, totalMinutes, totalTasks })
}
