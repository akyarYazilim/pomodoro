import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { updateStreak } from "@/lib/utils/streak"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  return NextResponse.json({
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
  })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const updated = updateStreak({
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    today: new Date(),
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      lastActiveDate: updated.lastActiveDate,
    },
  })

  return NextResponse.json(updated)
}
