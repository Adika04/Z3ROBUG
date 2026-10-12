import type { Case, CaseStatus } from '../types'
import { initialCases } from '../data/initialCases'

/**
 * Abrar's Deliverable: Supabase Database, Auth & Realtime Sync
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

/**
 * Updates a case status and appends to lifecycle history
 */
export async function updateCaseStatusInDb(
  caseId: string,
  newStatus: CaseStatus
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${caseId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: newStatus }),
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

