import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Plus,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { Input } from '../components/common/FormControls'
import LoanCard, { PersonAvatar } from '../components/loans/LoanCard'
import LoanForm from '../components/loans/LoanForm'
import PaymentForm from '../components/loans/PaymentForm'
import { useLoans } from '../hooks/useLoans'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import {
  buildLoanReminder,
  getLoanStatus,
  getLoanSummary,
  getPeopleBalances,
  sortLoans,
} from '../utils/loans'
import { shareText } from '../utils/share'

const DIRECTION_TABS = [
  { value: 'all', label: 'All' },
  { value: 'lent', label: 'Lent' },
  { value: 'borrowed', label: 'Borrowed' },
]

const STATUS_TABS = [
  { value: 'open', label: 'Not returned' },
  { value: 'settled', label: 'Returned' },
  { value: 'all', label: 'Everything' },
]

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all sm:flex-none sm:px-4 ${
            value === option.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function Loans() {
  const { loans, deleteLoan, deletePayment, markSettled, reopenLoan, updateLoan } = useLoans()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [direction, setDirection] = useState('all')
  const [status, setStatus] = useState('open')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formDirection, setFormDirection] = useState('lent')
  const [editing, setEditing] = useState(null)
  const [paying, setPaying] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const money = (value) => formatCurrency(value, settings.currency)
  const summary = getLoanSummary(loans)
  const people = getPeopleBalances(loans)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortLoans(
      loans.filter((loan) => {
        if (direction !== 'all' && loan.direction !== direction) return false
        const settled = getLoanStatus(loan).status === 'settled'
        if (status === 'open' && settled) return false
        if (status === 'settled' && !settled) return false
        if (q && !loan.person.toLowerCase().includes(q) && !loan.note.toLowerCase().includes(q))
          return false
        return true
      }),
    )
  }, [loans, direction, status, query])

  const openNew = (dir) => {
    setEditing(null)
    setFormDirection(dir)
    setFormOpen(true)
  }

  const handleEdit = (loan) => {
    setEditing(loan)
    setFormOpen(true)
  }

  const restorePayments = (loan) => () => updateLoan(loan.id, { payments: loan.payments })

  const handleSettle = (loan) => {
    markSettled(loan.id)
    showToast(
      loan.direction === 'lent'
        ? `${loan.person} paid you back 🎉`
        : `Marked as paid to ${loan.person}`,
      { action: { label: 'Undo', onClick: restorePayments(loan) } },
    )
  }

  const handleReopen = (loan) => {
    reopenLoan(loan.id)
    showToast('Marked as not returned', {
      action: { label: 'Undo', onClick: restorePayments(loan) },
    })
  }

  const handleDeletePayment = (loan, payment) => {
    deletePayment(loan.id, payment.id)
    showToast('Repayment removed', {
      action: { label: 'Undo', onClick: restorePayments(loan) },
    })
  }

  const handleRemind = async (loan) => {
    const result = await shareText(buildLoanReminder(loan, settings.currency, settings.name))
    if (result === 'copied') showToast('Reminder copied — paste it in any chat')
    else if (result === 'failed') showToast('Could not share the reminder')
  }

  const handleDelete = () => {
    deleteLoan(deleteTarget.id)
    setDeleteTarget(null)
    showToast('Record deleted')
  }

  const selectPerson = (name) => {
    setQuery((current) => (current === name ? '' : name))
    setStatus('open')
    setDirection('all')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Lend & Borrow</h1>
          <p className="mt-1 text-sm text-slate-500">
            Never forget who owes you — or who you owe
          </p>
        </div>
        <Button onClick={() => openNew('lent')}>
          <Plus className="size-4" />
          New Record
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => openNew('lent')}
            className="group rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-300">
              <ArrowUpRight className="size-4" />
              You'll get back
            </span>
            <span className="mt-2 block truncate text-2xl font-bold tabular-nums sm:text-3xl">
              {money(summary.toReceive)}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-white/60 group-hover:text-white/80">
              <Plus className="size-3" /> I lent money
            </span>
          </button>
          <button
            type="button"
            onClick={() => openNew('borrowed')}
            className="group rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-300">
              <ArrowDownLeft className="size-4" />
              You need to pay
            </span>
            <span className="mt-2 block truncate text-2xl font-bold tabular-nums sm:text-3xl">
              {money(summary.toPay)}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-white/60 group-hover:text-white/80">
              <Plus className="size-3" /> I borrowed money
            </span>
          </button>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
          <span>
            Net position:{' '}
            <span
              className={`font-semibold tabular-nums ${
                summary.net >= 0 ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {summary.net >= 0 ? '+' : '-'}
              {money(Math.abs(summary.net))}
            </span>
          </span>
          <span>
            {summary.active} open {summary.active === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {summary.overdue > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">
              {summary.overdue} {summary.overdue === 1 ? 'record is' : 'records are'} overdue.
            </span>{' '}
            They're shown first below — send a friendly reminder with one tap.
          </p>
        </div>
      )}

      {people.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            People
          </h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {people.map((p) => {
              const active = query === p.person
              return (
                <button
                  key={p.person}
                  type="button"
                  onClick={() => selectPerson(p.person)}
                  aria-pressed={active}
                  className={`flex min-w-44 shrink-0 items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    active ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200'
                  }`}
                >
                  <PersonAvatar name={p.person} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {p.person}
                    </span>
                    <span
                      className={`block text-xs font-medium tabular-nums ${
                        p.balance >= 0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {p.balance >= 0 ? 'Owes you ' : 'You owe '}
                      {money(Math.abs(p.balance))}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {loans.length === 0 ? (
        <Card>
          <EmptyState
            icon={HandCoins}
            title="No lending records yet"
            description="Lent money to a friend or borrowed from family? Note it here and mark it when it comes back."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => openNew('lent')}>
                  <ArrowUpRight className="size-4" />I lent money
                </Button>
                <Button variant="secondary" onClick={() => openNew('borrowed')}>
                  <ArrowDownLeft className="size-4" />I borrowed
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Segmented label="Type" options={DIRECTION_TABS} value={direction} onChange={setDirection} />
            <Segmented label="Status" options={STATUS_TABS} value={status} onChange={setStatus} />
            <div className="relative lg:ml-auto lg:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="loan-search"
                type="search"
                placeholder="Search name or note"
                aria-label="Search records"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={HandCoins}
                title={status === 'open' && !query ? 'All settled up! 🎉' : 'Nothing matches'}
                description={
                  status === 'open' && !query
                    ? 'Nobody owes anything right now. Check "Returned" to see past records.'
                    : 'Try a different filter or search.'
                }
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onPay={setPaying}
                  onSettle={handleSettle}
                  onReopen={handleReopen}
                  onRemind={handleRemind}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onDeletePayment={handleDeletePayment}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <LoanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        loan={editing}
        initialDirection={formDirection}
      />

      <PaymentForm loan={paying} onClose={() => setPaying(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this record?"
        description={
          deleteTarget
            ? `This will permanently delete the ${money(deleteTarget.amount)} record with ${deleteTarget.person}, including its repayment history.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
