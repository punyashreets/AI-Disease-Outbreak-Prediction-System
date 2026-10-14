import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../services/translations'

const LanguageContext = createContext()

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) return { lang: 'en', setLang: () => {}, t: (k) => k }
  return ctx
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en')

  const setLang = useCallback((l) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }, [])

  const t = useCallback((key) => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] || entry.en || key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
