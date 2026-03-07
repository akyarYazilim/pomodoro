import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { updateTaskSchema } from "@/lib/validators/task"

type Params = { params: Promise<{ id: string }> }

async function getOwnedTask(userId: string, id: string) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return { error: "Bulunamadı", status: 404 }
  if (task.userId !== userId) return { error: "Yetkisiz", status: 403 }
  return { task }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id } = await params
  const found = await getOwnedTask(session.user.id, id)
  if ("error" in found) return NextResponse.json({ error: found.error }, { status: found.status })

  const body = await req.json()
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veriler" }, { status: 400 })
  }

  const data = parsed.data
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      completedAt: data.status === "DONE" ? new Date() : data.status === "TODO" || data.status === "IN_PROGRESS" ? null : undefined,
    },
  })

  return NextResponse.json({ success: true, task })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id } = await params
  const found = await getOwnedTask(session.user.id, id)
  if ("error" in found) return NextResponse.json({ error: found.error }, { status: found.status })

  await prisma.task.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })

  return NextResponse.json({ success: true })
}
