import React from 'react'
import { useNavigate } from 'react-router'
import {
  MapPin,
  Maximize2,
  ArrowRight,
  Radio,
  Send,
  Sparkles,
  CircleCheck,
  CalendarDays,
  Download,
} from 'lucide-react'
import { MetricCards } from '../components/analytics/MetricCards'
import { Panel, Heading } from '../components/common/Panel'
import { RoadMap } from '../components/map/RoadMap'
import { PriorityBadge } from '../components/common/PriorityBadge'
import { CaseTable } from '../components/cases/CaseTable'
import { useCases } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'
import type { Case } from '../types'
import roadHero from '../assets/kuala-lumpur-road.jpg'

export function DashboardPage() {
  const navigate = useNavigate()
  const { cases, setPriorityFilter, exportReport } = useCases()
  const { t } = useLanguage()

  const urgentCases = cases
    .filter((c) => c.priority >= 4 && !['Resolved', 'Closed'].includes(c.status))
    .sort((a, b) => b.priority - a.priority)

  const activeCasesForMap = cases.filter((c) => !['Resolved', 'Closed'].includes(c.status))

  const handleOpenCase = (item: Case) => {
    navigate(`/cases/${item.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-navy p-6 text-white shadow-md sm:p-8">
        <img
          src={roadHero}
          alt="Kuala Lumpur Road Network"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_60%] opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy via-navy/85 to-navy/40" />

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-teal uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              UTP Codefest 2026 · Civic Tech Track
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t('Road Hazard Command Centre', 'Pusat Kawalan Bahaya Jalan')}
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300">
              {t(
                'AI-assisted road damage monitoring and severity prioritisation for Jabatan Kerja Raya Malaysia.',
                'Pemantauan kerosakan jalan berbantukan AI dan penentuan keutamaan untuk Jabatan Kerja Raya Malaysia.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 rounded-md bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
            >
              <Download size={14} />
              <span>{t('Export CSV', 'Eksport CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <MetricCards />

      {/* Map & Urgent Queue Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        {/* Map Panel */}
        <Panel>
          <Heading
            title={t('Live Road Hazard Map', 'Peta Bahaya Jalan Langsung')}
            subtitle="Kuala Lumpur & Klang Valley Metropolitan District"
            action={
              <button
                onClick={() => navigate('/map')}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>{t('Expand Map', 'Buka Peta Penuh')}</span>
                <Maximize2 size={13} />
              </button>
            }
          />
          <RoadMap cases={activeCasesForMap} onCase={handleOpenCase} />
        </Panel>

        {/* High Priority Queue */}
        <Panel>
          <Heading
            title={t('High Priority Queue', 'Barisan Keutamaan Segera')}
            subtitle={t('Immediate action required', 'Tindakan segera diperlukan')}
            action={
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {urgentCases.length} {t('Urgent', 'Segera')}
              </span>
            }
          />
          <div className="divide-y divide-border p-3 space-y-2">
            {urgentCases.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenCase(item)}
                className={`w-full rounded-lg border border-border border-l-4 bg-white p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer shadow-2xs ${
                  item.priority === 5 ? 'border-l-priority-5' : 'border-l-priority-4'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{item.id}</span>
                  <PriorityBadge value={item.priority} />
                </div>
                <p className="mt-1.5 text-xs font-bold text-foreground">{item.issue}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    {item.road}, {item.area}
                  </span>
                  <span>{item.time}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setPriorityFilter('5')
              navigate('/cases')
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-border py-3 text-xs font-semibold text-primary hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{t('View All Critical Incidents', 'Lihat Semua Kes Kritikal')}</span>
            <ArrowRight size={14} />
          </button>
        </Panel>
      </div>

      {/* Recent Cases & Realtime Activity */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <Heading
            title={t('Recent Incidents', 'Aduan Terkini')}
            subtitle={t('Latest citizen submissions', 'Laporan terkini orang awam')}
            action={
              <button
                onClick={() => navigate('/cases')}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>{t('View All', 'Lihat Semua')}</span>
                <ArrowRight size={13} />
              </button>
            }
          />
          <CaseTable items={cases.slice(0, 5)} compact onSelectCase={handleOpenCase} />
        </Panel>

        {/* Live Activity Pipeline Feed */}
        <Panel>
          <Heading
            title={t('Civic Pipeline Stream', 'Aliran Saluran Awam')}
            subtitle="Telegram → Gemini AI → JKR Action"
            action={<Radio size={15} className="text-teal-ink animate-pulse" />}
          />
          <div className="space-y-4 p-5">
            {[
              {
                icon: Send,
                title: 'Citizen Report Received',
                detail: `${cases[0]?.id || 'JKR-1048'} · ${cases[0]?.road || 'Jalan Sentul'} via Telegram Bot`,
                time: cases[0]?.time || 'Just now',
                badgeColor: 'bg-blue-100 text-blue-800',
              },
              {
                icon: Sparkles,
                title: 'Gemini 3.5 Flash-Lite Vision Scored',
                detail: `${cases[1]?.id || 'JKR-1047'} · P${cases[1]?.priority || 4} severity score assigned`,
                time: '12 min ago',
                badgeColor: 'bg-purple-100 text-purple-800',
              },
              {
                icon: CircleCheck,
                title: 'Case Resolved & Citizen Notified',
                detail: `Pothole patched · Automated Telegram receipt sent`,
                time: '2 hours ago',
                badgeColor: 'bg-teal/20 text-teal-ink',
              },
            ].map((feed, idx) => (
              <div key={idx} className="relative flex gap-3 border-l-2 border-slate-200 pb-3 pl-4">
                <span className="-left-1.5 absolute top-0 h-2.5 w-2.5 rounded-full bg-teal ring-4 ring-white" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{feed.title}</p>
                    <span className="text-[10px] text-muted-foreground">{feed.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{feed.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

