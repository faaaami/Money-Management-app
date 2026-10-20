import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/navigation'
import { useLoans } from '../../hooks/useLoans'
import { getLoanSummary } from '../../utils/loans'

export default function Sidebar() {
  const { loans } = useLoans()
  const { overdue } = getLoanSummary(loans)

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white/60 lg:block">
      <nav className="sticky top-16 space-y-1 p-3" aria-label="Main navigation">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-linear-to-r from-primary-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon className="size-5" />
            <span className="flex-1">{label}</span>
            {to === '/loans' && overdue > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                {overdue}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
