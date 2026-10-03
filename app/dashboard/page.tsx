'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Skeleton, SkeletonMetricCard, SkeletonStatusCard } from '@/components/Skeleton'
import { StatusBarChart, StatusPieChart } from '@/components/DashboardCharts'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalProyectos, setTotalProyectos] = useState(0)
  const [porEstado, setPorEstado] = useState({ pendiente: 0, 'en progreso': 0, entregado: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUser(data.user)
        cargarMetricas()
      }
    })
  }, [router])

  async function cargarMetricas() {
    const [clientesRes, proyectosRes] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('status'),
    ])

    setTotalClientes(clientesRes.count ?? 0)
    const proyectos = proyectosRes.data ?? []
    setTotalProyectos(proyectos.length)

    const conteo = { pendiente: 0, 'en progreso': 0, entregado: 0 }
    proyectos.forEach((p: { status: string }) => {
      if (p.status in conteo) conteo[p.status as keyof typeof conteo]++
    })
    setPorEstado(conteo)
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-16" />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-40 mb-3" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="grid grid-cols-2 gap-4 mb-8">
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </div>
        </div>
      </div>
    )
  }

  const labels = {
    pending: t('pending'),
    inProgress: t('inProgress'),
    delivered: t('delivered'),
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header user={user} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('greeting')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('greetingSubtitle')}</p>
        </div>

        <nav className="flex gap-3 mb-8">
          <Link
            href="/clientes"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            {t('clients')}
          </Link>
          <Link
            href="/proyectos"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            {t('projects')}
          </Link>
        </nav>

        <h2 className="text-lg font-semibold mb-4">{t('metrics')}</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <div className="text-4xl font-bold mb-1">{totalClientes}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('clients')}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <div className="text-4xl font-bold mb-1">{totalProyectos}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('projects')}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            <SkeletonStatusCard />
            <SkeletonStatusCard />
            <SkeletonStatusCard />
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">{t('projectsByStatus')}</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{porEstado.pendiente}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('pending')}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{porEstado['en progreso']}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('inProgress')}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900/50 rounded-xl p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{porEstado.entregado}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('delivered')}</div>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Análisis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StatusBarChart
                pendiente={porEstado.pendiente}
                enProgreso={porEstado['en progreso']}
                entregado={porEstado.entregado}
                labels={labels}
              />
              <StatusPieChart
                pendiente={porEstado.pendiente}
                enProgreso={porEstado['en progreso']}
                entregado={porEstado.entregado}
                labels={labels}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}