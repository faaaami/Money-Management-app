import { BrowserRouter } from 'react-router-dom'
import SettingsProvider from './components/providers/SettingsProvider'
import ToastProvider from './components/providers/ToastProvider'
import TransactionsProvider from './components/providers/TransactionsProvider'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <TransactionsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TransactionsProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
