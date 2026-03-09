"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "./ChatMessage"
import { Send } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface StoredMessage {
  role: string
  content: string
  createdAt: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history on mount
  useEffect(() => {
    fetch("/api/coach")
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(
            (data.messages as StoredMessage[])
              .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
              .map((m) => ({
                role: m.role === "USER" ? "user" : "assistant",
                content: m.content,
              })),
          )
        }
      })
      .catch(() => {})
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return

    setInput("")
    setError(null)

    const userMessage: Message = { role: "user", content: text }
    const history = messages.slice(-18) // last 18 to stay within limit

    setMessages((prev) => [...prev, userMessage])

    setStreaming(true)

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Bir hata oluştu.")
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && !streaming && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-muted-foreground text-sm text-center">
              Merhaba! Odaklanma hedeflerin, görevlerin veya <br />
              üretkenliğin hakkında konuşabiliriz.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="text-destructive text-xs text-center">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bir şey sor..."
          disabled={streaming}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={streaming || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
