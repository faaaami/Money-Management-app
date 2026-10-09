import { NavLink } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { APP_NAME } from '../../constants'
import { useSettings } from '../../hooks/useSettings'

export default function Header() {
  const { settings } = useSettings()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <NavLink to="/" className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          ₹
        </span>
        <span className="text-base font-semibold text-slate-900">{APP_NAME}</span>
      </NavLink>

      <NavLink
        to="/settings"
        className="flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-100 sm:pr-3"
        aria-label="Open settings"
      >
        <span className="hidden text-sm font-medium text-slate-600 sm:block">
          {settings.name}
        </span>
        <span className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <UserRound className="size-4" />
        </span>
      </NavLink>
    </header>
  )
}
