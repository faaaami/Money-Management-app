export default function StatCard({ icon: Icon, label, value, tone = 'neutral' }) {
  const tones = {
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-red-50 text-red-600',
    neutral: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="rounded-card border border-slate-200 bg-white p-3.5 shadow-card sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className={`flex size-6 items-center justify-center rounded-md sm:size-7 ${tones[tone]}`}
        >
          <Icon className="size-3.5 sm:size-4" />
        </span>
        <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
          {label}
        </p>
      </div>
      <p className="mt-2 truncate text-lg font-semibold tabular-nums text-slate-900 sm:mt-3 sm:text-2xl">
        {value}
      </p>
    </div>
  )
}
