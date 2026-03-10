import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/client"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        return valid ? user : null
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          onboardingComplete?: boolean
          pomodoroMinutes?: number
          shortBreakMinutes?: number
          longBreakMinutes?: number
          defaultTimerMode?: string
        }
        token.sub = user.id
        token.onboardingComplete = u.onboardingComplete ?? false
        token.pomodoroMinutes = u.pomodoroMinutes
        token.shortBreakMinutes = u.shortBreakMinutes
        token.longBreakMinutes = u.longBreakMinutes
        token.defaultTimerMode = u.defaultTimerMode
      }
      if (trigger === "update" && session?.onboardingComplete !== undefined) {
        token.onboardingComplete = session.onboardingComplete
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          onboardingComplete: token.onboardingComplete as boolean,
          pomodoroMinutes: token.pomodoroMinutes,
          shortBreakMinutes: token.shortBreakMinutes,
          longBreakMinutes: token.longBreakMinutes,
          defaultTimerMode: token.defaultTimerMode,
        },
      }
    },
  },
}
