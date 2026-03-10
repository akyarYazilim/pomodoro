"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Mail, X } from "lucide-react"

interface InviteDialogProps {
  onInvite: (email: string) => Promise<boolean>
  pendingInvites: Array<{ id: string; email: string; createdAt: string }>
}

export function InviteDialog({ onInvite, pendingInvites }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    const ok = await onInvite(email.trim())
    setSubmitting(false)
    if (ok) {
      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Üye Davet Et
      </Button>
    )
  }

  return (
    <Card className="w-72">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Üye Davet Et</CardTitle>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="invite-email" className="text-xs">E-posta</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="h-8 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={submitting || !email.trim()}>
            {submitting ? "Gönderiliyor..." : success ? "Gönderildi!" : "Davet Gönder"}
          </Button>
        </form>

        {pendingInvites.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Bekleyen Davetler</p>
            <div className="space-y-1">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {inv.email}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
