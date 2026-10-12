import React, { useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
  Navigate,
} from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CaseProvider, useCases } from './context/CaseContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Toast } from './components/common/Toast'

// Pages
import { DashboardPage } from './pages/DashboardPage'
import { CasesPage } from './pages/CasesPage'
import { MapViewPage } from './pages/MapViewPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ReportsPage } from './pages/ReportsPage'
import { StaffPage } from './pages/StaffPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signedIn } = useAuth()
  const { toast, setToast } = useCases()
  const location = useLocation()

  if (!signedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[232px] flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />

          <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-5 text-[10px] text-muted-foreground">
            <span>
              © 2026 Jabatan Kerja Raya Malaysia · Road Hazard Management System
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={13} className="text-teal" />
              UTP Codefest 2026 Prototype · Powered by Gemini 2.5 Flash & Supabase
            </span>
          </footer>
        </main>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'cases/:id', element: <CasesPage /> },
      { path: 'map', element: <MapViewPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CaseProvider>
          <RouterProvider router={router} />
        </CaseProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
