import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Minus,
  Plus,
  ReceiptText,
} from 'lucide-react'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import TransactionItem from '../components/common/TransactionItem'
import BudgetCard from '../components/dashboard/BudgetCard'
import LoansWidget from '../components/dashboard/LoansWidget'
import LoanForm from '../components/loans/LoanForm'
import CategoryBreakdown from '../components/reports/CategoryBreakdown'
import CategoryDonut from '../components/reports/CategoryDonut'
import TransactionForm from '../components/transactions/TransactionForm'
import { useLoans } from '../hooks/useLoans'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { useTransactions } from '../hooks/useTransactions'
import { currentMonthKey, monthKey } from '../utils/date'
import { formatCurrency } from '../utils/format'
import { getLoanSummary } from '../utils/loans'
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
  const [loanFormOpen, setLoanFormOpen] = useState(false)

  const { loans } = useLoans()
  const totals = getTotals(transactions)
  const loanSummary = getLoanSummary(loans)
  // Money lent out has left your pocket until it's returned; borrowed money is in it until repaid.
  const balance = totals.remaining - loanSummary.toReceive + loanSummary.toPay
  const recent = getRecentTransactions(transactions, 5)
  const monthTransactions = transactions.filter(
    (t) => monthKey(t.date) === currentMonthKey(),
  )
  const monthTotals = getTotals(monthTransactions)
  const categoryTotals = getCategoryTotals(monthTransactions)
  const savingsRate =
    monthTotals.income > 0
      ? Math.round((monthTotals.remaining / monthTotals.income) * 100)
      : null

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
          Welcome, {settings.name} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {getGreeting()} — {transactions.length || loans.length
            ? "here's your money overview"
            : 'add your first income or expense to get started'}
        </p>
      </div>

      <div className="animate-rise relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 px-5 py-6 text-white shadow-xl shadow-emerald-700/20 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-emerald-50/80">Total Balance</p>
          <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
            {formatCurrency(balance, settings.currency)}
          </p>
          {(loanSummary.toReceive > 0 || loanSummary.toPay > 0) && (
            <p className="mt-1.5 text-xs text-emerald-50/80">
              Includes{' '}
              {loanSummary.toReceive > 0 && (
                <span className="font-semibold text-white">
                  -{formatCurrency(loanSummary.toReceive, settings.currency)} lent out
                </span>
              )}
              {loanSummary.toReceive > 0 && loanSummary.toPay > 0 && ' and '}
              {loanSummary.toPay > 0 && (
                <span className="font-semibold text-white">
                  +{formatCurrency(loanSummary.toPay, settings.currency)} borrowed
                </span>
              )}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur">
              <p className="flex items-center gap-1 text-xs text-emerald-50/80">
                <ArrowDownLeft className="size-3.5" /> Income this month
              </p>
              <p className="mt-0.5 truncate text-base font-semibold tabular-nums sm:text-lg">
                {formatCurrency(monthTotals.income, settings.currency)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur">
              <p className="flex items-center gap-1 text-xs text-emerald-50/80">
                <ArrowUpRight className="size-3.5" /> Spent this month
              </p>
              <p className="mt-0.5 truncate text-base font-semibold tabular-nums sm:text-lg">
                {formatCurrency(monthTotals.expenses, settings.currency)}
              </p>
            </div>
          </div>
          {savingsRate !== null && (
            <p className="mt-4 text-sm text-emerald-50/80">
              {savingsRate >= 0 ? (
                <>
                  You&apos;ve saved{' '}
                  <span className="font-semibold text-white">{savingsRate}%</span> of your
                  income this month
                </>
              ) : (
                <>You&apos;ve spent more than you earned this month</>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: 'Income',
            icon: Plus,
            onClick: () => openForm('income'),
            className: 'bg-emerald-50 text-emerald-700 ring-emerald-100 hover:bg-emerald-100',
          },
          {
            label: 'Expense',
            icon: Minus,
            onClick: () => openForm('expense'),
            className: 'bg-rose-50 text-rose-700 ring-rose-100 hover:bg-rose-100',
          },
          {
            label: 'Lend / Borrow',
            icon: HandCoins,
            onClick: () => setLoanFormOpen(true),
            className: 'bg-amber-50 text-amber-700 ring-amber-100 hover:bg-amber-100',
          },
        ].map(({ label, icon: Icon, onClick, className }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3.5 text-xs font-semibold ring-1 transition-all hover:-translate-y-0.5 active:scale-[0.98] sm:flex-row sm:gap-2 sm:text-sm ${className}`}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Icon className="size-4" />
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <BudgetCard
            budget={settings.monthlyBudget}
            spent={monthTotals.expenses}
            currency={settings.currency}
          />
          <LoansWidget currency={settings.currency} onAdd={() => setLoanFormOpen(true)} />
        </div>

        <Card className="self-start">
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
      </div>

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

      <LoanForm open={loanFormOpen} onClose={() => setLoanFormOpen(false)} />
    </div>
  )
}
