"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface RoomUser {
  id: string
  name: string | null
  image: string | null
}

export interface RoomMember {
  id: string
  userId: string
  isWorking: boolean
  joinedAt: string
  user: RoomUser
}

export interface Room {
  id: string
  code: string
  name: string | null
  hostId: string
  expiresAt: string
  members: RoomMember[]
}

export interface LeaderboardEntry {
  userId: string
  name: string | null
  image: string | null
  currentWeekMinutes: number
  prevWeekMinutes: number
}

interface UseRoomReturn {
  room: Room | null
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  createRoom: (name?: string) => Promise<string | null>
  joinRoom: (code: string) => Promise<boolean>
  updateStatus: (isWorking: boolean) => Promise<void>
}

export function useRoom(code?: string): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchLeaderboard = useCallback(async (roomCode: string) => {
    const r = await fetch(`/api/rooms/${roomCode}/leaderboard`)
    if (!r.ok) return
    const data = await r.json()
    setLeaderboard(data.entries ?? [])
  }, [])

  // SSE connection for real-time member status
  useEffect(() => {
    if (!code) return

    setLoading(true)
    abortRef.current = new AbortController()

    // Initial room fetch
    fetch(`/api/rooms/${code}`, { signal: abortRef.current.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setRoom(data.room)
        setError(null)
        return fetchLeaderboard(code)
      })
      .catch((e) => {
        if (e !== "aborted") setError("Oda bulunamadı")
      })
      .finally(() => setLoading(false))

    // SSE stream
    const es = new EventSource(`/api/rooms/${code}/stream`)
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.members) {
          setRoom((prev) => (prev ? { ...prev, members: data.members } : prev))
        }
        if (data.error) setError(data.error)
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      // SSE reconnects automatically; just log silently
    }

    return () => {
      es.close()
      eventSourceRef.current = null
      abortRef.current?.abort()
    }
  }, [code, fetchLeaderboard])

  const createRoom = useCallback(async (name?: string): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!r.ok) throw new Error("Oda oluşturulamadı")
      const data = await r.json()
      return data.room.code as string
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (roomCode: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/rooms/${roomCode}/join`, { method: "POST" })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error(d.error ?? "Odaya katılınamadı")
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(
    async (isWorking: boolean): Promise<void> => {
      if (!code) return
      await fetch(`/api/rooms/${code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isWorking }),
      })
    },
    [code]
  )

  return { room, leaderboard, loading, error, createRoom, joinRoom, updateStatus }
}
