'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const router = useRouter()
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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user || loading) return <p className="p-8 text-zinc-500">Cargando...</p>

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥚</span>
            <h1 className="text-2xl font-bold">Egg Loading Manager</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Salir
            </button>
          </div>
        </header>

        <nav className="flex gap-3 mb-8">
          <Link
            href="/clientes"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Clientes
          </Link>
          <Link
            href="/proyectos"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Proyectos
          </Link>
        </nav>

        <h2 className="text-lg font-semibold mb-4">Métricas</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="text-4xl font-bold mb-1">{totalClientes}</div>
            <div className="text-sm text-zinc-500">Clientes</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="text-4xl font-bold mb-1">{totalProyectos}</div>
            <div className="text-sm text-zinc-500">Proyectos</div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Proyectos por estado</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-amber-200 rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-amber-600 mb-1">{porEstado.pendiente}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Pendiente</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">{porEstado['en progreso']}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">En progreso</div>
          </div>
          <div className="bg-white border border-green-200 rounded-xl p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">{porEstado.entregado}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Entregado</div>
          </div>
        </div>
      </div>
    </div>
  )
}