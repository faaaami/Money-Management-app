import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AppShell from '../components/layout/AppShell'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Reports = lazy(() => import('../pages/Reports'))
const Settings = lazy(() => import('../pages/Settings'))
const Transactions = lazy(() => import('../pages/Transactions'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-28 text-slate-400">
      <Loader2 className="size-6 animate-spin" aria-label="Loading" />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          element={
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
