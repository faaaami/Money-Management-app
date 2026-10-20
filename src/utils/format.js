import { CURRENCIES } from '../constants'

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

/** Left padding for an amount input so the currency prefix (e.g. "₹" or "AED") fits. */
export function amountPaddingClass(currencyCode) {
  return getCurrency(currencyCode).symbol.length > 1 ? 'pl-14' : 'pl-8'
}

export function formatCurrency(amount, currencyCode = 'INR') {
  const { code, locale } = getCurrency(currencyCode)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
