import { toLocalISODate, toLocalTimeString } from '../utils/date'

function daysAgo(days) {
  return toLocalISODate(new Date(Date.now() - days * 86400000))
}

function daysInCurrentMonth(day) {
  const date = new Date()
  const max = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return toLocalISODate(
    new Date(date.getFullYear(), date.getMonth(), Math.min(day, max)),
  )
}

function previousMonth(day) {
  const date = new Date()
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return toLocalISODate(new Date(d.getFullYear(), d.getMonth(), Math.min(day, max)))
}

let counter = 0
function tx(type, amount, category, note, date, time) {
  counter += 1
  const createdAt = new Date().toISOString()
  return {
    id: `seed-${counter}`,
    type,
    amount,
    category,
    note,
    date,
    time,
    createdAt,
    updatedAt: createdAt,
  }
}

export function generateSeedTransactions() {
  counter = 0
  const now = toLocalTimeString()
  return [
    tx('income', 45000, 'Salary', 'Monthly salary', daysInCurrentMonth(1), '09:15'),
    tx('expense', 2500, 'Groceries', 'Monthly groceries', daysAgo(2), '11:40'),
    tx('expense', 1200, 'Bills', 'Electricity bill', daysAgo(1), '18:20'),
    tx('expense', 350, 'Food', 'Vegetables', daysAgo(0), now),
    tx('expense', 1800, 'Food', 'Family dinner', daysAgo(4), '20:30'),
    tx('expense', 1500, 'Transport', 'Fuel', daysAgo(3), '08:45'),
    tx('expense', 3000, 'Shopping', 'Clothes', daysAgo(5), '17:10'),
    tx('expense', 450, 'Entertainment', 'Movie tickets', daysAgo(6), '19:00'),
    tx('expense', 700, 'Medical', 'Pharmacy', daysAgo(7), '10:05'),
    tx('expense', 999, 'Bills', 'Internet recharge', daysAgo(8), '13:25'),
    tx('income', 45000, 'Salary', 'Monthly salary', previousMonth(1), '09:15'),
    tx('expense', 2600, 'Groceries', 'Monthly groceries', previousMonth(3), '12:20'),
    tx('expense', 1350, 'Bills', 'Electricity bill', previousMonth(6), '18:05'),
    tx('expense', 2100, 'Food', 'Groceries & eating out', previousMonth(9), '19:45'),
    tx('expense', 1100, 'Transport', 'Auto & metro', previousMonth(12), '08:30'),
    tx('expense', 4200, 'Shopping', 'Festive shopping', previousMonth(15), '16:50'),
    tx('expense', 1500, 'Household', 'Kitchen supplies', previousMonth(18), '11:15'),
  ]
}
