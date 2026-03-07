import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { createTaskSchema } from "@/lib/validators/task"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id, status: { not: "ARCHIVED" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veriler" }, { status: 400 })
  }

  const { title, description, priority, tags, estimatedMinutes, dueDate } = parsed.data

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title,
      description: description ?? null,
      priority,
      tags,
      estimatedMinutes: estimatedMinutes ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  return NextResponse.json({ success: true, task }, { status: 201 })
}
