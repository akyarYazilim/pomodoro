"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProBadgeProps {
  className?: string
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-semibold text-white",
        className
      )}
    >
      ⭐ Pro
    </span>
  )
}

interface ProLockedProps {
  feature: string
  className?: string
  children: React.ReactNode
}

export function ProLocked({ feature, className, children }: ProLockedProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-sm">
        <ProBadge />
        <p className="text-xs text-muted-foreground text-center px-2">{feature}</p>
        <Link
          href="/upgrade"
          className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Pro&apos;ya Geç
        </Link>
      </div>
    </div>
  )
}
