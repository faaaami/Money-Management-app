import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/navigation'

export default function MobileNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-primary-700' : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-primary-100' : 'group-hover:bg-slate-100'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                {shortLabel}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
