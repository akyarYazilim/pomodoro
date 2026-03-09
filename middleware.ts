import NextAuth from "next-auth"
import { edgeAuthConfig } from "@/lib/auth/edge-config"

const { auth } = NextAuth(edgeAuthConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isOnboarding = pathname.startsWith("/onboarding")
  const isDashboard =
    pathname === "/" ||
    pathname.startsWith("/timer") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/stats") ||
    pathname.startsWith("/coach")

  if ((isDashboard || isOnboarding) && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl))
  }

  const onboardingComplete = req.auth?.user?.onboardingComplete ?? true
  if (isDashboard && isLoggedIn && !onboardingComplete) {
    return Response.redirect(new URL("/onboarding", req.nextUrl))
  }
  if (isOnboarding && isLoggedIn && onboardingComplete) {
    return Response.redirect(new URL("/", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
