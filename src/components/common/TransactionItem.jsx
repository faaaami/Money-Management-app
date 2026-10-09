import { Share2 } from 'lucide-react'
import { getCategoryMeta } from '../../constants'
import { useSettings } from '../../hooks/useSettings'
import { formatFriendlyDateTime } from '../../utils/date'
import { formatCurrency } from '../../utils/format'

export default function TransactionItem({ transaction, showDate = true, onShare }) {
  const { settings } = useSettings()
  const meta = getCategoryMeta(transaction.category, transaction.type)
  const Icon = meta.icon
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {transaction.category}
        </p>
        <p className="truncate text-xs text-slate-500">
          {transaction.note ? `${transaction.note} · ` : ''}
          {showDate ? formatFriendlyDateTime(transaction.date, transaction.time) : ''}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount, settings.currency)}
      </p>
      {onShare && (
        <button
          type="button"
          onClick={() => onShare(transaction)}
          aria-label={`Share ${transaction.category} transaction`}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Share2 className="size-4" />
        </button>
      )}
    </div>
  )
}
