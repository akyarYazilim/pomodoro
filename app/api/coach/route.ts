import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { getCoachReply, type ChatMessage } from "@/lib/ai/coach"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import { z } from "zod"

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .default([]),
})

// Rate limit: max 20 messages per hour per user
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 20

async function checkRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const count = await prisma.coachMessage.count({
    where: {
      userId,
      role: "USER",
      createdAt: { gte: since },
    },
  })
  return count < RATE_LIMIT_MAX
}

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
    activeTasks: activeTasks.map((t) => ({
      title: t.title,
      priority: t.priority,
    })),
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const messages = await prisma.coachMessage.findMany({
    where: { userId: session.user.id, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "asc" },
    take: 40,
    select: { role: true, content: true, createdAt: true },
  })

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const userId = session.user.id
  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const allowed = await checkRateLimit(userId)
  if (!allowed) {
    return NextResponse.json(
      { error: "Saatte en fazla 20 mesaj gönderebilirsiniz." },
      { status: 429 },
    )
  }

  const { message, history } = parsed.data

  // Save user message
  await prisma.coachMessage.create({
    data: { userId, role: "USER", content: message },
  })

  const userContext = await getUserContext(userId)
  const systemPrompt = buildSystemPrompt(userContext)

  const chatMessages: ChatMessage[] = [
    ...history,
    { role: "user", content: message },
  ]

  let reply = ""
  try {
    reply = await getCoachReply(chatMessages, systemPrompt)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[coach] getCoachReply error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  if (reply) {
    await prisma.coachMessage.create({
      data: { userId, role: "ASSISTANT", content: reply },
    })
  }

  return NextResponse.json({ reply })
}
