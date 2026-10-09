import { formatDateFull, formatTime } from './date'
import { formatCurrency } from './format'

export function buildTransactionSummary(transaction, currencyCode) {
  const title = transaction.type === 'income' ? 'Income' : 'Expense'
  const lines = [
    title,
    '',
    transaction.category,
    ...(transaction.note ? [transaction.note] : []),
    '',
    `Amount: ${formatCurrency(transaction.amount, currencyCode)}`,
    `Date: ${formatDateFull(transaction.date)}`,
    `Time: ${formatTime(transaction.time)}`,
  ]
  return lines.join('\n')
}

export function buildReportSummary({ monthLabel, totals, categoryTotals, currencyCode }) {
  const lines = [
    `Money Summary - ${monthLabel}`,
    '',
    `Total Income: ${formatCurrency(totals.income, currencyCode)}`,
    `Total Expenses: ${formatCurrency(totals.expenses, currencyCode)}`,
    `Net Balance: ${formatCurrency(totals.remaining, currencyCode)}`,
  ]
  if (categoryTotals.length > 0) {
    lines.push('', 'Spending by Category:')
    for (const item of categoryTotals) {
      lines.push(`${item.category}: ${formatCurrency(item.total, currencyCode)}`)
    }
  }
  return lines.join('\n')
}

export async function shareText(text) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'aborted'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
