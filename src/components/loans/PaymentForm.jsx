import { useState } from 'react'
import { useLoans } from '../../hooks/useLoans'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { toLocalISODate } from '../../utils/date'
import { amountPaddingClass, formatCurrency, getCurrency } from '../../utils/format'
import { getLoanProgress } from '../../utils/loans'
import Button from '../common/Button'
import { Field, Input } from '../common/FormControls'
import Modal from '../common/Modal'

function FormContent({ loan, onClose }) {
  const { addPayment } = useLoans()
  const { settings } = useSettings()
  const { showToast } = useToast()
  const { remaining } = getLoanProgress(loan)
  const [form, setForm] = useState({
    amount: String(remaining),
    date: toLocalISODate(),
    note: '',
  })
  const [errors, setErrors] = useState({})
  const symbol = getCurrency(settings.currency).symbol

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    const nextErrors = {}
    if (!form.amount.trim()) nextErrors.amount = 'Amount is required'
    else if (!Number.isFinite(amount) || amount <= 0)
      nextErrors.amount = 'Enter an amount greater than 0'
    else if (amount > remaining)
      nextErrors.amount = `Only ${formatCurrency(remaining, settings.currency)} is left`
    if (!form.date) nextErrors.date = 'Choose a date'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    addPayment(loan.id, { amount, date: form.date, note: form.note.trim() })
    showToast(amount >= remaining ? 'Fully settled 🎉' : 'Repayment recorded')
    onClose()
  }

  const quickAmounts = [0.25, 0.5, 1]
    .map((f) => Math.round(remaining * f * 100) / 100)
    .filter((v, i, list) => v > 0 && list.indexOf(v) === i)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {loan.direction === 'lent' ? (
          <>
            <span className="font-semibold text-slate-900">{loan.person}</span> still owes you{' '}
          </>
        ) : (
          <>
            You still owe <span className="font-semibold text-slate-900">{loan.person}</span>{' '}
          </>
        )}
        <span className="font-semibold tabular-nums text-slate-900">
          {formatCurrency(remaining, settings.currency)}
        </span>
      </div>

      <Field label="Amount repaid" htmlFor="payment-amount" error={errors.amount}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-slate-400">
            {symbol}
          </span>
          <Input
            id="payment-amount"
            type="number"
            inputMode="decimal"
            min="0"
            max={remaining}
            step="0.01"
            autoComplete="off"
            error={errors.amount}
            value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
            className={`${amountPaddingClass(settings.currency)} text-lg font-semibold`}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickAmounts.map((value, i) => (
            <button
              key={value}
              type="button"
              onClick={() => setField('amount', String(value))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-700"
            >
              {i === quickAmounts.length - 1 ? 'Full · ' : ''}
              {formatCurrency(value, settings.currency)}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Date" htmlFor="payment-date" error={errors.date}>
        <Input
          id="payment-date"
          type="date"
          min={loan.date}
          error={errors.date}
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
        />
      </Field>

      <Field label="Note" htmlFor="payment-note" hint="Optional">
        <Input
          id="payment-note"
          type="text"
          placeholder="e.g. Paid via UPI"
          maxLength={60}
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
        />
      </Field>

      <div className="pt-1">
        <Button type="submit" size="lg" className="w-full">
          Record Repayment
        </Button>
      </div>
    </form>
  )
}

export default function PaymentForm({ loan, onClose }) {
  return (
    <Modal
      open={loan !== null}
      onClose={onClose}
      title="Record Repayment"
      description="Log a full or partial payback."
    >
      {loan && <FormContent key={loan.id} loan={loan} onClose={onClose} />}
    </Modal>
  )
}
