import React, { createContext, useContext, useState, type ReactNode } from 'react'

type LanguageContextType = {
  bm: boolean
  setBm: (value: boolean) => void
  toggleLanguage: () => void
  t: (en: string, ms: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [bm, setBm] = useState(false)

  const toggleLanguage = () => setBm((prev) => !prev)
  const t = (en: string, ms: string) => (bm ? ms : en)

  return (
    <LanguageContext.Provider value={{ bm, setBm, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

