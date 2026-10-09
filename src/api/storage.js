import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants'
import { generateId } from '../utils/id'

function emptyState() {
  return { transactions: [], settings: { ...DEFAULT_SETTINGS } }
}

function normalizeTransaction(raw) {
  if (!raw || typeof raw !== 'object') return null
  const amount = Number(raw.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (raw.type !== 'income' && raw.type !== 'expense') return null
  if (typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return null

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
  }
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptyState()

    const transactions = Array.isArray(parsed.transactions)
      ? parsed.transactions.map(normalizeTransaction).filter(Boolean)
      : []

    return { transactions, settings: normalizeSettings(parsed.settings) }
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
}
