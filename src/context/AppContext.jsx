import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { T } from '../i18n/translations'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('de')
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('success')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const t = T[lang]

  const showToast = useCallback((msg, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setToastType(type)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 3200)
  }, [])

  return (
    <AppContext.Provider value={{ lang, setLang, t, showToast, toastMsg, toastType, toastVisible }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
