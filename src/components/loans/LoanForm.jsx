import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useLoans } from '../../hooks/useLoans'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { toLocalISODate } from '../../utils/date'
import { amountPaddingClass, getCurrency } from '../../utils/format'
import Button from '../common/Button'
import { Field, Input } from '../common/FormControls'
import Modal from '../common/Modal'

const DIRECTIONS = [
  {
    value: 'lent',
    label: 'I lent money',
    hint: 'Someone owes you',
    icon: ArrowUpRight,
    active: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'borrowed',
    label: 'I borrowed',
    hint: 'You owe someone',
    icon: ArrowDownLeft,
    active: 'border-amber-500 bg-amber-50 text-amber-700',
  },
]

function validate(form) {
  const errors = {}
  const amount = Number(form.amount)
  if (!form.person.trim()) errors.person = 'Enter a name'
  if (!form.amount.trim()) errors.amount = 'Amount is required'
  else if (!Number.isFinite(amount) || amount <= 0)
    errors.amount = 'Enter an amount greater than 0'
  if (!form.date) errors.date = 'Choose a date'
  if (form.dueDate && form.date && form.dueDate < form.date)
    errors.dueDate = 'Must be after the loan date'
  return errors
}

function FormContent({ loan, initialDirection, onClose }) {
  const { loans, addLoan, updateLoan } = useLoans()
  const { settings } = useSettings()
  const { showToast } = useToast()
  const [form, setForm] = useState(() =>
    loan
      ? {
          direction: loan.direction,
          person: loan.person,
          amount: String(loan.amount),
          date: loan.date,
          dueDate: loan.dueDate,
          note: loan.note,
        }
      : {
          direction: initialDirection,
          person: '',
          amount: '',
          date: toLocalISODate(),
          dueDate: '',
          note: '',
        },
  )
  const [errors, setErrors] = useState({})
  const symbol = getCurrency(settings.currency).symbol

  const knownPeople = useMemo(
    () => [...new Set(loans.map((l) => l.person))].sort((a, b) => a.localeCompare(b)),
    [loans],
  )

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const data = {
      direction: form.direction,
      person: form.person.trim(),
      amount: Number(form.amount),
      date: form.date,
      dueDate: form.dueDate,
      note: form.note.trim(),
    }

    if (loan) {
      updateLoan(loan.id, data)
      showToast('Record updated')
    } else {
      addLoan(data)
      showToast(
        data.direction === 'lent'
          ? `Saved — ${data.person} owes you`
          : `Saved — you owe ${data.person}`,
      )
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {DIRECTIONS.map(({ value, label, hint, icon: Icon, active }) => {
          const selected = form.direction === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setField('direction', value)}
              aria-pressed={selected}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                selected
                  ? active
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon className="size-4" />
                {label}
              </span>
              <span className="text-xs opacity-75">{hint}</span>
            </button>
          )
        })}
      </div>

      <Field
        label={form.direction === 'lent' ? 'Who did you lend to?' : 'Who did you borrow from?'}
        htmlFor="loan-person"
        error={errors.person}
      >
        <Input
          id="loan-person"
          type="text"
          list="loan-people"
          placeholder="e.g. Rahul"
          maxLength={40}
          autoComplete="off"
          error={errors.person}
          value={form.person}
          onChange={(e) => setField('person', e.target.value)}
        />
        <datalist id="loan-people">
          {knownPeople.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </Field>

      <Field label="Amount" htmlFor="loan-amount" error={errors.amount}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-slate-400">
            {symbol}
          </span>
          <Input
            id="loan-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            autoComplete="off"
            error={errors.amount}
            value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
            className={`${amountPaddingClass(settings.currency)} text-lg font-semibold`}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="loan-date" error={errors.date}>
          <Input
            id="loan-date"
            type="date"
            error={errors.date}
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
          />
        </Field>
        <Field label="Due date" htmlFor="loan-due" error={errors.dueDate} hint="Optional">
          <Input
            id="loan-due"
            type="date"
            min={form.date || undefined}
            error={errors.dueDate}
            value={form.dueDate}
            onChange={(e) => setField('dueDate', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Note" htmlFor="loan-note" hint="Optional">
        <Input
          id="loan-note"
          type="text"
          placeholder="e.g. For phone repair"
          maxLength={80}
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
        />
      </Field>

      <div className="pt-1">
        <Button type="submit" size="lg" className="w-full">
          {loan ? 'Save Changes' : 'Save Record'}
        </Button>
      </div>
    </form>
  )
}

export default function LoanForm({ open, onClose, loan = null, initialDirection = 'lent' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={loan ? 'Edit Record' : 'Lend or Borrow'}
      description={loan ? 'Update the details below.' : 'Keep track of who owes whom.'}
    >
      <FormContent
        key={loan?.id ?? `new-${initialDirection}`}
        loan={loan}
        initialDirection={initialDirection}
        onClose={onClose}
      />
    </Modal>
  )
}
