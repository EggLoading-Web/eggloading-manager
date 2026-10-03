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
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
      {(Object.keys(FLAGS) as Lang[]).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          title={LABELS[code]}
          aria-label={LABELS[code]}
          className={`px-2 py-1 text-base rounded-md transition ${
            lang === code
              ? 'bg-white dark:bg-zinc-700 shadow-sm'
              : 'hover:bg-white/50 dark:hover:bg-zinc-700/50 opacity-60 hover:opacity-100'
          }`}
        >
          {FLAGS[code]}
        </button>
      ))}
    </div>
  )
}