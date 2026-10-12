import React from 'react'
import { useParams, useNavigate } from 'react-router'
import { Download } from 'lucide-react'
import { CaseFilters } from '../components/cases/CaseFilters'
import { CaseTable } from '../components/cases/CaseTable'
import { CaseDetailView } from '../components/cases/CaseDetailView'
import { Panel, Heading } from '../components/common/Panel'
import { useCases } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'

export function CasesPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { cases, filteredCases, exportReport } = useCases()
  const { t } = useLanguage()

  const selectedCase = id ? cases.find((c) => c.id === id) : null

  if (selectedCase) {
    return <CaseDetailView caseItem={selectedCase} onBack={() => navigate('/cases')} />
  }

  return (
    <Panel>
      <CaseFilters />
      <Heading
        title={`${filteredCases.length} ${t('Road Hazard Cases', 'Kes Kerosakan Jalan')}`}
        subtitle={t(
          'Ordered by priority score (P5 Critical to P1 Minor)',
          'Disusun mengikut tahap keutamaan (P5 Kritikal hingga P1 Kecil)'
        )}
        action={
          <button
            onClick={exportReport}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            <span>{t('Export CSV', 'Eksport CSV')}</span>
          </button>
        }
      />
      <CaseTable
        items={filteredCases}
        onSelectCase={(item) => navigate(`/cases/${item.id}`)}
      />
      <div className="border-t border-border px-5 py-3.5 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>
          {t('Showing', 'Menunjukkan')} {filteredCases.length} {t('of', 'daripada')} {cases.length} {t('cases', 'kes')}
        </span>
        <span>{t('Click row for complete AI & Telegram details', 'Klik baris untuk butiran AI & Telegram')}</span>
      </div>
    </Panel>
  )
}

