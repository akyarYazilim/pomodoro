import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstSessionAt: true, currentStreak: true },
  })

  if (!user?.firstSessionAt) {
    return NextResponse.json({ milestone: null })
  }

  const daysSinceFirst = Math.floor(
    (Date.now() - user.firstSessionAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  let milestone: { type: "day1" | "day3" | "day7"; label: string; emoji: string } | null = null

  if (daysSinceFirst >= 7) {
    milestone = { type: "day7", label: "İlk haftanı tamamladın!", emoji: "🏆" }
  } else if (daysSinceFirst >= 3) {
    milestone = { type: "day3", label: "3 gün üst üste! Alışkanlık oluşuyor", emoji: "🎯" }
  } else if (daysSinceFirst >= 0) {
    milestone = { type: "day1", label: "İlk seansını tamamladın!", emoji: "🌱" }
  }

  return NextResponse.json({ milestone, daysSinceFirst })
}
