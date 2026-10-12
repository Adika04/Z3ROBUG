import React from 'react'
import { Sparkles, Database, Send, Plus, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Panel, Heading } from '../components/common/Panel'
import { useLanguage } from '../context/LanguageContext'
import { useCases } from '../context/CaseContext'
import { isSupabaseConfigured } from '../services/supabase'

export function SettingsPage() {
  const { bm, setBm, t } = useLanguage()
  const { simulateTelegramReport } = useCases()

  return (
    <div className="max-w-4xl space-y-6">
      <Panel>
        <Heading
          title={t('System Preferences & Integrations', 'Keutamaan Sistem & Integrasi')}
          subtitle={t('Configure interface language and pipeline connectors', 'Tetapkan bahasa antara muka dan penyambung saluran')}
        />
        <div className="space-y-6 p-6">
          {/* Language Selection */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <div>
              <p className="text-xs font-bold text-foreground">
                {t('Interface Language (Localization)', 'Bahasa Antara Muka')}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t('Toggle between Bahasa Melayu (BM) and English', 'Pilih Bahasa Melayu atau Bahasa Inggeris')}
              </p>
            </div>
            <select
              value={bm ? 'BM' : 'EN'}
              onChange={(e) => setBm(e.target.value === 'BM')}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground outline-none"
            >
              <option value="EN">English (EN)</option>
              <option value="BM">Bahasa Melayu (BM)</option>
            </select>
          </div>

          {/* 4-Layer Architecture Pipeline Status */}
          <div>
            <p className="text-xs font-bold text-foreground mb-3">
              {t('4-Layer Civic System Status', 'Status Saluran Awam 4-Lapisan')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Send size={15} className="text-blue-500" />
                  <span>Layer 1: Telegram Bot</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  @AduanPotholeBot · Native GPS pin & photo upload enabled.
                </p>
              </div>

              <div className="rounded-lg border border-border p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Sparkles size={15} className="text-purple-500" />
                  <span>Layer 2: Gemini 2.5 Flash</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Multimodal vision assessment · 1-5 severity scale & justification.
                </p>
              </div>

              <div className="rounded-lg border border-border p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Database size={15} className="text-teal-ink" />
                  <span>Layer 3: Supabase PostgreSQL</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {isSupabaseConfigured ? 'Connected to live cloud Supabase instance.' : 'Running in local reactive mode with schema sync ready.'}
                </p>
              </div>

              <div className="rounded-lg border border-border p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 size={15} className="text-green-600" />
                  <span>Layer 4: JKR Dashboard</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  React 19 + Tailwind CSS + OpenStreetMap Leaflet GIS.
                </p>
              </div>
            </div>
          </div>

          {/* Test Submission Action */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">
                {t('Test Pipeline Injection', 'Uji Suntikan Saluran')}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Simulate an immediate incoming citizen report with AI scoring.
              </p>
            </div>
            <button
              onClick={simulateTelegramReport}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>{t('Simulate Report', 'Uji Aduan')}</span>
            </button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

