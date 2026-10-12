import React from 'react'
import {
  Sparkles,
  CircleCheck,
  Send,
  Check,
  MapPin,
  ArrowLeft,
  Calendar,
  Radio,
} from 'lucide-react'
import type { Case, CaseStatus } from '../../types'
import { PriorityBadge } from '../common/PriorityBadge'
import { StatusBadge } from '../common/StatusBadge'
import { Panel, Heading } from '../common/Panel'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useCases } from '../../context/CaseContext'

export function CaseDetailView({
  caseItem,
  onBack,
}: {
  caseItem: Case
  onBack: () => void
}) {
  const { t } = useLanguage()
  const { role } = useAuth()
  const { updateStatus } = useCases()

  const isResolvedOrClosed = ['Resolved', 'Closed'].includes(caseItem.status)

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>{t('Back to Cases', 'Kembali ke Senarai Kes')}</span>
      </button>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* Left Column: Visual & Geospatial Evidence */}
        <div className="space-y-6">
          <Panel>
            <Heading
              title={caseItem.issue}
              subtitle={`${caseItem.id} · ${caseItem.road}, ${caseItem.area}`}
              action={<PriorityBadge value={caseItem.priority} />}
            />
            <div className="relative">
              <img
                src={caseItem.image}
                alt={caseItem.issue}
                className="h-[380px] w-full bg-slate-100 object-cover"
              />
              <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
                Citizen Telegram Upload
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 border-t border-border">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('Location', 'Lokasi')}
                </p>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  {caseItem.road}, {caseItem.area}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('GPS Coordinates', 'Koordinat GPS')}
                </p>
                <p className="mt-1 text-xs font-mono font-medium text-foreground">
                  {caseItem.lat.toFixed(5)}, {caseItem.lng.toFixed(5)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('Reported At', 'Masa Dilaporkan')}
                </p>
                <p className="mt-1 text-xs font-medium text-foreground">
                  {caseItem.date} · {caseItem.time}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('Ingestion Source', 'Sumber Aduan')}
                </p>
                <p className="mt-1 text-xs font-medium text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Telegram (@AduanPotholeBot)
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: AI Analysis, Status Pipeline, and Feedback */}
        <div className="space-y-6">
          {/* AI Assessment Card (Gemini 2.5 Flash) */}
          <Panel>
            <Heading
              title="AI Assessment — Gemini 2.5 Flash"
              subtitle="Multimodal Road Damage Vision Pipeline"
              action={<Sparkles size={16} className="text-primary" />}
            />
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI Severity Score
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-navy">
                  {caseItem.priority}
                  <span className="text-xl font-normal text-muted-foreground">/5</span>
                </span>
                <PriorityBadge value={caseItem.priority} />
              </div>

              <div className="mt-4 rounded-md border-l-3 border-teal bg-teal/10 p-3.5 text-xs text-foreground">
                <p className="font-bold text-teal-ink mb-1 flex items-center gap-1">
                  <Sparkles size={13} />
                  Gemini Vision Analysis Justification:
                </p>
                <p className="leading-relaxed">
                  {caseItem.justification ||
                    (caseItem.priority >= 4
                      ? 'Crater depth exceeds ~5cm in active traffic lane, posing an immediate hazard to motorcyclists.'
                      : 'Superficial asphalt deterioration noted. Recommended for scheduled maintenance.')}
                </p>
              </div>
            </div>
          </Panel>

          {/* Lifecycle Action Bar */}
          <Panel>
            <Heading
              title={t('Case Status & Actions', 'Status Kes & Tindakan')}
              action={<StatusBadge value={caseItem.status} />}
            />
            <div className="p-5">
              <p className="mb-3 text-xs text-muted-foreground">
                Workflow: Submitted → Assessed → In Progress → Resolved / Closed
              </p>

              {role === 'Viewer' ? (
                <div className="rounded-md bg-slate-50 p-3 text-xs text-muted-foreground">
                  Viewer access · Status updates restricted to JKR Officers & Admins.
                </div>
              ) : isResolvedOrClosed ? (
                <div className="flex items-center gap-2 rounded-md bg-accent p-3.5 text-xs font-semibold text-teal-ink">
                  <CircleCheck size={18} />
                  <span>Case {caseItem.status.toLowerCase()} successfully.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {caseItem.status === 'Submitted' && (
                    <button
                      onClick={() => updateStatus(caseItem, 'Assessed')}
                      className="rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      {t('Confirm AI Assessment', 'Sahkan Penilaian AI')}
                    </button>
                  )}
                  {caseItem.status === 'Assessed' && (
                    <button
                      onClick={() => updateStatus(caseItem, 'In Progress')}
                      className="rounded-md bg-navy px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t('Dispatch Repair Crew', 'Hantar Pasukan Baiki')}
                    </button>
                  )}
                  {caseItem.status === 'In Progress' && (
                    <>
                      <button
                        onClick={() => updateStatus(caseItem, 'Resolved')}
                        className="rounded-md bg-teal px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CircleCheck size={14} />
                        {t('Mark as Resolved (Notify Citizen)', 'Tandakan Selesai (Maklum Orang Awam)')}
                      </button>
                      <button
                        onClick={() => updateStatus(caseItem, 'Closed')}
                        className="rounded-md border border-border px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {t('Close Case', 'Tutup Kes')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* Timeline */}
          <Panel>
            <Heading title={t('Case Progression Timeline', 'Garis Masa Kemajuan Kes')} />
            <div className="space-y-4 p-5">
              {caseItem.history.map((histStatus, index) => {
                const isCurrent = index === caseItem.history.length - 1
                return (
                  <div
                    key={index}
                    className={`relative flex gap-3 border-l-2 pb-2 pl-4 ${
                      isCurrent ? 'border-teal' : 'border-slate-200'
                    }`}
                  >
                    <span
                      className={`-left-1.5 absolute top-0 flex h-3 w-3 items-center justify-center rounded-full ${
                        isCurrent ? 'bg-teal ring-4 ring-teal/20' : 'bg-slate-300'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        {histStatus}
                        {isCurrent && (
                          <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-teal-ink">
                            CURRENT
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {index === 0
                          ? 'Received via Telegram Bot with native GPS pin'
                          : histStatus === 'Assessed'
                            ? 'Gemini 2.5 Flash vision scoring completed'
                            : histStatus === 'In Progress'
                              ? 'Repair team deployed by JKR Officer'
                              : 'Repairs completed & verified by JKR'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          {/* Telegram Reporter Notification Feed */}
          <Panel>
            <Heading
              title={t('Citizen Telegram Feedback Loop', 'Maklum Balas Telegram')}
              action={<Send size={15} className="text-primary" />}
            />
            <div className="p-5 text-xs">
              <div
                className={`rounded-lg p-3.5 ${
                  caseItem.status === 'Resolved'
                    ? 'border border-teal/30 bg-accent text-teal-ink'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                {caseItem.status === 'Resolved' ? (
                  <p className="font-medium">
                    ✓ Telegram notification sent to reporter:
                    <br />
                    <span className="italic text-[11px] mt-1 block">
                      "Aduan {caseItem.id} telah SELESAI dibaiki oleh JKR. Terima kasih!"
                    </span>
                  </p>
                ) : (
                  <p>
                    Automated Telegram message will trigger automatically when this case status is set
                    to <strong>Resolved</strong>.
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

