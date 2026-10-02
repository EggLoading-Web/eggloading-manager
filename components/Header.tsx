'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LanguageSelector } from './LanguageSelector'
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
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/logo.jpg"
              alt="Egg Loading"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-lg hidden sm:inline group-hover:text-blue-600 transition">
              Egg Loading
            </span>
          </Link>

          {breadcrumb && (
            <>
              <span className="text-zinc-300 hidden sm:inline">/</span>
              <span className="text-sm text-zinc-500 truncate">{breadcrumb}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector />

          {user && (
            <>
              <span className="text-sm text-zinc-500 hidden lg:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-zinc-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}