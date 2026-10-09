import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  PiggyBank,
  Plus,
  ReceiptText,
} from 'lucide-react'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import StatCard from '../components/common/StatCard'
import TransactionItem from '../components/common/TransactionItem'
import CategoryBreakdown from '../components/reports/CategoryBreakdown'
import CategoryDonut from '../components/reports/CategoryDonut'
import TransactionForm from '../components/transactions/TransactionForm'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { useTransactions } from '../hooks/useTransactions'
import { currentMonthKey, monthKey } from '../utils/date'
import { formatCurrency } from '../utils/format'
import { buildTransactionSummary, shareText } from '../utils/share'
import {
  getCategoryTotals,
  getRecentTransactions,
  getTotals,
} from '../utils/finance'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { transactions } = useTransactions()
  const { settings } = useSettings()
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState('expense')

  const totals = getTotals(transactions)
  const recent = getRecentTransactions(transactions, 5)
  const monthTransactions = transactions.filter(
    (t) => monthKey(t.date) === currentMonthKey(),
  )
  const categoryTotals = getCategoryTotals(monthTransactions)

  const openForm = (type) => {
    setFormType(type)
    setFormOpen(true)
  }

  const handleShare = async (transaction) => {
    const status = await shareText(
      buildTransactionSummary(transaction, settings.currency),
    )
    if (status === 'copied') showToast('Copied to clipboard')
    else if (status === 'failed') showToast('Could not share this transaction')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          {getGreeting()}, {settings.name} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s your money overview</p>
      </div>

      <div className="rounded-2xl bg-primary-600 px-5 py-6 text-white shadow-card sm:px-7 sm:py-7">
        <p className="text-sm font-medium text-primary-100">Total Balance</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
          {formatCurrency(totals.remaining, settings.currency)}
        </p>
        <p className="mt-3 text-sm text-primary-100">
          {formatCurrency(totals.income, settings.currency)} in ·{' '}
          {formatCurrency(totals.expenses, settings.currency)} out
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={ArrowDownLeft}
          label="Income"
          value={formatCurrency(totals.income, settings.currency)}
          tone="income"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Expenses"
          value={formatCurrency(totals.expenses, settings.currency)}
          tone="expense"
        />
        <StatCard
          icon={PiggyBank}
          label="Remaining"
          value={formatCurrency(totals.remaining, settings.currency)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => openForm('income')}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 sm:h-13 sm:text-base"
        >
          <Plus className="size-4" />
          Add Income
        </button>
        <button
          type="button"
          onClick={() => openForm('expense')}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white transition-colors hover:bg-primary-700 sm:h-13 sm:text-base"
        >
          <Minus className="size-4" />
          Add Expense
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <Link
            to="/transactions"
            className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
          >
            View all
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="mt-1 divide-y divide-slate-100">
            {recent.map((t) => (
              <li key={t.id}>
                <TransactionItem transaction={t} onShare={handleShare} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No transactions yet"
            description="Add your first income or expense to see it here."
          />
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Monthly Spending</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Expenses by category this month
          </p>
        </div>
        {categoryTotals.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryDonut
              data={categoryTotals}
              currency={settings.currency}
            />
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Spending Categories
              </p>
              <CategoryBreakdown
                data={categoryTotals}
                currency={settings.currency}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No spending this month"
            description="Expenses you add this month will appear here."
          />
        )}
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialType={formType}
      />
    </div>
  )
}
