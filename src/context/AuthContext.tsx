import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { StaffRole, StaffUser } from '../types'

type AuthContextType = {
  role: StaffRole
  setRole: (role: StaffRole) => void
  signedIn: boolean
  setSignedIn: (value: boolean) => void
  staffList: StaffUser[]
  addStaff: (user: StaffUser) => void
  toggleStaffActive: (email: string) => void
}

const defaultStaff: StaffUser[] = [
  { name: 'Ahmad Faizal', email: 'ahmad.faizal@jkr.gov.my', role: 'Admin', active: true },
  { name: 'Nur Aisyah', email: 'nur.aisyah@jkr.gov.my', role: 'JKR Officer', active: true },
  { name: 'Muhammad Hakim', email: 'hakim@jkr.gov.my', role: 'JKR Officer', active: true },
  { name: 'Siti Farhana', email: 'siti.farhana@jkr.gov.my', role: 'Viewer', active: true },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<StaffRole>('Admin')
  const [signedIn, setSignedIn] = useState(true)
  const [staffList, setStaffList] = useState<StaffUser[]>(defaultStaff)

  const addStaff = (user: StaffUser) => {
    setStaffList((prev) => [...prev, user])
  }

  const toggleStaffActive = (email: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.email === email ? { ...s, active: !s.active } : s))
    )
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        signedIn,
        setSignedIn,
        staffList,
        addStaff,
        toggleStaffActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

