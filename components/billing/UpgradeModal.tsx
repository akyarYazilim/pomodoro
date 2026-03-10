"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PRICING } from "@/lib/utils/feature-flags"

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  featureName?: string
}

type BillingPeriod = "monthly" | "yearly" | "lifetime"

export function UpgradeModal({ open, onClose, featureName }: UpgradeModalProps) {
  const [selected, setSelected] = useState<BillingPeriod>("yearly")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleUpgrade() {
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

  const plans: { key: BillingPeriod; label: string; price: string; badge?: string }[] = [
    { key: "monthly", label: "Aylık", price: PRICING.monthly.label },
    { key: "yearly", label: "Yıllık", price: PRICING.yearly.label, badge: "%50 indirim" },
    { key: "lifetime", label: "Ömür boyu", price: PRICING.lifetime.label, badge: "En iyi fiyat" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Pro&apos;ya Geç ⭐</h2>
            {featureName && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">{featureName}</span> Pro özelliğidir.
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">
            ×
          </button>
        </div>

        <ul className="text-sm text-muted-foreground space-y-1 mb-5">
          <li>✓ Sınırsız istatistik geçmişi</li>
          <li>✓ Sınırsız görev</li>
          <li>✓ AI Koç — günlük sınırsız mesaj</li>
          <li>✓ Push bildirimleri</li>
          <li>✓ Haftalık özet e-postası</li>
          <li>✓ Tüm temalar</li>
        </ul>

        <div className="space-y-2 mb-5">
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
              <span className="font-medium">{p.label}</span>
              <div className="flex items-center gap-2">
                {p.badge && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
                <span className="text-muted-foreground">{p.price}</span>
              </div>
            </button>
          ))}
        </div>

        <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
          {loading ? "Yönlendiriliyor..." : "Pro Satın Al"}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Güvenli ödeme — Stripe
        </p>
      </div>
    </div>
  )
}
