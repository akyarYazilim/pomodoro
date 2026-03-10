"use client"

import { useState, useEffect, useRef } from "react"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface StoredMessage {
  role: string
  content: string
  createdAt: string
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

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
              }))
          )
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || streaming) return

    setInput("")
    setError(null)

    const history = messages.slice(-18)
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setStreaming(true)

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.")

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
      sendMessage()
    }
  }

  return { messages, input, setInput, streaming, error, bottomRef, sendMessage, handleKeyDown }
}
