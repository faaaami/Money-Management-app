import { useRef, useState } from 'react'
import {
  Database,
  Download,
  Layers3,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Upload,
} from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { Field, Input, Select } from '../components/common/FormControls'
import { storage } from '../api/storage'
import {
  APP_NAME,
  CURRENCIES,
  DEFAULT_SETTINGS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants'
import { useLoans } from '../hooks/useLoans'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'
import { useTransactions } from '../hooks/useTransactions'
import { toLocalISODate } from '../utils/date'
import { amountPaddingClass, formatCurrency, getCurrency } from '../utils/format'
import { downloadFile } from '../utils/share'
import { generateSeedLoans, generateSeedTransactions } from '../seed/seedData'

function CategoryGrid({ title, categories }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-slate-500">{title}</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map(({ value, icon: Icon, color }) => (
          <li
            key={value}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              <Icon className="size-4" />
            </span>
            <span className="truncate">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const { transactions, clearTransactions, importTransactions } = useTransactions()
  const { loans, clearLoans, importLoans } = useLoans()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(settings.name)
  const [budget, setBudget] = useState(
    settings.monthlyBudget ? String(settings.monthlyBudget) : '',
  )
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmSeed, setConfirmSeed] = useState(false)

  const nameChanged = name.trim() !== settings.name && name.trim().length > 0
  const hasData = transactions.length > 0 || loans.length > 0
  const budgetValue = Number(budget)
  const budgetValid = budget === '' || (Number.isFinite(budgetValue) && budgetValue >= 0)
  const budgetChanged =
    budgetValid && (budget === '' ? 0 : budgetValue) !== settings.monthlyBudget

  const handleSaveBudget = () => {
    const value = budget === '' ? 0 : budgetValue
    updateSettings({ monthlyBudget: value })
    showToast(
      value ? `Budget set to ${formatCurrency(value, settings.currency)}` : 'Budget removed',
    )
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup = storage.parseBackup(await file.text())
      importTransactions(backup.transactions)
      importLoans(backup.loans)
      updateSettings(backup.settings)
      setName(backup.settings.name)
      setBudget(backup.settings.monthlyBudget ? String(backup.settings.monthlyBudget) : '')
      showToast(
        `Restored ${backup.transactions.length} transactions and ${backup.loans.length} lend/borrow records`,
      )
    } catch {
      showToast('That file is not a valid backup')
    }
  }

  const handleSaveName = () => {
    updateSettings({ name: name.trim() })
    showToast('Name updated')
  }

  const handleCurrency = (event) => {
    updateSettings({ currency: event.target.value })
    showToast('Currency updated')
  }

  const handleExport = () => {
    downloadFile(
      storage.exportData(),
      `money-manager-${toLocalISODate()}.json`,
      'application/json',
    )
    showToast('Backup downloaded')
  }

  const handleSeed = () => {
    importTransactions(generateSeedTransactions())
    importLoans(generateSeedLoans())
    setConfirmSeed(false)
    showToast('Sample data loaded')
  }

  const handleClearAll = () => {
    clearTransactions()
    clearLoans()
    updateSettings({ ...DEFAULT_SETTINGS })
    setName(DEFAULT_SETTINGS.name)
    setBudget('')
    setConfirmClear(false)
    showToast('All data cleared')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Preferences and data for {APP_NAME}
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Settings2 className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Preferences</h2>
            <p className="text-sm text-slate-500">Personalise how the app looks for you</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field label="Your name" htmlFor="settings-name">
              <div className="flex gap-2">
                <Input
                  id="settings-name"
                  type="text"
                  maxLength={30}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleSaveName}
                  disabled={!nameChanged}
                >
                  Save
                </Button>
              </div>
            </Field>
          </div>
          <Field label="Currency" htmlFor="settings-currency">
            <Select
              id="settings-currency"
              value={settings.currency}
              onChange={handleCurrency}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Target className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Monthly Budget</h2>
            <p className="text-sm text-slate-500">
              Track your spending limit on the dashboard. Leave empty to turn it off.
            </p>
          </div>
        </div>
        <div className="sm:max-w-sm">
          <Field
            label="Spending limit per month"
            htmlFor="settings-budget"
            error={budgetValid ? undefined : 'Enter a valid amount'}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-slate-400">
                  {getCurrency(settings.currency).symbol}
                </span>
                <Input
                  id="settings-budget"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="e.g. 25000"
                  error={budgetValid ? undefined : 'invalid'}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={amountPaddingClass(settings.currency)}
                />
              </div>
              <Button variant="secondary" onClick={handleSaveBudget} disabled={!budgetChanged}>
                Save
              </Button>
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Layers3 className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Categories</h2>
            <p className="text-sm text-slate-500">
              Categories available when you add a transaction
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <CategoryGrid title="Expense categories" categories={EXPENSE_CATEGORIES} />
          <CategoryGrid title="Income categories" categories={INCOME_CATEGORIES} />
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Database className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Data</h2>
            <p className="text-sm text-slate-500">
              Your data is stored only on this device
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="secondary" onClick={handleExport} disabled={!hasData}>
            <Download className="size-4" />
            Download Backup
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" />
            Restore Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="secondary"
            onClick={() => (hasData ? setConfirmSeed(true) : handleSeed())}
          >
            <Sparkles className="size-4" />
            Load Sample Data
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmClear(true)}
            disabled={!hasData}
          >
            <Trash2 className="size-4" />
            Clear All Data
          </Button>
        </div>

        {!hasData && (
          <p className="mt-3 text-sm text-slate-400">
            Add a transaction or load sample data to get started.
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        description={`This will permanently delete ${transactions.length} transactions, ${loans.length} lend/borrow records and reset your preferences. This action cannot be undone.`}
        confirmLabel="Clear everything"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmSeed}
        title="Replace with sample data?"
        description={`You have ${transactions.length} transactions and ${loans.length} lend/borrow records. Loading sample data will replace them. Download a backup first if you want to keep a copy.`}
        confirmLabel="Load sample data"
        danger
        onConfirm={handleSeed}
        onCancel={() => setConfirmSeed(false)}
      />
    </div>
  )
}
