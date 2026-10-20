import { useCallback, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { ToastContext } from '../../hooks/useToast'

let toastId = 0

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-60 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="animate-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action.onClick()
                onDismiss(toast.id)
              }}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
            >
              {toast.action.label}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
            >
              Dismiss
            </button>
          )}
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

  /** options.action = { label, onClick } shows an inline action such as "Undo". */
  const showToast = useCallback(
    (message, options = {}) => {
      const id = ++toastId
      setToasts((current) => [...current, { id, message, action: options.action }])
      setTimeout(() => dismiss(id), options.action ? 5000 : 3000)
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
