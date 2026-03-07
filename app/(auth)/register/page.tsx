"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Bir hata oluştu")
    } else {
      router.push("/login")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kayıt Ol</CardTitle>
        <CardDescription>Ücretsiz hesap oluştur</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input id="name" name="name" required placeholder="Adın" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="sen@ornek.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required placeholder="En az 8 karakter" minLength={8} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Hesabın var mı?{" "}
            <Link href="/login" className="underline">
              Giriş yap
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
