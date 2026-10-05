'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/lib/toast'
import { LanguageSelector } from '@/components/LanguageSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FormField, inputBaseClass, inputErrorClass } from '@/components/FormField'

const authSchema = z.object({
  email: z.string().email('errEmail'),
  password: z.string().min(6, 'errRequired'),
})

type FormErrors = {
  email?: string
  password?: string
}

const DEMO_EMAIL = 'demo@eggloading.com'
const DEMO_PASSWORD = 'demo1234'

export default function LoginPage() {
  const router = useRouter()
  const { t, lang } = useI18n()
  const { toast } = useToast()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const demoText = {
    es: { button: 'Probar demo', loading: 'Entrando...', note: 'Sin registro · datos de ejemplo' },
    en: { button: 'Try demo', loading: 'Entering...', note: 'No signup · sample data' },
    it: {
      button: 'Prova demo',
      loading: 'Accesso...',
      note: 'Senza registrazione · dati di esempio',
    },
  }
  const d = demoText[lang as keyof typeof demoText] ?? demoText.es

  function traducirError(code: string): string {
    return t(code as any) ?? code
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setErrors({})

    const result = authSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors
        fieldErrors[field] = traducirError(issue.message)
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleDemoLogin() {
    setError('')
    setErrors({})
    setDemoLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (error) {
      toast(error.message, 'error')
      setDemoLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-6">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-2xl">🥚</span>
              <span className="font-bold text-lg">Egg Loading</span>
            </div>
            <h1 className="text-2xl font-bold">
              {mode === 'login' ? t('loginTitle') : t('registerTitle')}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full py-2.5 mb-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition shadow-sm"
          >
            {demoLoading ? d.loading : `🚀 ${d.button}`}
          </button>
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mb-5">{d.note}</p>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs text-zinc-400 dark:text-zinc-500">o</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                className={`${inputBaseClass} ${errors.email ? inputErrorClass : ''}`}
              />
            </FormField>

            <FormField label={t('passwordPlaceholder')} error={errors.password}>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                className={`${inputBaseClass} ${errors.password ? inputErrorClass : ''}`}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              {loading ? t('loading') : mode === 'login' ? t('loginButton') : t('registerButton')}
            </button>
          </form>

          {error && (
            <div className="mt-4 px-3 py-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setErrors({})
              setError('')
            }}
            className="w-full mt-6 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            {mode === 'login' ? t('noAccount') : t('hasAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}
