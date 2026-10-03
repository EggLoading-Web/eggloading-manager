'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LanguageSelector } from './LanguageSelector'
import { ThemeToggle } from './ThemeToggle'
import { useI18n } from '@/lib/i18n'
import type { User } from '@supabase/supabase-js'

type HeaderProps = {
  user: User | null
  breadcrumb?: string
}

export function Header({ user, breadcrumb }: HeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
        <div className="flex justify-between items-center gap-2">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Egg Loading"
              width={32}
              height={32}
              className="rounded-lg w-8 h-8 sm:w-9 sm:h-9"
            />
            <span className="font-bold text-base sm:text-lg hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition">
              Egg Loading
            </span>
          </Link>

          {/* Controles */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
            <LanguageSelector />

            {user && (
              <>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden lg:inline ml-1">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-0.5 sm:ml-1 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition touch-manipulation"
                >
                  {t('logout')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb en fila aparte en mobile */}
        {breadcrumb && (
          <div className="mt-2 sm:mt-3">
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate block">
              {breadcrumb}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
