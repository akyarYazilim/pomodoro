import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { NextResponse } from "next/server"

const settingsSchema = z.object({
  pomodoroMinutes: z.number().int().min(1).max(120).optional(),
  shortBreakMinutes: z.number().int().min(1).max(60).optional(),
  longBreakMinutes: z.number().int().min(1).max(120).optional(),
  defaultTimerMode: z.enum(["POMODORO", "FLOWTIME"]).optional(),
  dailyGoalMinutes: z.number().int().min(0).optional(),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      pomodoroMinutes: true,
      shortBreakMinutes: true,
      longBreakMinutes: true,
      defaultTimerMode: true,
      dailyGoalMinutes: true,
    },
  })

  return NextResponse.json(updated)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      pomodoroMinutes: true,
      shortBreakMinutes: true,
      longBreakMinutes: true,
      defaultTimerMode: true,
      dailyGoalMinutes: true,
    },
  })

  return NextResponse.json(user)
}
