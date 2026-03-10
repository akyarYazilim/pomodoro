"use client"

import Link from "next/link"
import { Timer, CheckSquare, Brain } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Timer,
    title: "Akıllı Timer",
    description: "Pomodoro ve Flowtime modlarıyla kendi odaklanma ritmini bul.",
  },
  {
    icon: CheckSquare,
    title: "Görev Yönetimi",
    description: "Görevlerini timer'a bağla, tamamlananları takip et.",
  },
  {
    icon: Brain,
    title: "AI Koç",
    description: "Kişisel AI koçundan günlük ipuçları ve motivasyon al.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <span className="font-semibold tracking-tight">Pomodoro</span>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Giriş Yap
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl max-w-xl">
          ADHD dostu odaklanma uygulaması
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-md">
          Timer, görev yönetimi ve AI koçuyla daha verimli çalış.
        </p>
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Ücretsiz Başla
        </Link>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="text-left">
              <CardHeader className="pb-2">
                <Icon className="h-5 w-5 text-muted-foreground mb-1" />
                <CardTitle className="text-sm">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 Pomodoro
      </footer>
    </div>
  )
}
