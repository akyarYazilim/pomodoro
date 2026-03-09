// Edge Runtime için hafif config — sadece JWT/session kontrolü
// Prisma ve bcrypt içermez
import type { NextAuthConfig } from "next-auth"

export const edgeAuthConfig: NextAuthConfig = {
  providers: [], // Edge'de provider'a gerek yok, sadece session kontrolü
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          onboardingComplete: (token.onboardingComplete ?? true) as boolean,
        },
      }
    },
  },
}
