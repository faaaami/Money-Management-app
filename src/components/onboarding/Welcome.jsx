import { useState } from 'react'
import { ArrowRight, HandCoins, PiggyBank, Target, Wallet } from 'lucide-react'
import { APP_NAME, CURRENCIES } from '../../constants'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import Button from '../common/Button'
import { Field, Input, Select } from '../common/FormControls'

const HIGHLIGHTS = [
  { icon: PiggyBank, text: 'Track income & spending' },
  { icon: HandCoins, text: 'Remember who owes you' },
  { icon: Target, text: 'Stay within your budget' },
]

export default function Welcome() {
  const { settings, updateSettings } = useSettings()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState(settings.currency)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name')
      return
    }
    updateSettings({ name: trimmed, currency })
    showToast(`Welcome, ${trimmed}! 🎉`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 py-10">
      <div className="pointer-events-none fixed -left-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -right-16 size-80 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="animate-sheet relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-emerald-900/30 sm:p-8">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
          <Wallet className="size-7" />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome to {APP_NAME} 👋
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Your simple, private money companion. Everything stays on this device.
        </p>

        <ul className="mt-5 space-y-2.5">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <Field label="What should we call you?" htmlFor="welcome-name" error={error}>
            <Input
              id="welcome-name"
              type="text"
              placeholder="Your name"
              maxLength={30}
              autoComplete="given-name"
              autoFocus
              error={error}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
            />
          </Field>

          <Field label="Currency" htmlFor="welcome-currency">
            <Select
              id="welcome-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Button type="submit" size="lg" className="w-full">
            {name.trim() ? `Let's go, ${name.trim()}` : 'Get started'}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
