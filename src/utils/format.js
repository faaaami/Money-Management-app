import { CURRENCIES } from '../constants'

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

export function formatCurrency(amount, currencyCode = 'INR') {
  const { code } = getCurrency(currencyCode)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
