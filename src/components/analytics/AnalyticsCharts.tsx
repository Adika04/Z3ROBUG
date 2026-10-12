import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { useCases } from '../../context/CaseContext'
import { priorityColors, priorityNames } from '../../data/initialCases'
import { Panel, Heading } from '../common/Panel'
import { useLanguage } from '../../context/LanguageContext'

export function AnalyticsCharts({ dateRange = 'Last 7 days' }: { dateRange?: string }) {
  const { cases } = useCases()
  const { t } = useLanguage()

  const daysCount = dateRange === 'Last 30 days' ? 30 : 7

  const chartData = Array.from({ length: daysCount }, (_, index) => {
    const current = new Date(Date.UTC(2026, 9, 6))
    current.setUTCDate(current.getUTCDate() - (daysCount - 1) + index)
    const dateStr = current.toISOString().slice(0, 10)
    return {
      day: current.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      Cases: cases.filter((item) => item.date === dateStr).length,
      Resolved: cases.filter((item) => item.date === dateStr && item.status === 'Resolved').length,
    }
  })

  // Priority breakdown counts
  const priorityData = [1, 2, 3, 4, 5].map((val) => ({
    priority: `P${val}`,
    name: priorityNames[val - 1],
    count: cases.filter((c) => c.priority === val).length,
    color: priorityColors[val - 1],
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Panel>
        <Heading
          title={t('Cases Over Time', 'Jumlah Kes Mengikut Masa')}
          subtitle={`${dateRange} · New Ingested vs. Resolved`}
        />
        <div className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6eaf0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e6eaf0',
                  fontSize: '11px',
                }}
              />
              <Area dataKey="Cases" stroke="#1769E0" fill="#edf3ff" strokeWidth={2} name="Total Ingested" />
              <Area dataKey="Resolved" stroke="#00A6A6" fill="#E6F7F6" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <Heading
          title={t('Severity Distribution', 'Taburan Keterukan Bahaya')}
          subtitle="AI Scored (P1 Minor to P5 Critical)"
        />
        <div className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6eaf0" />
              <XAxis dataKey="priority" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e6eaf0',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {priorityData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}

