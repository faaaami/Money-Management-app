import { BrowserRouter } from 'react-router-dom'
import LoansProvider from './components/providers/LoansProvider'
import SettingsProvider from './components/providers/SettingsProvider'
import ToastProvider from './components/providers/ToastProvider'
import TransactionsProvider from './components/providers/TransactionsProvider'
import Welcome from './components/onboarding/Welcome'
import { useSettings } from './hooks/useSettings'
import AppRoutes from './routes/AppRoutes'

// First-time visitors (no name saved yet) see the welcome screen instead of the app.
function AppGate() {
  const { settings } = useSettings()
  return settings.name ? <AppRoutes /> : <Welcome />
}

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <TransactionsProvider>
          <LoansProvider>
            <BrowserRouter>
              <AppGate />
            </BrowserRouter>
          </LoansProvider>
        </TransactionsProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
