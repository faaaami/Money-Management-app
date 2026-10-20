import { useState } from 'react'
import {
  BellRing,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { formatDate } from '../../utils/date'
import { formatCurrency } from '../../utils/format'
import {
  describeDue,
  getAvatarColor,
  getInitials,
  getLoanProgress,
  getLoanStatus,
} from '../../utils/loans'
import Card from '../common/Card'

const STATUS_CHIPS = {
  pending: { label: 'Not returned', className: 'bg-slate-100 text-slate-600' },
  partial: { label: 'Partially returned', className: 'bg-sky-50 text-sky-700' },
  settled: { label: 'Returned', className: 'bg-emerald-50 text-emerald-700' },
}

export function PersonAvatar({ name, size = 'md' }) {
  const color = getAvatarColor(name)
  const sizes = { sm: 'size-8 text-xs', md: 'size-11 text-sm' }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]}`}
      style={{ backgroundColor: `${color}1f`, color }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

function ActionButton({ icon: Icon, children, tone = 'default', ...props }) {
  const tones = {
    default: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    danger: 'text-slate-400 hover:bg-red-50 hover:text-red-600',
  }
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${tones[tone]}`}
      {...props}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  )
}

export default function LoanCard({
  loan,
  onPay,
  onSettle,
  onReopen,
  onRemind,
  onEdit,
  onDelete,
  onDeletePayment,
}) {
  const { settings } = useSettings()
  const [showHistory, setShowHistory] = useState(false)
  const { paid, remaining, percent } = getLoanProgress(loan)
  const { status, overdue } = getLoanStatus(loan)
  const isLent = loan.direction === 'lent'
  const settled = status === 'settled'
  const chip = STATUS_CHIPS[status]
  const money = (value) => formatCurrency(value, settings.currency)

  return (
    <Card
      className={`animate-rise overflow-hidden transition-shadow hover:shadow-md ${
        overdue ? 'ring-1 ring-red-200' : ''
      }`}
    >
      <div className={`p-4 sm:p-5 ${settled ? 'opacity-70' : ''}`}>
        <div className="flex items-start gap-3">
          <PersonAvatar name={loan.person} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-slate-900">{loan.person}</p>
            <p className="truncate text-xs text-slate-500">
              {isLent ? 'You lent' : 'You borrowed'} {money(loan.amount)} · {formatDate(loan.date)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`text-lg font-bold tabular-nums ${
                settled ? 'text-slate-400 line-through' : isLent ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {money(settled ? loan.amount : remaining)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {settled ? 'Settled' : isLent ? 'Owes you' : 'You owe'}
            </p>
          </div>
        </div>

        {loan.note && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{loan.note}</p>
        )}

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                settled ? 'bg-emerald-500' : isLent ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">
              {money(paid)} returned
            </span>
            <span className="tabular-nums">{percent}%</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${chip.className}`}>
            {settled && <CircleCheck className="size-3.5" />}
            {chip.label}
          </span>
          {loan.dueDate && !settled && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                overdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <CalendarClock className="size-3.5" />
              {describeDue(loan.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 bg-slate-50/60 px-3 py-2 sm:px-4">
        {settled ? (
          <ActionButton icon={Undo2} onClick={() => onReopen(loan)}>
            Mark not returned
          </ActionButton>
        ) : (
          <>
            <ActionButton icon={CircleCheck} tone="primary" onClick={() => onSettle(loan)}>
              {isLent ? 'Got it back' : 'Paid back'}
            </ActionButton>
            <ActionButton icon={Plus} onClick={() => onPay(loan)}>
              Partial
            </ActionButton>
            <ActionButton icon={BellRing} onClick={() => onRemind(loan)}>
              {isLent ? 'Remind' : 'Message'}
            </ActionButton>
          </>
        )}
        <div className="ml-auto flex items-center">
          {loan.payments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              aria-label="Show repayment history"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
            >
              {loan.payments.length}
              <ChevronDown className={`size-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(loan)}
            aria-label={`Edit record for ${loan.person}`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(loan)}
            aria-label={`Delete record for ${loan.person}`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {showHistory && loan.payments.length > 0 && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-white">
          {[...loan.payments]
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm sm:px-5">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium tabular-nums text-slate-800">{money(p.amount)}</p>
                  <p className="truncate text-xs text-slate-400">
                    {formatDate(p.date)}
                    {p.note ? ` · ${p.note}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeletePayment(loan, p)}
                  aria-label="Remove this repayment"
                  className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
        </ul>
      )}
    </Card>
  )
}
