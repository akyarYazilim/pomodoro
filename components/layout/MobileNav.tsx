"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, CheckSquare, BarChart2, Bot, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Görevler", icon: CheckSquare },
  { href: "/stats", label: "İstatistik", icon: BarChart2 },
  { href: "/coach", label: "Koç", icon: Bot },
  { href: "/room", label: "Birlikte", icon: Users },
  { href: "/team", label: "Ekip", icon: Building2 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors min-h-[56px]",
              pathname.startsWith(href)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
