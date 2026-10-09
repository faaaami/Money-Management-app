import { formatMonthLabel, getDateRange, monthKey } from './date'

function compareByDateDesc(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  const timeA = a.time ?? '00:00'
  const timeB = b.time ?? '00:00'
  if (timeA !== timeB) return timeA < timeB ? 1 : -1
  return a.createdAt < b.createdAt ? 1 : -1
}

export function getTotals(transactions) {
  let income = 0
  let expenses = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expenses += t.amount
  }
  return { income, expenses, remaining: income - expenses }
}

export function getCategoryTotals(transactions, type = 'expense') {
  const totals = new Map()
  for (const t of transactions) {
    if (t.type !== type) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function getRecentTransactions(transactions, limit = 5) {
  return [...transactions].sort(compareByDateDesc).slice(0, limit)
}

export function getSortedTransactions(transactions) {
  return [...transactions].sort(compareByDateDesc)
}

export function getMonthlyHistory(transactions, limit = 6) {
  const groups = new Map()
  for (const t of transactions) {
    const key = monthKey(t.date)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(t)
  }
  return [...groups.entries()]
    .map(([key, list]) => {
      const { income, expenses, remaining } = getTotals(list)
      return { key, label: formatMonthLabel(key), income, expenses, net: remaining }
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1))
    .slice(0, limit)
}

export function filterTransactions(
  transactions,
  { type = 'all', category = 'all', datePreset = 'all', from = '', to = '' } = {},
) {
  const range =
    datePreset === 'custom'
      ? { from: from || null, to: to || null }
      : getDateRange(datePreset)

  return transactions.filter((t) => {
    if (type !== 'all' && t.type !== type) return false
    if (category !== 'all' && t.category !== category) return false
    if (range) {
      if (range.from && t.date < range.from) return false
      if (range.to && t.date > range.to) return false
    }
    return true
  })
}
