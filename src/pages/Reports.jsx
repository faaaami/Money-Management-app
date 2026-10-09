import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, ReceiptText, Share2 } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import { Field, Select } from '../components/common/FormControls'
import StatCard from '../components/common/StatCard'
import CategoryBreakdown from '../components/reports/CategoryBreakdown'
import CategoryDonut from '../components/reports/CategoryDonut'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { useTransactions } from '../hooks/useTransactions'
import { currentMonthKey, formatMonthLabel, monthKey } from '../utils/date'
import { formatCurrency } from '../utils/format'
import {
  getCategoryTotals,
  getMonthlyHistory,
  getTotals,
} from '../utils/finance'
import { buildReportSummary, shareText } from '../utils/share'

function compactCurrency(value) {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`
  return String(value)
}

export default function Reports() {
  const { transactions } = useTransactions()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const monthKeys = useMemo(() => {
    const keys = new Set(transactions.map((t) => monthKey(t.date)))
    keys.add(currentMonthKey())
    return [...keys].sort().reverse()
  }, [transactions])

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === selectedMonth),
    [transactions, selectedMonth],
  )

  const totals = getTotals(monthTransactions)
  const categoryTotals = getCategoryTotals(monthTransactions)
  const history = getMonthlyHistory(transactions, 6)
  const chartData = [...history].reverse().map((m) => ({
    label: m.label,
    income: m.income,
    expenses: m.expenses,
  }))

  const hasData = transactions.length > 0

  const handleShare = async () => {
    const status = await shareText(
      buildReportSummary({
        monthLabel: formatMonthLabel(selectedMonth),
        totals,
        categoryTotals,
        currencyCode: settings.currency,
      }),
    )
    if (status === 'copied') showToast('Copied to clipboard')
    else if (status === 'failed') showToast('Could not share the summary')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">A simple overview of your money</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Field label="Month" htmlFor="report-month">
              <Select
                id="report-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthKeys.map((key) => (
                  <option key={key} value={key}>
                    {formatMonthLabel(key)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            onClick={handleShare}
            disabled={!hasData}
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Share Summary</span>
            <span className="sm:hidden">Share</span>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Monthly Summary
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            icon={BarChart3}
            label="Total Income"
            value={formatCurrency(totals.income, settings.currency)}
            tone="income"
          />
          <StatCard
            icon={ReceiptText}
            label="Total Expenses"
            value={formatCurrency(totals.expenses, settings.currency)}
            tone="expense"
          />
          <StatCard
            icon={BarChart3}
            label="Net Balance"
            value={formatCurrency(totals.remaining, settings.currency)}
          />
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Income vs Expenses</h2>
          <p className="mt-0.5 text-sm text-slate-500">Last {history.length || 0} months</p>
        </div>
        {hasData ? (
          <>
            <div className="mb-3 flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary-600" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-red-500" />
                Expenses
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={compactCurrency}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value, name) => [
                      formatCurrency(value, settings.currency),
                      name === 'income' ? 'Income' : 'Expenses',
                    ]}
                  />
                  <Bar
                    dataKey="income"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No data to report"
            description="Add transactions to see your income and expenses over time."
          />
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Spending by Category</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Where your money went this month
          </p>
        </div>
        {categoryTotals.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryDonut data={categoryTotals} currency={settings.currency} />
            <CategoryBreakdown data={categoryTotals} currency={settings.currency} />
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No spending in this month"
            description="Select another month or add expenses to see the breakdown."
          />
        )}
      </Card>

      {history.length >= 2 && (
        <Card className="overflow-hidden">
          <div className="px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
            <h2 className="text-base font-semibold text-slate-900">Monthly History</h2>
            <p className="mt-0.5 text-sm text-slate-500">Your last {history.length} months</p>
          </div>

          <div className="hidden md:block">
            <table className="mt-2 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-right">Income</th>
                  <th className="px-5 py-3 text-right">Expenses</th>
                  <th className="px-5 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((m) => (
                  <tr key={m.key}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{m.label}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-income">
                      {formatCurrency(m.income, settings.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-expense">
                      {formatCurrency(m.expenses, settings.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                      {formatCurrency(m.net, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-2 divide-y divide-slate-100 md:hidden">
            {history.map((m) => (
              <li key={m.key} className="px-4 py-3.5 sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{m.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatCurrency(m.net, settings.currency)}
                  </span>
                </div>
                <div className="mt-1 flex gap-4 text-xs text-slate-500">
                  <span className="tabular-nums text-income">
                    +{formatCurrency(m.income, settings.currency)}
                  </span>
                  <span className="tabular-nums text-expense">
                    -{formatCurrency(m.expenses, settings.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
