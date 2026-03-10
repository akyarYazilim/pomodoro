import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const subscribeSchema = z.object({
  token: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz token" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken: parsed.data.token },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken: null },
  })

  return NextResponse.json({ success: true })
}
