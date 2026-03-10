import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db/client"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-02-25.clover",
  })
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Webhook imzası geçersiz" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session
    const userId = checkoutSession.metadata?.userId
    const period = checkoutSession.metadata?.period as "monthly" | "yearly" | "lifetime" | undefined

    if (!userId || !period) {
      return NextResponse.json({ error: "Eksik metadata" }, { status: 400 })
    }

    const plan = period === "lifetime" ? "lifetime" : "pro"

    let planExpiresAt: Date | null = null
    if (period === "yearly") {
      planExpiresAt = new Date()
      planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1)
    } else if (period === "monthly") {
      planExpiresAt = new Date()
      planExpiresAt.setMonth(planExpiresAt.getMonth() + 1)
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeCustomerId: checkoutSession.customer as string | null,
        stripeSubscriptionId:
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : null,
        planExpiresAt,
      },
    })
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    await prisma.user.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { plan: "free", stripeSubscriptionId: null, planExpiresAt: null },
    })
  }

  return NextResponse.json({ received: true })
}
