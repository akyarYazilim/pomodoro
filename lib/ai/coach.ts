import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { resolve } from "path"

function getApiKey(): string {
  const envKey = process.env.ANTHROPIC_API_KEY
  // Valid Anthropic keys are 100+ chars — short value means stale system env var
  if (envKey && envKey.length > 50) return envKey

  // Fall back to reading .env.local directly
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    const match = content.match(/ANTHROPIC_API_KEY="([^"]+)"/)
    if (match?.[1]) return match[1]
  } catch {}

  throw new Error("ANTHROPIC_API_KEY not found in env or .env.local")
}

function getClient() {
  return new Anthropic({ apiKey: getApiKey() })
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function getCoachReply(
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<string> {
  const anthropic = getClient()
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const block = response.content[0]
  if (block.type !== "text") return ""
  return block.text
}
