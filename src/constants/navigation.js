import { BarChart3, HandCoins, LayoutDashboard, Receipt, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', shortLabel: 'History', icon: Receipt },
  { to: '/loans', label: 'Lend & Borrow', shortLabel: 'Loans', icon: HandCoins },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
]
