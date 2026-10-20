import {
  Briefcase,
  Car,
  GraduationCap,
  HeartPulse,
  Laptop,
  Film,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Utensils,
  Wallet,
  Wrench,
} from 'lucide-react'

export const APP_NAME = 'Money Manager'

export const STORAGE_KEY = 'money-manager:v1'

export const EXPENSE_CATEGORIES = [
  { value: 'Food', icon: Utensils, color: '#f59e0b' },
  { value: 'Groceries', icon: ShoppingCart, color: '#10b981' },
  { value: 'Bills', icon: Receipt, color: '#0ea5e9' },
  { value: 'Shopping', icon: ShoppingBag, color: '#f43f5e' },
  { value: 'Transport', icon: Car, color: '#8b5cf6' },
  { value: 'Medical', icon: HeartPulse, color: '#14b8a6' },
  { value: 'Education', icon: GraduationCap, color: '#6366f1' },
  { value: 'Household', icon: Wrench, color: '#f97316' },
  { value: 'Entertainment', icon: Film, color: '#d946ef' },
  { value: 'Other', icon: Package, color: '#64748b' },
]

export const INCOME_CATEGORIES = [
  { value: 'Salary', icon: Wallet, color: '#059669' },
  { value: 'Business', icon: Briefcase, color: '#0ea5e9' },
  { value: 'Freelance', icon: Laptop, color: '#8b5cf6' },
  { value: 'Other', icon: Sparkles, color: '#64748b' },
]

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
]

export const DEFAULT_SETTINGS = {
  name: '',
  currency: 'INR',
  monthlyBudget: 0,
}

export const CATEGORY_COLORS = Object.fromEntries(
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => [c.value, c.color]),
)

export function getCategoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function getCategoryMeta(name, type) {
  const list = getCategoriesFor(type)
  return list.find((c) => c.value === name) ?? list[list.length - 1]
}

