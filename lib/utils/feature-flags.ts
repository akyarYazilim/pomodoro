export type Plan = "free" | "pro" | "lifetime"

export interface PlanUser {
  plan?: string | null
  planExpiresAt?: Date | null
}

export function isPro(user: PlanUser): boolean {
  if (!user.plan || user.plan === "free") return false
  if (user.plan === "lifetime") return true
  if (user.plan === "pro") {
    if (!user.planExpiresAt) return true
    return new Date(user.planExpiresAt) > new Date()
  }
  return false
}

export const PRO_FEATURES = {
  unlimitedHistory: "unlimitedHistory",
  aiCoachUnlimited: "aiCoachUnlimited",
  pushNotifications: "pushNotifications",
  weeklyEmail: "weeklyEmail",
  advancedStats: "advancedStats",
  unlimitedTasks: "unlimitedTasks",
  allThemes: "allThemes",
} as const

export type ProFeature = keyof typeof PRO_FEATURES

export const FREE_LIMITS = {
  maxActiveTasks: 10,
  maxHistoryDays: 7,
  maxCoachMessagesPerDay: 5,
} as const

export const PRICING = {
  monthly: { amount: 499, label: "$4.99/ay", priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "" },
  yearly: { amount: 2999, label: "$29.99/yıl", priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "" },
  lifetime: { amount: 4999, label: "$49.99 tek seferlik", priceId: process.env.STRIPE_LIFETIME_PRICE_ID ?? "" },
} as const
