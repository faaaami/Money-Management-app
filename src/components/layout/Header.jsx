import { NavLink } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { APP_NAME } from '../../constants'
import { useSettings } from '../../hooks/useSettings'
import { getInitials } from '../../utils/loans'

export default function Header() {
  const { settings } = useSettings()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-lg sm:px-6">
      <NavLink to="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
          <Wallet className="size-5" />
        </span>
        <span className="text-base font-bold tracking-tight text-slate-900">{APP_NAME}</span>
      </NavLink>

      <NavLink
        to="/settings"
        className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100 sm:pr-3"
        aria-label="Open settings"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
          {getInitials(settings.name)}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:block">
          {settings.name}
        </span>
      </NavLink>
    </header>
  )
}
