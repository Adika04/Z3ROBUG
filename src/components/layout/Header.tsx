import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  Sparkles,
  CircleAlert,
  X,
  LogOut,
  Radio,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useCases } from '../../context/CaseContext'
import { Panel, Heading } from '../common/Panel'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate()
  const { bm, setBm, t } = useLanguage()
  const { role, setRole, setSignedIn } = useAuth()
  const {
    search,
    setSearch,
    cases,
    simulateTelegramReport,
    notifications,
    setNotifications,
  } = useCases()

  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-white px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          className="p-1 text-slate-600 hover:text-foreground lg:hidden cursor-pointer"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative">
          <Search size={15} className="absolute top-2.5 left-2.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (window.location.pathname !== '/cases') {
                navigate('/cases')
              }
            }}
            placeholder={t('Search cases, road, ID…', 'Cari kes, jalan, ID…')}
            className="w-44 rounded-md border border-border bg-slate-50 py-1.5 pl-8 pr-3 text-[11px] text-foreground transition-all focus:border-primary focus:bg-white sm:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Simulate Live Telegram Report (Crucial for Demo/Hackathon Presentation) */}
        <button
          onClick={simulateTelegramReport}
          title="Simulate incoming Citizen Telegram report with AI Vision Scoring"
          className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-blue-100 cursor-pointer shadow-2xs"
        >
          <Sparkles size={13} className="text-primary" />
          <span className="hidden sm:inline">{t('Simulate Telegram', 'Uji Aduan Telegram')}</span>
          <span className="sm:hidden">+Telegram</span>
        </button>

        {/* Live Indicator */}
        <span className="hidden items-center gap-1.5 rounded-md border border-teal/20 bg-accent px-2 py-1 text-[9px] font-bold tracking-wider text-teal-ink md:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          LIVE SYNC
        </span>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifications(!notifications)
              setProfileOpen(false)
            }}
            className="relative p-1.5 text-slate-500 hover:text-foreground cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-teal ring-2 ring-white" />
          </button>

          {notifications && (
            <div className="absolute top-10 right-0 z-50 w-80 rounded-lg border border-border bg-white shadow-xl">
              <Heading
                title={t('Recent Telegram Alerts', 'Aduan Telegram Terkini')}
                action={
                  <button
                    onClick={() => setNotifications(false)}
                    className="text-slate-400 hover:text-foreground cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                }
              />
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {cases.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/cases/${c.id}`)
                      setNotifications(false)
                    }}
                    className="flex w-full gap-3 p-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    <CircleAlert size={16} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {c.id} · {c.issue}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {c.road}, {c.area} · {c.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="flex rounded-md border border-border p-0.5 text-[10px] font-bold">
          <button
            onClick={() => setBm(true)}
            className={`rounded px-2 py-1 transition-colors cursor-pointer ${
              bm ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
            }`}
          >
            BM
          </button>
          <button
            onClick={() => setBm(false)}
            className={`rounded px-2 py-1 transition-colors cursor-pointer ${
              !bm ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
            }`}
          >
            EN
          </button>
        </div>

        <div className="hidden h-6 border-l border-border sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen)
              setNotifications(false)
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-800">
              AF
            </span>
            <div className="hidden text-left md:block">
              <span className="block text-xs font-semibold text-foreground">Ahmad Faizal</span>
              <span className="block text-[9px] text-muted-foreground">
                {role} · JKR KL
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute top-11 right-0 z-50 w-60 rounded-lg border border-border bg-white p-4 shadow-xl">
              <p className="text-xs font-bold text-foreground">Ahmad Faizal</p>
              <p className="text-[10px] text-muted-foreground">ahmad.faizal@jkr.gov.my</p>

              <div className="mt-3 border-t border-border pt-3">
                <label className="block text-[10px] font-semibold text-muted-foreground">
                  Switch Active Role (RBAC):
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-border bg-slate-50 p-1.5 text-xs text-foreground outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="JKR Officer">JKR Officer (Review & Resolve)</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSignedIn(false)
                  setProfileOpen(false)
                }}
                className="mt-4 flex w-full items-center gap-2 text-xs text-red-600 hover:text-red-700 cursor-pointer pt-2 border-t border-border"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

