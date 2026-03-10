"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Timer, CheckSquare, BarChart2, Bot, Settings, Sparkles, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { isPro } from "@/lib/utils/feature-flags"
import { ProBadge } from "@/components/ui/ProBadge"

const navItems = [
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Görevler", icon: CheckSquare },
  { href: "/stats", label: "İstatistik", icon: BarChart2 },
  { href: "/coach", label: "AI Koç", icon: Bot },
  { href: "/settings", label: "Ayarlar", icon: Settings },
  { href: "/room", label: "Birlikte Çalış", icon: Users },
  { href: "/team", label: "Ekip", icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userIsPro = isPro({ plan: session?.user?.plan })

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar h-full">
      <div className="flex h-14 items-center px-4 border-b gap-2">
        <span className="font-semibold text-sidebar-foreground">Pomodoro</span>
        {userIsPro && <ProBadge />}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      {!userIsPro && (
        <div className="p-2 border-t">
          <Link
            href="/upgrade"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/upgrade")
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Pro&apos;ya Geç ⭐
          </Link>
        </div>
      )}
    </aside>
  )
}
