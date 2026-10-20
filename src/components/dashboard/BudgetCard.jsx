import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import Card from '../common/Card'
import { formatCurrency } from '../../utils/format'

function daysLeftInMonth() {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return last - now.getDate() + 1
}

export default function BudgetCard({ budget, spent, currency }) {
  if (!budget) {
    return (
      <Card className="flex items-center gap-4 p-4 sm:p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Target className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Set a monthly budget</p>
          <p className="text-sm text-slate-500">Get warned before you overspend.</p>
        </div>
        <Link
          to="/settings"
          className="shrink-0 rounded-xl bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Set budget
        </Link>
      </Card>
    )
  }

  const percent = Math.round((spent / budget) * 100)
  const left = budget - spent
  const days = daysLeftInMonth()
  const tone =
    percent >= 100
      ? { bar: 'bg-red-500', text: 'text-red-600', label: 'Over budget' }
      : percent >= 80
        ? { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Almost there' }
        : { bar: 'bg-linear-to-r from-emerald-500 to-teal-500', text: 'text-emerald-600', label: 'On track' }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Target className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-slate-900">Monthly Budget</h2>
        </div>
        <span className={`text-xs font-semibold ${tone.text}`}>{tone.label}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tabular-nums text-slate-900">
          {formatCurrency(spent, currency)}
          <span className="ml-1 text-sm font-medium text-slate-400">
            / {formatCurrency(budget, currency)}
          </span>
        </p>
        <p className={`text-sm font-semibold tabular-nums ${tone.text}`}>{percent}%</p>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {left >= 0 ? (
          <>
            <span className="font-semibold text-slate-700">{formatCurrency(left, currency)}</span> left
            · about{' '}
            <span className="font-semibold text-slate-700">
              {formatCurrency(Math.floor(left / days), currency)}/day
            </span>{' '}
            for {days} {days === 1 ? 'day' : 'days'}
          </>
        ) : (
          <>
            You&apos;re{' '}
            <span className="font-semibold text-red-600">{formatCurrency(-left, currency)}</span> over
            this month&apos;s budget
          </>
        )}
      </p>
    </Card>
  )
}
