import type { Case, CaseStatus } from '../types'
import { initialCases, samplePhotos } from '../data/initialCases'

/**
 * Abrar's Deliverable: Supabase Database, Auth & Realtime Sync
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const STORAGE_KEY = 'jkr-cases-records'

// ── Local-storage helpers ──────────────────────────────────────────────────

export function getStoredCases(): Case[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('Failed reading cases from local storage', err)
  }
  return initialCases
}

export function saveStoredCases(cases: Case[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
  } catch (err) {
    console.error('Failed saving cases to local storage', err)
  }
}

// ── Supabase REST helpers ──────────────────────────────────────────────────

/**
 * Fetch all reports from Supabase and map them to the frontend Case type.
 * Returns null when Supabase is not configured or the request fails.
 */
export async function fetchCasesFromSupabase(): Promise<Case[] | null> {
  if (!isSupabaseConfigured) return null

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/reports?order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )

    if (!response.ok) return null

    const rows: any[] = await response.json()
    if (!Array.isArray(rows) || rows.length === 0) return null

    return rows.map(mapSupabaseRowToCase)
  } catch (err) {
    console.warn('Failed fetching cases from Supabase:', err)
    return null
  }
}

/**
 * Updates a case status and appends to lifecycle history
 */
export async function updateCaseStatusInDb(
  caseId: string,
  newStatus: CaseStatus,
  updatedHistory?: string[]
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const body: Record<string, unknown> = { status: newStatus }
      if (updatedHistory) {
        body.history = updatedHistory
      }
      if (newStatus === 'Resolved') {
        body.resolved_at = new Date().toISOString()
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${caseId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(body),
      })
      if (response.ok) return true
    } catch (err) {
      console.warn('Supabase PATCH failed, falling back to local storage:', err)
    }
  }

  // Local storage fallback
  const cases = getStoredCases()
  const updated = cases.map((c) =>
    c.id === caseId
      ? {
          ...c,
          status: newStatus,
          history: [...c.history, newStatus],
        }
      : c
  )
  saveStoredCases(updated)
  return true
}

// ── Mapping helpers ────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  if (hrs < 48) return 'Yesterday'
  return `${Math.floor(hrs / 24)} days ago`
}

function mapSupabaseRowToCase(row: any, index: number): Case {
  const roadDisplay =
    row.road_name && row.road_name !== 'Unknown'
      ? row.road_name
      : row.description || 'Lokasi Awam Dilaporkan'

  return {
    id: row.id,
    issue: row.issue_type || 'Pothole',
    road: roadDisplay,
    area: row.area || 'Kuala Lumpur',
    priority: row.severity_score ?? 3,
    status: row.status || 'Submitted',
    lat: Number(row.latitude) || 3.1412,
    lng: Number(row.longitude) || 101.6865,
    time: row.created_at ? timeAgo(row.created_at) : 'Just now',
    image: row.image_url || samplePhotos[index % samplePhotos.length],
    date: row.created_at
      ? new Date(row.created_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    history: Array.isArray(row.history) ? row.history : ['Submitted'],
    justification: row.ai_justification,
    telegramChatId: row.telegram_chat_id,
    reporterName: row.reporter_name || 'Citizen Reporter',
  }
}
