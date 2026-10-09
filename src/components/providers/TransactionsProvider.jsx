import { useCallback, useMemo, useState } from 'react'
import { storage } from '../../api/storage'
import { TransactionsContext } from '../../hooks/useTransactions'

export default function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState(() => storage.getTransactions())

  const addTransaction = useCallback((data) => {
    setTransactions(storage.addTransaction(data))
  }, [])

  const updateTransaction = useCallback((id, patch) => {
    setTransactions(storage.updateTransaction(id, patch))
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions(storage.deleteTransaction(id))
  }, [])

  const clearTransactions = useCallback(() => {
    setTransactions(storage.clearTransactions())
  }, [])

  const importTransactions = useCallback((list) => {
    setTransactions(storage.saveTransactions(list))
  }, [])

  const value = useMemo(
    () => ({
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      clearTransactions,
      importTransactions,
    }),
    [
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      clearTransactions,
      importTransactions,
    ],
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}
