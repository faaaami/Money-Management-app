export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-card border border-slate-200 bg-white shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
