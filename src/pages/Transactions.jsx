import { useMemo, useState } from 'react'
import { Pencil, Plus, ReceiptText, Share2, Trash2, X } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { Field, Input, Select } from '../components/common/FormControls'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionForm from '../components/transactions/TransactionForm'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { useTransactions } from '../hooks/useTransactions'
import { formatRelativeDate, formatTime } from '../utils/date'
import { formatCurrency } from '../utils/format'
import {
  filterTransactions,
  getSortedTransactions,
} from '../utils/finance'
import { buildTransactionSummary, shareText } from '../utils/share'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
]

const DATE_FILTERS = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

const ALL_CATEGORIES = [
  ...new Set(
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => c.value),
  ),
]

const EMPTY_FILTERS = {
  type: 'all',
  category: 'all',
  datePreset: 'all',
  from: '',
  to: '',
}

export default function Transactions() {
  const { transactions, deleteTransaction } = useTransactions()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setFilter = (name, value) =>
    setFilters((current) => ({ ...current, [name]: value }))

  const filtered = useMemo(
    () => getSortedTransactions(filterTransactions(transactions, filters)),
    [transactions, filters],
  )

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'type' || key === 'category' || key === 'datePreset') {
      return value !== 'all'
    }
    return value !== ''
  })

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (transaction) => {
    setEditing(transaction)
    setFormOpen(true)
  }

  const handleDelete = () => {
    deleteTransaction(deleteTarget.id)
    setDeleteTarget(null)
    showToast('Transaction deleted')
  }

  const handleShare = async (transaction) => {
    const status = await shareText(
      buildTransactionSummary(transaction, settings.currency),
    )
    if (status === 'copied') showToast('Copied to clipboard')
    else if (status === 'failed') showToast('Could not share this transaction')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {transactions.length}{' '}
            {transactions.length === 1 ? 'transaction' : 'transactions'} recorded
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Add Transaction
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1">
            {TYPE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter('type', value)}
                aria-pressed={filters.type === value}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  filters.type === value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-w-40 flex-1 sm:max-w-56 sm:flex-none">
            <Field label="Category" htmlFor="category-filter">
              <Select
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value)}
              >
                <option value="all">All categories</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {hasFilters && (
            <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              <X className="size-4" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-slate-500">Date</span>
          {DATE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter('datePreset', value)}
              aria-pressed={filters.datePreset === value}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filters.datePreset === value
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filters.datePreset === 'custom' && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44">
              <Field label="From" htmlFor="date-from">
                <Input
                  id="date-from"
                  type="date"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(e) => setFilter('from', e.target.value)}
                />
              </Field>
            </div>
            <div className="w-44">
              <Field label="To" htmlFor="date-to">
                <Input
                  id="date-to"
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => setFilter('to', e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="No transactions yet"
            description="Start tracking your money by adding your first transaction."
            action={
              <Button onClick={handleAdd}>
                <Plus className="size-4" />
                Add Transaction
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="No matching transactions"
            description="Try changing the filters to find what you're looking for."
            action={
              hasFilters && (
                <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear Filters
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-card border border-slate-200 bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">
                        {formatRelativeDate(t.date)}
                      </div>
                      <div className="text-xs text-slate-400">{formatTime(t.time)}</div>
                    </td>
                    <td className="max-w-56 px-5 py-3.5">
                      <p className="truncate font-medium text-slate-900">
                        {t.note || t.category}
                      </p>
                      {t.note && (
                        <p className="truncate text-xs text-slate-400">{t.category}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {t.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums ${
                        t.type === 'income' ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount, settings.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleShare(t)}
                          aria-label={`Share ${t.category} transaction`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Share2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(t)}
                          aria-label={`Edit ${t.category} transaction`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(t)}
                          aria-label={`Delete ${t.category} transaction`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onShare={handleShare}
              />
            ))}
          </div>
        </>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        transaction={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete transaction?"
        description={`This will permanently delete the ${
          deleteTarget ? `${deleteTarget.category} transaction` : 'transaction'
        } of ${deleteTarget ? formatCurrency(deleteTarget.amount, settings.currency) : ''}. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
