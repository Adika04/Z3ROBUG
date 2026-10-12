import React from 'react'
import { useNavigate } from 'react-router'
import { FolderOpen, Clock, Layers, CircleCheck, ArrowUpRight } from 'lucide-react'
import { useCases } from '../../context/CaseContext'
import { useLanguage } from '../../context/LanguageContext'

export function MetricCards() {
  const navigate = useNavigate()
  const { cases, setPriorityFilter, setStatusFilter } = useCases()
  const { t } = useLanguage()

  const urgentP5 = cases.filter(
    (c) => c.priority === 5 && !['Resolved', 'Closed'].includes(c.status)
  )
  const inProgress = cases.filter((c) => c.status === 'In Progress')
  const resolved = cases.filter((c) => c.status === 'Resolved')
  const resolutionRate = cases.length > 0 ? Math.round((resolved.length / cases.length) * 100) : 0

  const stats = [
    {
      label: t('Total Reports', 'Jumlah Laporan'),
      count: cases.length,
      icon: FolderOpen,
      iconColor: 'text-navy',
      note: t('All reported road hazards', 'Semua aduan kerosakan jalan'),
      subtext: `${cases.length} ${t('total incidents', 'jumlah kes')}`,
      onClick: () => {
        setStatusFilter('All statuses')
        setPriorityFilter('All priorities')
        navigate('/cases')
      },
    },
    {
      label: t('Critical Cases', 'Kes Kritikal'),
      count: urgentP5.length,
      icon: Clock,
      iconColor: 'text-priority-5',
      note: t('P5 hazards requiring immediate attention', 'Bahaya P5 memerlukan perhatian segera'),
      subtext: `${urgentP5.length} ${t('awaiting rapid response', 'menanti tindakan pantas')}`,
      highlightBorder: true,
      onClick: () => {
        setPriorityFilter('5')
        setStatusFilter('Active')
        navigate('/cases')
      },
    },
    {
      label: t('In Progress', 'Dalam Tindakan'),
      count: inProgress.length,
      icon: Layers,
      iconColor: 'text-primary',
      note: t('Currently being repaired', 'Sedang dibaiki oleh kru JKR'),
      subtext: t('Active maintenance crews', 'Kru pembaikan aktif'),
      onClick: () => {
        setStatusFilter('In Progress')
        setPriorityFilter('All priorities')
        navigate('/cases')
      },
    },
    {
      label: t('Resolved Cases', 'Kes Selesai'),
      count: resolved.length,
      icon: CircleCheck,
      iconColor: 'text-teal-ink',
      note: t('Roads repaired & made safer', 'Jalan dibaiki & selamat'),
      subtext: `${resolutionRate}% ${t('resolution rate', 'kadar penyelesaian')}`,
      onClick: () => {
        setStatusFilter('Resolved')
        setPriorityFilter('All priorities')
        navigate('/cases')
      },
    },
  ]

  return (
    <div className="grid grid-cols-2 border-y border-border bg-white xl:grid-cols-4 shadow-2xs">
      {stats.map((stat, index) => (
        <button
          key={stat.label}
          onClick={stat.onClick}
          className={`group border-r border-border p-5 text-left transition-colors hover:bg-slate-50/80 cursor-pointer ${
            stat.highlightBorder ? 'border-t-3 border-t-priority-5 bg-red-50/20' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
            <span className={`p-1.5 rounded-md ${stat.iconColor}`}>
              <stat.icon size={18} />
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
              {stat.count}
            </span>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground truncate">{stat.subtext}</p>
        </button>
      ))}
    </div>
  )
}

