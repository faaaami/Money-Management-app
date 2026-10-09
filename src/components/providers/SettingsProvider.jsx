import { useCallback, useMemo, useState } from 'react'
import { storage } from '../../api/storage'
import { SettingsContext } from '../../hooks/useSettings'

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => storage.getSettings())

  const updateSettings = useCallback((patch) => {
    setSettings(storage.saveSettings(patch))
  }, [])

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
