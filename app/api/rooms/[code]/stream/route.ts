import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// GET /api/rooms/[code]/stream — SSE stream for real-time member status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { code } = await params
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // stream already closed
        }
      }

      const poll = async () => {
        const room = await prisma.sharedRoom.findUnique({
          where: { code },
          include: {
            members: {
              include: { user: { select: { id: true, name: true, image: true } } },
              orderBy: { joinedAt: "asc" },
            },
          },
        })
        if (!room) {
          send({ error: "Room not found" })
          return
        }
        send({ members: room.members })
      }

      // Initial push
      await poll()

      const interval = setInterval(poll, 3000)

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
