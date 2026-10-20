import { formatDateFull, parseISODate, toLocalISODate } from './date'
import { formatCurrency } from './format'

export function getLoanProgress(loan) {
  const paid = loan.payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, Math.round((loan.amount - paid) * 100) / 100)
  const percent = loan.amount > 0 ? Math.min(100, Math.round((paid / loan.amount) * 100)) : 0
  return { paid, remaining, percent }
}

/** 'settled' | 'partial' | 'pending', plus an overdue flag for open loans past their due date. */
export function getLoanStatus(loan, today = toLocalISODate()) {
  const { paid, remaining } = getLoanProgress(loan)
  const status = remaining <= 0 ? 'settled' : paid > 0 ? 'partial' : 'pending'
  const overdue = status !== 'settled' && Boolean(loan.dueDate) && loan.dueDate < today
  return { status, overdue }
}

export function getDaysUntil(dateStr) {
  const today = parseISODate(toLocalISODate())
  return Math.round((parseISODate(dateStr) - today) / 86400000)
}

export function describeDue(dateStr) {
  const days = getDaysUntil(dateStr)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return `Due in ${days} days`
  if (days === -1) return '1 day overdue'
  return `${-days} days overdue`
}

export function getLoanSummary(loans) {
  let toReceive = 0
  let toPay = 0
  let overdue = 0
  let active = 0
  for (const loan of loans) {
    const { remaining } = getLoanProgress(loan)
    if (remaining <= 0) continue
    active += 1
    if (loan.direction === 'lent') toReceive += remaining
    else toPay += remaining
    if (getLoanStatus(loan).overdue) overdue += 1
  }
  return { toReceive, toPay, net: toReceive - toPay, overdue, active }
}

/** Outstanding balance per person: positive means they owe you. */
export function getPeopleBalances(loans) {
  const people = new Map()
  for (const loan of loans) {
    const key = loan.person.trim().toLowerCase()
    const entry = people.get(key) ?? { person: loan.person.trim(), balance: 0, open: 0 }
    const { remaining } = getLoanProgress(loan)
    if (remaining > 0) {
      entry.balance += loan.direction === 'lent' ? remaining : -remaining
      entry.open += 1
    }
    people.set(key, entry)
  }
  return [...people.values()]
    .filter((p) => p.open > 0)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
}

export function sortLoans(loans) {
  const rank = (loan) => {
    const { status, overdue } = getLoanStatus(loan)
    if (overdue) return 0
    if (status !== 'settled') return 1
    return 2
  }
  return [...loans].sort((a, b) => {
    const diff = rank(a) - rank(b)
    if (diff !== 0) return diff
    if (rank(a) < 2 && (a.dueDate || b.dueDate)) {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
    }
    return a.date < b.date ? 1 : -1
  })
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = ['#059669', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#14b8a6', '#6366f1', '#d946ef']

export function getAvatarColor(name) {
  let hash = 0
  for (const char of name.trim().toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function buildLoanReminder(loan, currencyCode, senderName) {
  const { remaining, paid } = getLoanProgress(loan)
  const amount = formatCurrency(remaining, currencyCode)
  if (loan.direction === 'lent') {
    const lines = [
      `Hi ${loan.person}, just a friendly reminder about the ${formatCurrency(loan.amount, currencyCode)} I lent you on ${formatDateFull(loan.date)}${loan.note ? ` (${loan.note})` : ''}.`,
    ]
    if (paid > 0) lines.push(`You've already returned ${formatCurrency(paid, currencyCode)} — thank you!`)
    lines.push(`Remaining: ${amount}${loan.dueDate ? `, due ${formatDateFull(loan.dueDate)}` : ''}.`)
    lines.push('', `— ${senderName}`)
    return lines.join('\n')
  }
  return [
    `Hi ${loan.person}, a quick note: I still owe you ${amount}${loan.note ? ` for ${loan.note}` : ''}.`,
    loan.dueDate ? `I'll return it by ${formatDateFull(loan.dueDate)}.` : "I'll return it soon.",
    '',
    `— ${senderName}`,
  ].join('\n')
}
