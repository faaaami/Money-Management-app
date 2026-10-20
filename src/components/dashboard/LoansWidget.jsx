import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ChevronRight, HandCoins } from 'lucide-react'
import { useLoans } from '../../hooks/useLoans'
import { formatCurrency } from '../../utils/format'
import {
  describeDue,
  getLoanProgress,
  getLoanStatus,
  getLoanSummary,
  sortLoans,
} from '../../utils/loans'
import Card from '../common/Card'
import { PersonAvatar } from '../loans/LoanCard'

export default function LoansWidget({ currency, onAdd }) {
  const { loans } = useLoans()
  const summary = getLoanSummary(loans)
  const open = sortLoans(loans.filter((l) => getLoanStatus(l).status !== 'settled')).slice(0, 3)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <HandCoins className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-slate-900">Lend & Borrow</h2>
          {summary.overdue > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              {summary.overdue} overdue
            </span>
          )}
        </div>
        <Link
          to="/loans"
          className="flex items-center text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
        >
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 sm:px-5">
        <div className="rounded-xl bg-emerald-50 px-3.5 py-3">
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-700">
            <ArrowUpRight className="size-3.5" /> To receive
          </p>
          <p className="mt-1 truncate text-lg font-bold tabular-nums text-emerald-700">
            {formatCurrency(summary.toReceive, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3.5 py-3">
          <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
            <ArrowDownLeft className="size-3.5" /> To pay
          </p>
          <p className="mt-1 truncate text-lg font-bold tabular-nums text-amber-700">
            {formatCurrency(summary.toPay, currency)}
          </p>
        </div>
      </div>

      {open.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
          {open.map((loan) => {
            const { remaining } = getLoanProgress(loan)
            const { overdue } = getLoanStatus(loan)
            const isLent = loan.direction === 'lent'
            return (
              <li key={loan.id}>
                <Link
                  to="/loans"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5"
                >
                  <PersonAvatar name={loan.person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{loan.person}</p>
                    <p className={`truncate text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                      {loan.dueDate ? describeDue(loan.dueDate) : isLent ? 'Owes you' : 'You owe'}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      isLent ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isLent ? '+' : '-'}
                    {formatCurrency(remaining, currency)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="px-4 pb-5 pt-4 text-center sm:px-5">
          <p className="text-sm text-slate-500">
            {loans.length ? 'Everyone is settled up 🎉' : 'Lent or borrowed money? Keep track here.'}
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            + Add a record
          </button>
        </div>
      )}
    </Card>
  )
}
