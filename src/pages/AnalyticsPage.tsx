import React, { useState } from 'react'
import { MetricCards } from '../components/analytics/MetricCards'
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts'
import { Panel, Heading } from '../components/common/Panel'
import { useCases } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 7 days')
  const { cases } = useCases()
  const { t } = useLanguage()

  // Area statistics aggregation
  const areaSummary = ['Kuala Lumpur', 'Petaling Jaya', 'Gombak', 'Cheras', 'Kepong', 'Puchong'].map(
    (areaName) => {
      const areaCases = cases.filter((c) => c.area === areaName)
      const resolvedCount = areaCases.filter((c) => c.status === 'Resolved').length
      const p5Count = areaCases.filter((c) => c.priority === 5).length
      return {
        name: areaName,
        total: areaCases.length,
        critical: p5Count,
        resolved: resolvedCount,
        rate: areaCases.length > 0 ? Math.round((resolvedCount / areaCases.length) * 100) : 0,
      }
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t('Operational Analytics & Performance', 'Analitik Operasi & Prestasi')}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              'Real-time metrics on report volume, AI scoring distribution, and repair resolution velocity.',
              'Metrik masa nyata berkenaan jumlah aduan, agihan skor AI, dan kepantasan pembaikan.'
            )}
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-foreground outline-none shadow-2xs"
        >
          <option value="Last 7 days">{t('Last 7 Days', '7 Hari Lepas')}</option>
          <option value="Last 30 days">{t('Last 30 Days', '30 Hari Lepas')}</option>
        </select>
      </div>

      <MetricCards />

      <AnalyticsCharts dateRange={dateRange} />

      {/* District / Area Breakdown Table */}
      <Panel>
        <Heading
          title={t('Municipal District Breakdown', 'Pecahan Mengikut Daerah')}
          subtitle={t('Incident distribution across local councils', 'Taburan insiden mengikut kawasan majlis tempatan')}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">District / Area</th>
                <th className="p-4">Total Incidents</th>
                <th className="p-4">Critical (P5)</th>
                <th className="p-4">Resolved</th>
                <th className="p-4 pr-6">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {areaSummary.map((area) => (
                <tr key={area.name} className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-semibold text-foreground">{area.name}</td>
                  <td className="p-4">{area.total}</td>
                  <td className="p-4 font-semibold text-red-600">{area.critical}</td>
                  <td className="p-4 font-semibold text-teal-ink">{area.resolved}</td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal"
                          style={{ width: `${area.rate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">{area.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

