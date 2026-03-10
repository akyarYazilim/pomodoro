import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { updateStreak, isStreakActive } from "@/lib/utils/streak"

const FREEZE_REGEN_DAYS = 7
const MAX_FREEZE_COUNT = 1

function shouldRegenFreeze(lastUsed: Date | null, today: Date): boolean {
  if (!lastUsed) return false
  const daysSince = Math.floor((today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
  return daysSince >= FREEZE_REGEN_DAYS
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      streakFreezeCount: true,
      lastStreakFreezeUsed: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const today = new Date()
  let freezeCount = user.streakFreezeCount

  if (freezeCount < MAX_FREEZE_COUNT && shouldRegenFreeze(user.lastStreakFreezeUsed, today)) {
    freezeCount = MAX_FREEZE_COUNT
    await prisma.user.update({
      where: { id: session.user.id },
      data: { streakFreezeCount: MAX_FREEZE_COUNT },
    })
  }

  return NextResponse.json({
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    streakFreezeCount: freezeCount,
  })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      streakFreezeCount: true,
      lastStreakFreezeUsed: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const today = new Date()

  let freezeCount = user.streakFreezeCount
  if (freezeCount < MAX_FREEZE_COUNT && shouldRegenFreeze(user.lastStreakFreezeUsed, today)) {
    freezeCount = MAX_FREEZE_COUNT
  }

  const active = isStreakActive(user.lastActiveDate, today)
  const alreadyToday =
    user.lastActiveDate &&
    new Date(user.lastActiveDate).toDateString() === today.toDateString()

  let usedFreeze = false
  let updateData: Record<string, unknown>

  if (!active && !alreadyToday && user.currentStreak > 0 && freezeCount > 0) {
    // Streak kırılacaktı — freeze kullan
    usedFreeze = true
    updateData = {
      lastActiveDate: today,
      streakFreezeCount: freezeCount - 1,
      lastStreakFreezeUsed: today,
    }
  } else {
    const updated = updateStreak({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      today,
    })
    updateData = {
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      lastActiveDate: updated.lastActiveDate,
      streakFreezeCount: freezeCount,
    }
  }

  const saved = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      streakFreezeCount: true,
    },
  })

  return NextResponse.json({ ...saved, usedFreeze })
}
