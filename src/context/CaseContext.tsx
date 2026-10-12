import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Case, CaseStatus } from '../types'
import { initialCases, samplePhotos } from '../data/initialCases'
import { getStoredCases, saveStoredCases, updateCaseStatusInDb } from '../services/supabase'

type CaseContextType = {
  cases: Case[]
  filteredCases: Case[]
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  priorityFilter: string
  setPriorityFilter: (v: string) => void
  areaFilter: string
  setAreaFilter: (v: string) => void
  dateFilter: string
  setDateFilter: (v: string) => void
  toast: string
  setToast: (msg: string) => void
  updateStatus: (item: Case, status: CaseStatus) => void
  simulateTelegramReport: () => void
  exportReport: () => void
  notifications: boolean
  setNotifications: (v: boolean) => void
}

const CaseContext = createContext<CaseContextType | undefined>(undefined)

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>(() => getStoredCases())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [areaFilter, setAreaFilter] = useState('All areas')
  const [dateFilter, setDateFilter] = useState('')
  const [toast, setToast] = useState('')
  const [notifications, setNotifications] = useState(false)

  useEffect(() => {
    saveStoredCases(cases)
  }, [cases])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const filteredCases = cases
    .filter((item) => {
      const matchesStatus =
        statusFilter === 'All statuses' ||
        item.status === statusFilter ||
        (statusFilter === 'Active' && !['Resolved', 'Closed'].includes(item.status)) ||
        (statusFilter === 'Pending' && ['Submitted', 'Assessed'].includes(item.status))

      const matchesPriority =
        priorityFilter === 'All priorities' || item.priority === Number(priorityFilter)

      const matchesArea = areaFilter === 'All areas' || item.area === areaFilter

      const matchesDate = !dateFilter || item.date === dateFilter

      const matchesSearch = `${item.id} ${item.issue} ${item.road} ${item.area}`
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchesStatus && matchesPriority && matchesArea && matchesDate && matchesSearch
    })
    .sort((a, b) => b.priority - a.priority)

  const updateStatus = async (item: Case, status: CaseStatus) => {
    await updateCaseStatusInDb(item.id, status)
    setCases((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, status, history: [...c.history, status] } : c
      )
    )
    setToast(
      status === 'Resolved'
        ? `Case ${item.id} resolved successfully · Telegram notification sent to reporter`
        : `Case ${item.id} status updated to ${status}`
    )
  }

  const simulateTelegramReport = () => {
    const nextNum = 1049 + cases.length - initialCases.length
    const newItem: Case = {
      id: `JKR-${nextNum}`,
      issue: 'Deep Pothole',
      road: 'Jalan Sentul',
      area: 'Kuala Lumpur',
      priority: 5,
      status: 'Assessed',
      lat: 3.184 + (Math.random() - 0.5) * 0.03,
      lng: 101.695 + (Math.random() - 0.5) * 0.03,
      time: 'Just now',
      image: samplePhotos[cases.length % samplePhotos.length],
      date: new Date().toISOString().slice(0, 10),
      history: ['Submitted', 'Assessed'],
      justification:
        'Gemini 2.5 Flash: Critical 6cm pothole identified on two-wheel traffic path. High hazard risk.',
      reporterName: 'Telegram User @citizen_kl',
      telegramChatId: 987654321,
    }

    setCases((prev) => [newItem, ...prev])
    setToast(`${newItem.id} received via Telegram Bot · P5 Critical (AI Scored)`)
    setNotifications(true)
  }

  const exportReport = () => {
    const rows = [
      ['ID', 'Issue', 'Road', 'Area', 'Priority', 'Status', 'Date', 'Time'],
      ...cases.map((c) => [c.id, c.issue, c.road, c.area, c.priority, c.status, c.date, c.time]),
    ]
    const csvContent = rows.map((e) => e.map((x) => `"${x}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `JKR_Road_Hazard_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setToast('CSV Report exported successfully')
  }

  return (
    <CaseContext.Provider
      value={{
        cases,
        filteredCases,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        areaFilter,
        setAreaFilter,
        dateFilter,
        setDateFilter,
        toast,
        setToast,
        updateStatus,
        simulateTelegramReport,
        exportReport,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </CaseContext.Provider>
  )
}

export function useCases() {
  const context = useContext(CaseContext)
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider')
  }
  return context
}

