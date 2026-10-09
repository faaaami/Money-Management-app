import { createContext, useContext } from 'react'

export const TransactionsContext = createContext(null)

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions must be used within TransactionsProvider')
  }
  return context
}
