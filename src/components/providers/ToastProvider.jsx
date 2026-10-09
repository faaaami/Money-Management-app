import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from '../../hooks/useToast'

let toastId = 0

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
            ✓
          </span>
          <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message) => {
      const id = ++toastId
      setToasts((current) => [...current, { id, message }])
      setTimeout(() => dismiss(id), 3000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
