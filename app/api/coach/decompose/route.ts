import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCoachReply } from "@/lib/ai/coach"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1).max(500),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const { title } = parsed.data

  const reply = await getCoachReply(
    [{ role: "user", content: `Görevi alt adımlara böl: "${title}"` }],
    `Sen bir üretkenlik asistanısın. Kullanıcının görevini 3-5 somut, yapılabilir alt adıma böl.
Her adımı yeni bir satırda "- " ile başlat. Sadece adımları listele, başka açıklama yapma. Türkçe yanıt ver.`
  )

  const steps = reply
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 3)
    .slice(0, 5)

  return NextResponse.json({ steps })
}
