import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency } from '../../utils/format'

export default function CategoryBreakdown({ data, currency }) {
  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <ul className="space-y-3.5">
      {data.map((item) => {
        const percent = total > 0 ? Math.round((item.total / total) * 100) : 0
        return (
          <li key={item.category}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-slate-700">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[item.category] ?? '#64748b',
                  }}
                />
                <span className="truncate">{item.category}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-slate-900">
                {formatCurrency(item.total, currency)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: CATEGORY_COLORS[item.category] ?? '#64748b',
                  }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-400">
                {percent}%
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
