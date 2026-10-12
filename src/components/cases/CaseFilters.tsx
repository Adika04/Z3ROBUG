import React from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useCases } from '../../context/CaseContext'
import { useLanguage } from '../../context/LanguageContext'

export function CaseFilters() {
  const {
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    areaFilter,
    setAreaFilter,
    dateFilter,
    setDateFilter,
  } = useCases()
  const { t } = useLanguage()

  const resetFilters = () => {
    setStatusFilter('All statuses')
    setPriorityFilter('All priorities')
    setAreaFilter('All areas')
    setDateFilter('')
  }

  const isFiltered =
    statusFilter !== 'All statuses' ||
    priorityFilter !== 'All priorities' ||
    areaFilter !== 'All areas' ||
    Boolean(dateFilter)

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-border bg-slate-50/50">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
        <SlidersHorizontal size={14} />
        <span>{t('Filter:', 'Tapis:')}</span>
      </div>

      {/* Status */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-foreground outline-none hover:border-slate-300"
      >
        <option value="All statuses">{t('All Statuses', 'Semua Status')}</option>
        <option value="Active">{t('Active Only', 'Aktif Sahaja')}</option>
        <option value="Pending">{t('Pending Action', 'Menunggu Tindakan')}</option>
        <option value="Submitted">Submitted</option>
        <option value="Assessed">Assessed</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      {/* Priority */}
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-foreground outline-none hover:border-slate-300"
      >
        <option value="All priorities">{t('All Priorities', 'Semua Keutamaan')}</option>
        <option value="5">P5 · Critical (Kritikal)</option>
        <option value="4">P4 · High (Tinggi)</option>
        <option value="3">P3 · Medium (Sederhana)</option>
        <option value="2">P2 · Low (Rendah)</option>
        <option value="1">P1 · Minor (Kecil)</option>
      </select>

      {/* Area */}
      <select
        value={areaFilter}
        onChange={(e) => setAreaFilter(e.target.value)}
        className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-foreground outline-none hover:border-slate-300"
      >
        <option value="All areas">{t('All Municipal Areas', 'Semua Kawasan')}</option>
        <option value="Kuala Lumpur">Kuala Lumpur</option>
        <option value="Petaling Jaya">Petaling Jaya</option>
        <option value="Gombak">Gombak</option>
        <option value="Cheras">Cheras</option>
        <option value="Kepong">Kepong</option>
        <option value="Puchong">Puchong</option>
      </select>

      {/* Date */}
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-foreground outline-none hover:border-slate-300"
      />

      {isFiltered && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 cursor-pointer"
        >
          <RotateCcw size={12} />
          {t('Reset', 'Set Semula')}
        </button>
      )}
    </div>
  )
}

