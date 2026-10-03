'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { LanguageSelector } from '@/components/LanguageSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { User } from '@supabase/supabase-js'

export default function LandingPage() {
  const { lang } = useI18n()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const content = {
    es: {
      badge: 'CRM para freelancers',
      title1: 'Gestioná tus clientes y proyectos',
      titleAccent: 'sin perder el control',
      subtitle: 'Egg Loading Manager es el CRM que uso para gestionar todos mis clientes y proyectos freelance. Simple, rápido y enfocado en lo que importa.',
      ctaPrimary: 'Empezar gratis',
      ctaDashboard: 'Ir al dashboard',
      ctaLogin: 'Iniciar sesión',
      features: [
        { icon: '👥', title: 'Clientes', desc: 'Centralizá toda la info de tus clientes.' },
        { icon: '📁', title: 'Proyectos', desc: 'Seguimiento de estado: pendiente, en progreso, entregado.' },
        { icon: '📝', title: 'Notas', desc: 'Anotá todo lo que surja de cada proyecto.' },
        { icon: '📊', title: 'Dashboard', desc: 'Métricas claras de tu actividad.' },
        { icon: '🔍', title: 'Búsqueda', desc: 'Encontrá lo que necesitás al instante.' },
        { icon: '🌍', title: 'Multiidioma', desc: 'Español, inglés e italiano.' },
      ],
      footer: 'Hecho con 🥚 por Egg Loading',
    },
    en: {
      badge: 'CRM for freelancers',
      title1: 'Manage your clients and projects',
      titleAccent: 'without losing control',
      subtitle: 'Egg Loading Manager is the CRM I use to manage all my freelance clients and projects. Simple, fast and focused on what matters.',
      ctaPrimary: 'Get started free',
      ctaDashboard: 'Go to dashboard',
      ctaLogin: 'Sign in',
      features: [
        { icon: '👥', title: 'Clients', desc: 'All your client info in one place.' },
        { icon: '📁', title: 'Projects', desc: 'Track status: pending, in progress, delivered.' },
        { icon: '📝', title: 'Notes', desc: 'Take notes on every project.' },
        { icon: '📊', title: 'Dashboard', desc: 'Clear metrics of your activity.' },
        { icon: '🔍', title: 'Search', desc: 'Find what you need instantly.' },
        { icon: '🌍', title: 'Multilingual', desc: 'Spanish, English and Italian.' },
      ],
      footer: 'Made with 🥚 by Egg Loading',
    },
    it: {
      badge: 'CRM per freelancer',
      title1: 'Gestisci clienti e progetti',
      titleAccent: 'senza perdere il controllo',
      subtitle: 'Egg Loading Manager è il CRM che uso per gestire tutti i miei clienti e progetti freelance. Semplice, veloce e focalizzato su ciò che conta.',
      ctaPrimary: 'Inizia gratis',
      ctaDashboard: 'Vai alla dashboard',
      ctaLogin: 'Accedi',
      features: [
        { icon: '👥', title: 'Clienti', desc: 'Tutte le info dei tuoi clienti in un posto.' },
        { icon: '📁', title: 'Progetti', desc: 'Traccia lo stato: in attesa, in corso, consegnato.' },
        { icon: '📝', title: 'Note', desc: 'Annota tutto per ogni progetto.' },
        { icon: '📊', title: 'Dashboard', desc: 'Metriche chiare della tua attività.' },
        { icon: '🔍', title: 'Ricerca', desc: 'Trova ciò che ti serve subito.' },
        { icon: '🌍', title: 'Multilingua', desc: 'Spagnolo, inglese e italiano.' },
      ],
      footer: 'Fatto con 🥚 da Egg Loading',
    },
  }

  const c = content[lang as keyof typeof content] ?? content.es

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.jpg"
              alt="Egg Loading"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              Egg Loading
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
              >
                {c.ctaDashboard}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
              >
                {c.ctaLogin}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium mb-6">
            {c.badge}
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            {c.title1}{' '}
            <span className="text-blue-600 dark:text-blue-400">{c.titleAccent}</span>
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            {c.subtitle}
          </p>

          <Link
            href={user ? '/dashboard' : '/login'}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            {user ? c.ctaDashboard : c.ctaPrimary} →
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {c.footer}
      </footer>
    </div>
  )
}