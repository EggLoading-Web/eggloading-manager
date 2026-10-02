'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from './translations'

type I18nContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved && ['es', 'en', 'it'].includes(saved)) {
      setLangState(saved)
    }
  }, [])

  function setLang(newLang: Lang) {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] ?? translations.es[key] ?? key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n debe usarse dentro de I18nProvider')
  }
  return ctx
}