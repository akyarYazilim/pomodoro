import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      onboardingComplete: boolean
      pomodoroMinutes?: number
      shortBreakMinutes?: number
      longBreakMinutes?: number
      defaultTimerMode?: string
      persona?: string
      plan?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboardingComplete?: boolean
    pomodoroMinutes?: number
    shortBreakMinutes?: number
    longBreakMinutes?: number
    defaultTimerMode?: string
    persona?: string
    plan?: string
  }
}
