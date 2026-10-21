import type { Case, CaseStatus } from '../types'
import { initialCases } from '../data/initialCases'

/**
 * Abrar's Deliverable: Supabase Database, Auth & Realtime Sync
 *
 * fetchReportsFromDb() reads the live `reports` table (written by the
 * Telegram bot) and maps each row to the dashboard's `Case` shape.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const STORAGE_KEY = 'jkr-cases-records'

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

// ---------------------------------------------------------------------------
// Read reports from Supabase (REST, no extra dependency needed)
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(iso).getTime())
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`
  const days = Math.floor(hr / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

// Maps a row of the `reports` table to the dashboard's Case type.
function rowToCase(r: any): Case {
  return {
    id: r.id,
    issue: r.issue_type ?? 'Pothole',
    road: r.road_name ?? 'Unknown road',
    area: r.area ?? 'Kuala Lumpur',
    priority: r.severity_score ?? 3, // fallback only if a report was saved unscored
    status: r.status as CaseStatus,
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    time: timeAgo(r.created_at),
    image: r.image_url ?? '',
    date: String(r.created_at).slice(0, 10),
    history: Array.isArray(r.history) ? r.history : [r.status],
    justification: r.ai_justification ?? undefined,
    reporterName: r.reporter_name ?? undefined,
    telegramChatId: r.telegram_chat_id ?? undefined,
  }
}

/**
 * Returns all reports (newest first), or null if Supabase isn't configured
 * or the request failed, so callers can keep their current data.
 */
export async function fetchReportsFromDb(): Promise<Case[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/reports?select=*&order=created_at.desc&limit=200`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
    if (!response.ok) {
      console.warn('Supabase read failed:', response.status, await response.text())
      return null
    }
    const rows = await response.json()
    return rows.map(rowToCase)
  } catch (err) {
    console.warn('Supabase read failed:', err)
    return null
  }
}

// Alias so older code that calls the previous name keeps working.
export const fetchCasesFromSupabase = fetchReportsFromDb

/**
 * Updates a case status (and optionally its lifecycle history) in Supabase.
 */
export async function updateCaseStatusInDb(
  caseId: string,
  newStatus: CaseStatus,
  newHistory?: string[]
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const body: Record<string, unknown> = { status: newStatus }
      if (newHistory) body.history = newHistory
      if (newStatus === 'Resolved') body.resolved_at = new Date().toISOString()

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
      console.warn('Supabase PATCH rejected:', response.status, await response.text())
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
          history: newHistory ?? [...c.history, newStatus],
        }
      : c
  )
  saveStoredCases(updated)
  return true
}
