import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileNavigation from './MobileNavigation'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNavigation />
    </div>
  )
}
