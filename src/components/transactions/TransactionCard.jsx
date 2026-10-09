import { Pencil, Share2, Trash2 } from 'lucide-react'
import Card from '../common/Card'
import TransactionItem from '../common/TransactionItem'
import { formatDate } from '../../utils/date'

export default function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onShare,
}) {
  return (
    <Card className="p-4">
      <TransactionItem transaction={transaction} />
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">{formatDate(transaction.date)}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onShare(transaction)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>
    </Card>
  )
}
