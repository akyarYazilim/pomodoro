import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const schema = z.object({
  dailyGoalMinutes: z.number().min(15).max(480),
  defaultTimerMode: z.enum(["POMODORO", "FLOWTIME"]),
  pomodoroMinutes: z.number().min(5).max(90).optional(),
  persona: z.enum(["student", "freelancer", "remote", "adhd", "general"]).optional(),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ...parsed.data, onboardingComplete: true },
  })

  return NextResponse.json({ success: true })
}
