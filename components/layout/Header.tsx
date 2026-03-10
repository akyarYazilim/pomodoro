"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 bg-background">
      <div />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {session?.user?.name ?? session?.user?.email}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Tema değiştir"
        >
          {mounted && (theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          ))}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Çıkış yap"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
