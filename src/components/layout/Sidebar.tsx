import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  FolderOpen,
  Map,
  ChartNoAxesCombined,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Brand } from '../common/Brand'
import { useLanguage } from '../../context/LanguageContext'
import { useCases } from '../../context/CaseContext'

export const navItems = [
  { name: 'Dashboard', bm: 'Papan Pemuka', icon: LayoutDashboard, path: '/' },
  { name: 'Cases', bm: 'Kes', icon: FolderOpen, path: '/cases' },
  { name: 'Map View', bm: 'Paparan Peta', icon: Map, path: '/map' },
  { name: 'Analytics', bm: 'Analitik', icon: ChartNoAxesCombined, path: '/analytics' },
  { name: 'Reports', bm: 'Laporan', icon: FileText, path: '/reports' },
  { name: 'Staff Accounts', bm: 'Akaun Staf', icon: Users, path: '/staff' },
  { name: 'Settings', bm: 'Tetapan', icon: Settings, path: '/settings' },
]

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { bm, t } = useLanguage()
  const { cases, setSearch } = useCases()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-[232px] flex flex-col bg-navy text-white transition-transform duration-200 lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <Brand />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-5 mb-5 border-t border-white/10" />

        <p className="px-6 pb-2 text-[10px] font-semibold tracking-[.16em] text-slate-400">
          {t('WORKSPACE', 'RUANG KERJA')}
        </p>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/cases' && location.pathname.startsWith('/cases'))

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  onClose()
                  setSearch('')
                }}
                className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[.10] text-white font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-teal'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={17} strokeWidth={1.7} />
                {bm ? item.bm : item.name}
                {item.name === 'Cases' && (
                  <span className="ml-auto rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">
                    {cases.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto px-5 pb-6">
          <div className="mb-4 rounded-lg border border-white/10 bg-white/[.04] p-3">
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />{' '}
              {t('Live Civic Pipeline', 'Saluran Awam Aktif')}
            </div>
            <p className="mt-1 pl-3.5 text-[9px] text-slate-400">
              Telegram Bot · Gemini 2.5 Flash · Supabase
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <ShieldCheck size={22} className="text-slate-400" />
            <div>
              <p className="text-[10px] font-medium text-slate-200">Jabatan Kerja Raya</p>
              <p className="text-[9px] text-slate-400">Malaysia · Rasmi</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

