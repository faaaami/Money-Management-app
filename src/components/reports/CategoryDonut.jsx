import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency } from '../../utils/format'

export default function CategoryDonut({ data, currency, height = 220 }) {
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    color: CATEGORY_COLORS[item.category] ?? '#64748b',
  }))

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-slate-400">Total</span>
        <span className="text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  )
}
