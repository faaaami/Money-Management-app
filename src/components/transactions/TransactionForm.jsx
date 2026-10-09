import { useState } from 'react'
import { getCategoriesFor } from '../../constants'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { useTransactions } from '../../hooks/useTransactions'
import { toLocalISODate, toLocalTimeString } from '../../utils/date'
import { getCurrency } from '../../utils/format'
import Button from '../common/Button'
import { Field, Input, Select } from '../common/FormControls'
import Modal from '../common/Modal'

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  category: '',
  date: '',
  time: '',
  note: '',
}

function validate(form) {
  const errors = {}
  const amount = Number(form.amount)
  if (!form.amount.trim()) errors.amount = 'Amount is required'
  else if (!Number.isFinite(amount) || amount <= 0)
    errors.amount = 'Enter an amount greater than 0'
  if (!form.category) errors.category = 'Choose a category'
  if (!form.date) errors.date = 'Choose a date'
  if (!form.time) errors.time = 'Choose a time'
  return errors
}

function FormContent({ transaction, initialType, onClose }) {
  const { addTransaction, updateTransaction } = useTransactions()
  const { showToast } = useToast()
  const { settings } = useSettings()
  const [form, setForm] = useState(() =>
    transaction
      ? {
          type: transaction.type,
          amount: String(transaction.amount),
          category: transaction.category,
          date: transaction.date,
          time: transaction.time,
          note: transaction.note,
        }
      : {
          ...EMPTY_FORM,
          type: initialType,
          date: toLocalISODate(),
          time: toLocalTimeString(),
        },
  )
  const [errors, setErrors] = useState({})

  const categories = getCategoriesFor(form.type)
  const symbol = getCurrency(settings.currency).symbol

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleTypeChange = (type) => {
    if (type === form.type) return
    setForm((current) => ({
      ...current,
      type,
      category: getCategoriesFor(type).some((c) => c.value === current.category)
        ? current.category
        : '',
    }))
    setErrors((current) => ({ ...current, category: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const data = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      time: form.time,
      note: form.note.trim(),
    }

    if (transaction) {
      updateTransaction(transaction.id, data)
      showToast('Transaction updated')
    } else {
      addTransaction(data)
      showToast(data.type === 'income' ? 'Income added' : 'Expense added')
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Transaction Type
        </span>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {['expense', 'income'].map((type) => {
            const active = form.type === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                aria-pressed={active}
                className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                  active
                    ? `bg-white shadow-sm ${type === 'income' ? 'text-income' : 'text-expense'}`
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      <Field label="Amount" htmlFor="amount" error={errors.amount}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-slate-400">
            {symbol}
          </span>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            autoComplete="off"
            error={errors.amount}
            value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
            className="pl-8 text-lg font-semibold"
          />
        </div>
      </Field>

      <Field label="Category" htmlFor="category" error={errors.category}>
        <Select
          id="category"
          name="category"
          error={errors.category}
          value={form.category}
          onChange={(e) => setField('category', e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Date" htmlFor="date" error={errors.date}>
        <Input
          id="date"
          name="date"
          type="date"
          error={errors.date}
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
        />
      </Field>

      <Field label="Time" htmlFor="time" error={errors.time}>
        <Input
          id="time"
          name="time"
          type="time"
          error={errors.time}
          value={form.time}
          onChange={(e) => setField('time', e.target.value)}
        />
      </Field>

      <Field label="Note" htmlFor="note" hint="Optional">
        <Input
          id="note"
          name="note"
          type="text"
          placeholder="e.g. Vegetables"
          maxLength={80}
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
        />
      </Field>

      <div className="pt-1">
        <Button type="submit" size="lg" className="w-full">
          {transaction ? 'Save Changes' : 'Save Transaction'}
        </Button>
      </div>
    </form>
  )
}

export default function TransactionForm({
  open,
  onClose,
  transaction = null,
  initialType = 'expense',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      description={
        transaction ? 'Update the details below.' : 'It only takes a few seconds.'
      }
    >
      <FormContent
        key={transaction?.id ?? 'new'}
        transaction={transaction}
        initialType={initialType}
        onClose={onClose}
      />
    </Modal>
  )
}
