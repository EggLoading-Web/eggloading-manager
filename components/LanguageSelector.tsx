'use client'

import { useI18n } from '@/lib/i18n'
import type { Lang } from '@/lib/translations'

const FLAGS: Record<Lang, string> = {
  es: '🇦🇷',
  en: '🇬🇧',
  it: '🇮🇹',
}

const LABELS: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
}

export function LanguageSelector() {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 shrink-0">
      {(Object.keys(FLAGS) as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          title={LABELS[code]}
          aria-label={LABELS[code]}
          className={`w-9 h-9 flex items-center justify-center text-base rounded-md transition touch-manipulation ${
            lang === code ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-50 hover:opacity-100'
          }`}
        >
          {FLAGS[code]}
        </button>
      ))}
    </div>
  )
}
