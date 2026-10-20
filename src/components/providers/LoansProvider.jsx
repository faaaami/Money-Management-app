import { useCallback, useMemo, useState } from 'react'
import { storage } from '../../api/storage'
import { LoansContext } from '../../hooks/useLoans'
import { toLocalISODate } from '../../utils/date'
import { generateId } from '../../utils/id'
import { getLoanProgress } from '../../utils/loans'

export default function LoansProvider({ children }) {
  const [loans, setLoans] = useState(() => storage.getLoans())

  const addLoan = useCallback((data) => {
    setLoans(storage.addLoan(data))
  }, [])

  const updateLoan = useCallback((id, patch) => {
    setLoans(storage.updateLoan(id, patch))
  }, [])

  const deleteLoan = useCallback((id) => {
    setLoans(storage.deleteLoan(id))
  }, [])

  const addPayment = useCallback((id, payment) => {
    const loan = storage.getLoans().find((l) => l.id === id)
    if (!loan) return
    setLoans(
      storage.updateLoan(id, {
        payments: [...loan.payments, { ...payment, id: generateId() }],
      }),
    )
  }, [])

  const deletePayment = useCallback((id, paymentId) => {
    const loan = storage.getLoans().find((l) => l.id === id)
    if (!loan) return
    setLoans(
      storage.updateLoan(id, {
        payments: loan.payments.filter((p) => p.id !== paymentId),
      }),
    )
  }, [])

  const markSettled = useCallback((id) => {
    const loan = storage.getLoans().find((l) => l.id === id)
    if (!loan) return
    const { remaining } = getLoanProgress(loan)
    if (remaining <= 0) return
    setLoans(
      storage.updateLoan(id, {
        payments: [
          ...loan.payments,
          { id: generateId(), amount: remaining, date: toLocalISODate(), note: 'Marked as settled' },
        ],
      }),
    )
  }, [])

  const reopenLoan = useCallback((id) => {
    setLoans(storage.updateLoan(id, { payments: [] }))
  }, [])

  const importLoans = useCallback((list) => {
    setLoans(storage.saveLoans(list))
  }, [])

  const clearLoans = useCallback(() => {
    setLoans(storage.saveLoans([]))
  }, [])

  const value = useMemo(
    () => ({
      loans,
      addLoan,
      updateLoan,
      deleteLoan,
      addPayment,
      deletePayment,
      markSettled,
      reopenLoan,
      importLoans,
      clearLoans,
    }),
    [
      loans,
      addLoan,
      updateLoan,
      deleteLoan,
      addPayment,
      deletePayment,
      markSettled,
      reopenLoan,
      importLoans,
      clearLoans,
    ],
  )

  return <LoansContext.Provider value={value}>{children}</LoansContext.Provider>
}
