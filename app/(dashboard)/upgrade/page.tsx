"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ProBadge } from "@/components/ui/ProBadge"
import { isPro, PRICING } from "@/lib/utils/feature-flags"

type BillingPeriod = "monthly" | "yearly" | "lifetime"

const FREE_FEATURES = [
  "Timer (Pomodoro + Flowtime)",
  "Temel görev listesi (max 10 görev)",
  "Son 7 günlük istatistikler",
  "3 tema",
]

const PRO_FEATURES = [
  "Sınırsız istatistik geçmişi",
  "Sınırsız görev",
  "AI Koç — günlük sınırsız mesaj",
  "Push bildirimleri",
  "Haftalık özet e-postası",
  "Tüm temalar",
  "Cloud sync (çoklu cihaz)",
]

export default function UpgradePage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState<BillingPeriod>("yearly")
  const [loading, setLoading] = useState(false)

  const userIsPro = isPro({ plan: session?.user?.plan })

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: selected }),
      })
      if (!res.ok) throw new Error("Checkout oluşturulamadı")
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const plans: { key: BillingPeriod; label: string; price: string; badge?: string; desc: string }[] = [
    { key: "monthly", label: "Aylık", price: PRICING.monthly.label, desc: "Her ay yenilenir" },
    { key: "yearly", label: "Yıllık", price: PRICING.yearly.label, badge: "%50 indirim", desc: "En popüler seçim" },
    { key: "lifetime", label: "Ömür Boyu", price: PRICING.lifetime.label, badge: "En iyi fiyat", desc: "Tek seferlik ödeme" },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <ProBadge className="text-sm px-3 py-1" />
        </div>
        <h1 className="text-2xl font-bold">Pro&apos;ya Geç</h1>
        <p className="text-muted-foreground">
          Odaklanma potansiyelini tam olarak ortaya çıkar.
        </p>
      </div>

      {userIsPro && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            ✓ Zaten Pro kullanıcısısın! Tüm özellikler aktif.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold text-sm">Ücretsiz</h3>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-xs">○</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Pro</h3>
            <ProBadge />
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-primary text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!userIsPro && (
        <div className="space-y-4">
          <h2 className="font-semibold">Plan Seç</h2>
          <div className="space-y-2">
            {plans.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelected(p.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                  selected === p.key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.label}</span>
                    {p.badge && (
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
                <span className="font-semibold">{p.price}</span>
              </button>
            ))}
          </div>
          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
            {loading ? "Yönlendiriliyor..." : "Pro Satın Al →"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Güvenli ödeme Stripe ile sağlanmaktadır. İstediğin zaman iptal edebilirsin.
          </p>
        </div>
      )}
    </div>
  )
}
