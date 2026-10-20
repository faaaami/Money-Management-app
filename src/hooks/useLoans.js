import { createContext, useContext } from 'react'

export const LoansContext = createContext(null)

export function useLoans() {
  const context = useContext(LoansContext)
  if (!context) throw new Error('useLoans must be used within LoansProvider')
  return context
}
