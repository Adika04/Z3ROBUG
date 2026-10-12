import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { Case } from '../../types'
import { PriorityBadge } from '../common/PriorityBadge'
import { StatusBadge } from '../common/StatusBadge'
import { useLanguage } from '../../context/LanguageContext'

export function CaseTable({
  items,
  compact = false,
  onSelectCase,
}: {
  items: Case[]
  compact?: boolean
  onSelectCase: (item: Case) => void
}) {
  const { t } = useLanguage()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3">{t('CASE ID', 'ID KES')}</th>
            {!compact && <th className="px-5 py-3">{t('IMAGE', 'GAMBAR')}</th>}
            <th className="px-5 py-3">{t('ISSUE / LOCATION', 'ISU / LOKASI')}</th>
            <th className="px-5 py-3">{t('PRIORITY', 'KEUTAMAAN')}</th>
            <th className="px-5 py-3">{t('STATUS', 'STATUS')}</th>
            <th className="px-5 py-3">{t('REPORTED', 'DILAPORKAN')}</th>
            <th className="py-3 pr-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelectCase(item)}
              className="cursor-pointer transition-colors hover:bg-blue-50/50"
            >
              <td className="px-5 py-3.5 font-bold text-primary">{item.id}</td>
              {!compact && (
                <td className="px-5 py-3">
                  <img
                    src={item.image}
                    alt={item.issue}
                    className="h-11 w-14 rounded-md bg-slate-100 object-cover shadow-2xs"
                  />
                </td>
              )}
              <td className="px-5 py-3.5">
                <span className="font-semibold text-foreground">{item.issue}</span>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {item.road}, {item.area}
                </p>
              </td>
              <td className="px-5 py-3">
                <PriorityBadge value={item.priority} />
              </td>
              <td className="px-5 py-3">
                <StatusBadge value={item.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-[11px] text-muted-foreground">
                {item.time}
              </td>
              <td className="py-3 pr-4 text-right">
                <ChevronRight size={15} className="text-muted-foreground inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t('No cases match your filter criteria.', 'Tiada kes yang sepadan dengan kriteria anda.')}
        </div>
      )}
    </div>
  )
}

