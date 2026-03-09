import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { getCoachReply } from "@/lib/ai/coach"
import { buildSystemPrompt } from "@/lib/ai/prompts"

async function getUserContext(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [user, todaySessions, activeTasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        currentStreak: true,
        longestStreak: true,
        dailyGoalMinutes: true,
      },
    }),
    prisma.focusSession.findMany({
      where: { userId, status: "COMPLETED", startedAt: { gte: today } },
      select: { actualMinutes: true },
    }),
    prisma.task.findMany({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
      select: { title: true, priority: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 10,
    }),
  ])

  const todayMinutes = todaySessions.reduce((s, r) => s + r.actualMinutes, 0)

  return {
    name: user?.name,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    dailyGoalMinutes: user?.dailyGoalMinutes ?? 120,
    todayMinutes,
    todaySessionCount: todaySessions.length,
    activeTasks: activeTasks.map((t) => ({ title: t.title, priority: t.priority })),
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Bugün için cache'lenmiş ipucu var mı?
    const cached = await prisma.coachMessage.findFirst({
      where: {
        userId,
        role: "SYSTEM",
        createdAt: { gte: today },
      },
    })

    if (cached) {
      return NextResponse.json({ tip: cached.content })
    }

    // Yeni ipucu generate et
    const userContext = await getUserContext(userId)
    const tip = await getCoachReply(
      [{ role: "user", content: "Bugün için kısa (1-2 cümle) odaklanma ipucu ver." }],
      buildSystemPrompt(userContext),
    )

    await prisma.coachMessage.create({
      data: { userId, role: "SYSTEM", content: tip },
    })

    return NextResponse.json({ tip })
  } catch (err) {
    console.error("[daily-tip]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
