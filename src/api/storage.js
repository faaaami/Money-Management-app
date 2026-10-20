import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants'
import { generateId } from '../utils/id'

function emptyState() {
  return { transactions: [], loans: [], settings: { ...DEFAULT_SETTINGS } }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function normalizeTransaction(raw) {
  if (!raw || typeof raw !== 'object') return null
  const amount = Number(raw.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (raw.type !== 'income' && raw.type !== 'expense') return null
  if (typeof raw.date !== 'string' || !ISO_DATE.test(raw.date)) return null

  const createdAt =
    typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : generateId(),
    type: raw.type,
    amount,
    category: typeof raw.category === 'string' && raw.category ? raw.category : 'Other',
    note: typeof raw.note === 'string' ? raw.note : '',
    date: raw.date,
    time:
      typeof raw.time === 'string' && /^\d{2}:\d{2}$/.test(raw.time)
        ? raw.time
        : '00:00',
    createdAt,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : createdAt,
  }
}

function normalizePayment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const amount = Number(raw.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (typeof raw.date !== 'string' || !ISO_DATE.test(raw.date)) return null
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : generateId(),
    amount,
    date: raw.date,
    note: typeof raw.note === 'string' ? raw.note : '',
  }
}

function normalizeLoan(raw) {
  if (!raw || typeof raw !== 'object') return null
  const amount = Number(raw.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (raw.direction !== 'lent' && raw.direction !== 'borrowed') return null
  if (typeof raw.person !== 'string' || !raw.person.trim()) return null
  if (typeof raw.date !== 'string' || !ISO_DATE.test(raw.date)) return null

  const createdAt =
    typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : generateId(),
    direction: raw.direction,
    person: raw.person.trim(),
    amount,
    date: raw.date,
    dueDate:
      typeof raw.dueDate === 'string' && ISO_DATE.test(raw.dueDate) ? raw.dueDate : '',
    note: typeof raw.note === 'string' ? raw.note : '',
    payments: Array.isArray(raw.payments)
      ? raw.payments.map(normalizePayment).filter(Boolean)
      : [],
    createdAt,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : createdAt,
  }
}

function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    name:
      typeof source.name === 'string' && source.name.trim()
        ? source.name.trim()
        : DEFAULT_SETTINGS.name,
    currency:
      typeof source.currency === 'string' && source.currency
        ? source.currency
        : DEFAULT_SETTINGS.currency,
    monthlyBudget:
      Number.isFinite(Number(source.monthlyBudget)) && Number(source.monthlyBudget) > 0
        ? Number(source.monthlyBudget)
        : 0,
  }
}

function normalizeState(parsed) {
  if (!parsed || typeof parsed !== 'object') return emptyState()
  return {
    transactions: Array.isArray(parsed.transactions)
      ? parsed.transactions.map(normalizeTransaction).filter(Boolean)
      : [],
    loans: Array.isArray(parsed.loans)
      ? parsed.loans.map(normalizeLoan).filter(Boolean)
      : [],
    settings: normalizeSettings(parsed.settings),
  }
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return normalizeState(JSON.parse(raw))
  } catch {
    return emptyState()
  }
}

function write(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — app keeps working in memory.
  }
}

export const storage = {
  getTransactions() {
    return read().transactions
  },

  saveTransactions(transactions) {
    const state = read()
    write({ ...state, transactions })
    return transactions
  },

  addTransaction(data) {
    const state = read()
    const now = new Date().toISOString()
    const transaction = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    const transactions = [transaction, ...state.transactions]
    write({ ...state, transactions })
    return transactions
  },

  updateTransaction(id, patch) {
    const state = read()
    const transactions = state.transactions.map((t) =>
      t.id === id
        ? { ...t, ...patch, id, updatedAt: new Date().toISOString() }
        : t,
    )
    write({ ...state, transactions })
    return transactions
  },

  deleteTransaction(id) {
    const state = read()
    const transactions = state.transactions.filter((t) => t.id !== id)
    write({ ...state, transactions })
    return transactions
  },

  clearTransactions() {
    const state = read()
    write({ ...state, transactions: [] })
    return []
  },

  getLoans() {
    return read().loans
  },

  saveLoans(loans) {
    const state = read()
    write({ ...state, loans })
    return loans
  },

  addLoan(data) {
    const state = read()
    const now = new Date().toISOString()
    const loan = { payments: [], ...data, id: generateId(), createdAt: now, updatedAt: now }
    const loans = [loan, ...state.loans]
    write({ ...state, loans })
    return loans
  },

  updateLoan(id, patch) {
    const state = read()
    const loans = state.loans.map((l) =>
      l.id === id ? { ...l, ...patch, id, updatedAt: new Date().toISOString() } : l,
    )
    write({ ...state, loans })
    return loans
  },

  deleteLoan(id) {
    const state = read()
    const loans = state.loans.filter((l) => l.id !== id)
    write({ ...state, loans })
    return loans
  },

  getSettings() {
    return read().settings
  },

  saveSettings(patch) {
    const state = read()
    const settings = { ...state.settings, ...patch }
    write({ ...state, settings })
    return settings
  },

  exportData() {
    const state = read()
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), ...state },
      null,
      2,
    )
  },

  /** Parses a backup produced by exportData. Throws if the file is not a backup. */
  parseBackup(text) {
    const parsed = JSON.parse(text)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (!Array.isArray(parsed.transactions) && !Array.isArray(parsed.loans))
    ) {
      throw new Error('Not a Money Manager backup')
    }
    return normalizeState(parsed)
  },
}
