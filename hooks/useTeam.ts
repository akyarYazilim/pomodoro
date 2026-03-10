"use client"

import { useState, useEffect, useCallback } from "react"

export interface TeamUser {
  id: string
  name: string | null
  image: string | null
}

export interface TeamMemberEntry {
  userId: string
  name: string | null
  image: string | null
  role: "OWNER" | "ADMIN" | "MEMBER"
  thisWeekMinutes: number
  prevWeekMinutes: number
  tasksCompleted: number
}

export interface TeamInvite {
  id: string
  email: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  ownerId: string
  members: Array<{ userId: string; role: string; user: TeamUser }>
  invites: TeamInvite[]
}

interface UseTeamReturn {
  team: Team | null
  role: string | null
  stats: TeamMemberEntry[]
  totalMinutes: number
  totalTasks: number
  loading: boolean
  error: string | null
  createTeam: (name: string) => Promise<boolean>
  inviteMember: (email: string) => Promise<boolean>
  refreshStats: () => Promise<void>
}

export function useTeam(): UseTeamReturn {
  const [team, setTeam] = useState<Team | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [stats, setStats] = useState<TeamMemberEntry[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (teamId: string) => {
    const r = await fetch(`/api/teams/${teamId}/stats`)
    if (!r.ok) return
    const data = await r.json()
    setStats(data.entries ?? [])
    setTotalMinutes(data.totalMinutes ?? 0)
    setTotalTasks(data.totalTasks ?? 0)
  }, [])

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/teams")
      if (!r.ok) throw new Error("Takım bilgisi alınamadı")
      const data = await r.json()
      setTeam(data.team)
      setRole(data.role ?? null)
      if (data.team) await fetchStats(data.team.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata")
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const createTeam = useCallback(
    async (name: string): Promise<boolean> => {
      setError(null)
      try {
        const r = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          throw new Error(d.error ?? "Takım oluşturulamadı")
        }
        const data = await r.json()
        setTeam(data.team)
        setRole("OWNER")
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : "Hata")
        return false
      }
    },
    []
  )

  const inviteMember = useCallback(
    async (email: string): Promise<boolean> => {
      if (!team) return false
      setError(null)
      try {
        const r = await fetch(`/api/teams/${team.id}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          throw new Error(d.error ?? "Davet gönderilemedi")
        }
        const data = await r.json()
        setTeam((prev) =>
          prev ? { ...prev, invites: [...prev.invites, data.invite] } : prev
        )
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : "Hata")
        return false
      }
    },
    [team]
  )

  const refreshStats = useCallback(async () => {
    if (team) await fetchStats(team.id)
  }, [team, fetchStats])

  return {
    team,
    role,
    stats,
    totalMinutes,
    totalTasks,
    loading,
    error,
    createTeam,
    inviteMember,
    refreshStats,
  }
}
