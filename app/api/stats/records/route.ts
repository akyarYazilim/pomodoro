import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { longestSession: true, bestDayMinutes: true, longestStreak: true },
  })

  return NextResponse.json({
    longestSession: user?.longestSession ?? 0,
    bestDayMinutes: user?.bestDayMinutes ?? 0,
    longestStreak: user?.longestStreak ?? 0,
  })
}
