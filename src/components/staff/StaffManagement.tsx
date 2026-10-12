import React, { useState } from 'react'
import { Plus, X, Users, Shield } from 'lucide-react'
import { Panel, Heading } from '../common/Panel'
import { useAuth } from '../../context/AuthContext'
import { useCases } from '../../context/CaseContext'
import { useLanguage } from '../../context/LanguageContext'
import type { StaffRole } from '../../types'

export function StaffManagement() {
  const { role, staffList, addStaff, toggleStaffActive } = useAuth()
  const { setToast } = useCases()
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Panel>
        <Heading
          title={t('JKR Staff Accounts & RBAC', 'Akaun Staf JKR & Kawalan Akses')}
          subtitle={t('Manage administrative and officer privileges', 'Urus kebenaran pentadbiran dan pegawai')}
          action={
            role === 'Admin' ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                {t('Add Staff', 'Tambah Staf')}
              </button>
            ) : null
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffList.map((person, index) => (
                <tr key={person.email} className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-semibold text-foreground flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                      {person.name.slice(0, 2).toUpperCase()}
                    </span>
                    {person.name}
                  </td>
                  <td className="p-4 text-muted-foreground">{person.email}</td>
                  <td className="p-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-800">
                      {person.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        person.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {person.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    {index !== 0 && role === 'Admin' ? (
                      <button
                        onClick={() => {
                          toggleStaffActive(person.email)
                          setToast(`Account ${person.email} status toggled`)
                        }}
                        className={`text-xs font-semibold hover:underline cursor-pointer ${
                          person.active ? 'text-red-600' : 'text-primary'
                        }`}
                      >
                        {person.active ? 'Disable' : 'Enable'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 border-t border-border p-5 md:grid-cols-3 bg-slate-50/30">
          {[
            ['Admin', 'Full administrative authority: manage staff accounts, roles, and all hazard cases.'],
            ['JKR Officer', 'Operational privilege: review AI severity scores, dispatch road crews, and mark cases resolved.'],
            ['Viewer', 'Read-only access: inspect reports, analytics, and district maps without modification rights.'],
          ].map(([roleTitle, roleDesc]) => (
            <div key={roleTitle} className="rounded-lg border border-border bg-white p-3.5 shadow-2xs">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield size={13} className="text-primary" />
                {roleTitle}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{roleDesc}</p>
            </div>
          ))}
        </div>
      </Panel>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-bold text-foreground">Create Staff Account</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-foreground cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form
              className="space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const email = String(data.get('email'))
                if (staffList.some((s) => s.email === email)) {
                  setToast('Account with this email already exists')
                  return
                }
                addStaff({
                  name: String(data.get('name')),
                  email,
                  role: String(data.get('role')) as StaffRole,
                  active: true,
                })
                setModalOpen(false)
                setToast('New JKR staff account created successfully')
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-foreground">Full Name</label>
                <input
                  required
                  name="name"
                  placeholder="e.g. Ir. Khairul Azman"
                  className="mt-1.5 w-full rounded-md border border-border p-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Staff Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="name@jkr.gov.my"
                  className="mt-1.5 w-full rounded-md border border-border p-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Access Role</label>
                <select
                  name="role"
                  className="mt-1.5 w-full rounded-md border border-border p-2 text-xs text-foreground outline-none focus:border-primary bg-white"
                >
                  <option value="JKR Officer">JKR Officer</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-border px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

