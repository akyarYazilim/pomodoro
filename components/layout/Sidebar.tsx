"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, CheckSquare, BarChart2, Bot, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Görevler", icon: CheckSquare },
  { href: "/stats", label: "İstatistik", icon: BarChart2 },
  { href: "/coach", label: "AI Koç", icon: Bot },
  { href: "/settings", label: "Ayarlar", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar h-full">
      <div className="flex h-14 items-center px-4 border-b">
        <span className="font-semibold text-sidebar-foreground">Pomodoro</span>
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
    </aside>
  )
}
