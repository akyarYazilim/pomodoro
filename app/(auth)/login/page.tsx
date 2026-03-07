"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email veya şifre hatalı")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>Hesabına giriş yap ve odaklanmaya başla</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="sen@ornek.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Google ile Giriş Yap
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Hesabın yok mu?{" "}
            <Link href="/register" className="underline">
              Kayıt ol
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
