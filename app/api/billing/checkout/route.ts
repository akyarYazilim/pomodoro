import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { PRICING } from "@/lib/utils/feature-flags"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-02-25.clover",
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const period = body.period as "monthly" | "yearly" | "lifetime"

  const priceMap = {
    monthly: PRICING.monthly.priceId,
    yearly: PRICING.yearly.priceId,
    lifetime: PRICING.lifetime.priceId,
  }

  const priceId = priceMap[period]
  if (!priceId) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: period === "lifetime" ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/upgrade?success=1`,
    cancel_url: `${baseUrl}/upgrade?canceled=1`,
    metadata: {
      userId: session.user.id,
      period,
    },
    customer_email: session.user.email ?? undefined,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
