"use client"

import { Button } from "@/components/ui/button"

export type Persona = "student" | "freelancer" | "remote" | "adhd" | "general"

interface PersonaOption {
  id: Persona
  emoji: string
  label: string
  description: string
}

const PERSONAS: PersonaOption[] = [
  { id: "student", emoji: "📚", label: "Öğrenci", description: "Ders çalışma ve ödev odaklı" },
  { id: "freelancer", emoji: "💼", label: "Freelancer", description: "Proje bazlı çalışma, saat takibi" },
  { id: "remote", emoji: "🏠", label: "Uzaktan Çalışan", description: "Evden iş, odaklanma güçlüğü" },
  { id: "adhd", emoji: "⚡", label: "ADHD Var", description: "Kısa seanslar, hızlı başlangıç" },
  { id: "general", emoji: "🎯", label: "Genel Kullanım", description: "Klasik pomodoro deneyimi" },
]

interface PersonaStepProps {
  persona: Persona
  onPersonaChange: (p: Persona) => void
  onNext: () => void
}

export function PersonaStep({ persona, onPersonaChange, onNext }: PersonaStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Sizi en iyi tanımlayan?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Size özel öneriler sunalım. İstediğiniz zaman değiştirebilirsiniz.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPersonaChange(p.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
              persona === p.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="text-xl">{p.emoji}</span>
            <div>
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={onNext} className="min-w-[140px]">
        Devam Et
      </Button>
    </div>
  )
}
