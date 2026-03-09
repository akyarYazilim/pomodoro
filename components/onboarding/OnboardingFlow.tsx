"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { GoalStep } from "./GoalStep"
import { TimerStep } from "./TimerStep"
import { FirstTaskStep } from "./FirstTaskStep"

type Step = 1 | 2 | 3

export function OnboardingFlow() {
  const router = useRouter()
  const { update } = useSession()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120)
  const [defaultTimerMode, setDefaultTimerMode] = useState<"POMODORO" | "FLOWTIME">("POMODORO")
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)

  async function handleComplete(taskTitle?: string) {
    setLoading(true)
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoalMinutes, defaultTimerMode, pomodoroMinutes }),
      })

      if (taskTitle) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: taskTitle }),
        })
      }

      // JWT'yi yenile — onboardingComplete: true olacak
      await update({ onboardingComplete: true })
      router.push("/timer")
    } catch {
      setLoading(false)
    }
  }

  const steps = [
    <GoalStep
      key="goal"
      value={dailyGoalMinutes}
      onChange={setDailyGoalMinutes}
      onNext={() => setStep(2)}
    />,
    <TimerStep
      key="timer"
      mode={defaultTimerMode}
      pomodoroMinutes={pomodoroMinutes}
      onModeChange={setDefaultTimerMode}
      onPomodoroMinutesChange={setPomodoroMinutes}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    <FirstTaskStep
      key="task"
      onComplete={handleComplete}
      onBack={() => setStep(2)}
      loading={loading}
    />,
  ]

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Progress dots */}
      <div className="flex gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full transition-colors ${
              s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {steps[step - 1]}
    </div>
  )
}
