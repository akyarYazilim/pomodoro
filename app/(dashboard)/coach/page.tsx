import { ChatInterface } from "@/components/coach/ChatInterface"

export default function CoachPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">AI Koç</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Odaklanma hedeflerin için kişisel asistanın
        </p>
      </div>
      <ChatInterface />
    </div>
  )
}
