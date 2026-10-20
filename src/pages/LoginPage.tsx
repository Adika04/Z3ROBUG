import React from 'react'
import { useNavigate } from 'react-router'
import { LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react'
import { Brand } from '../components/common/Brand'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useCases } from '../context/CaseContext'
const roadHero = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR75l6a9AsaxumOQkPdJurP3uRqTfSvBikhTVWdvLDVuETn-8vGlNfHjPvD&s=10'
import type { StaffRole } from '../types'

export function LoginPage() {
  const navigate = useNavigate()
  const { role, setRole, setSignedIn } = useAuth()
  const { bm, setBm, t } = useLanguage()
  const { setToast } = useCases()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setSignedIn(true)
    navigate('/')
    setToast('Signed in to JKR Municipal Dashboard')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* Left Visual Column */}
      <div className="relative isolate hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <img
          src={roadHero}
          alt="Kuala Lumpur Urban Road Network"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_65%] opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy/90 via-navy/75 to-navy/40" />

        <Brand />

        <div>
          <div className="mb-4 inline-flex items-center gap-2 border-l-2 border-teal pl-3 text-[10px] font-bold tracking-widest text-teal uppercase">
            JABATAN KERJA RAYA MALAYSIA
          </div>
          <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
            Safer roads.
            <br />
            Faster response.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            {t(
              'AI-assisted civic road hazard reporting and severity prioritisation for public works officers.',
              'Pelaporan kerosakan jalan awam dan penentuan keutamaan keterukan berbantukan AI untuk pegawai JKR.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-teal" />
          <span>Restricted Access · Authorised JKR Personnel Only</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex items-center justify-center bg-sand p-8 sm:p-12">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-ink">
            <LockKeyhole size={14} />
            Secure Staff Authentication
          </p>

          <h2 className="text-3xl font-bold text-foreground">
            {t('Welcome Back', 'Selamat Kembali')}
          </h2>
          <p className="text-xs text-muted-foreground pb-2">
            {t('Sign in to access the JKR road hazard command center.', 'Log masuk untuk mengakses pusat kawalan bahaya jalan JKR.')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-foreground">Staff Email</label>
            <input
              required
              type="email"
              defaultValue="ahmad.faizal@jkr.gov.my"
              className="mt-1.5 w-full rounded-md border border-border bg-white p-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground">Password</label>
            <input
              required
              type="password"
              defaultValue="password123"
              className="mt-1.5 w-full rounded-md border border-border bg-white p-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground">Demonstration Role (RBAC)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="mt-1.5 w-full rounded-md border border-border bg-white p-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="JKR Officer">JKR Officer (Review & Resolve)</option>
              <option value="Viewer">Viewer (Read-Only)</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setBm(!bm)}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              {bm ? 'English' : 'Bahasa Melayu'}
            </button>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors cursor-pointer shadow-sm pt-3 mt-4"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight size={15} />
          </button>

          <p className="pt-4 text-center text-[10px] text-muted-foreground">
            Jabatan Kerja Raya Malaysia · Prototype Authentication
          </p>
        </form>
      </div>
    </div>
  )
}
