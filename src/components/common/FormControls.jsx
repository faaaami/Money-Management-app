export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

const CONTROL_CLASSES =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-primary-500'

export function Input({ id, error, className = '', ...props }) {
  return (
    <input
      id={id}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${CONTROL_CLASSES} h-11 ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
  )
}

export function Select({ id, error, className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL_CLASSES} h-11 appearance-none pr-10 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      >
        <path
          d="m6 8 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
