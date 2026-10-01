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
      if (!data.user) {
        router.push('/login')
      } else {
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
      if (p.status in conteo) {
        conteo[p.status as keyof typeof conteo]++
      }
    })
    setPorEstado(conteo)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user || loading) {
    return <p style={{ padding: '2rem', fontFamily: 'system-ui' }}>Cargando...</p>
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Egg Loading Manager</h1>
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '0.85rem',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/clientes" style={{ padding: '0.6rem 1rem', background: '#000', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          Clientes
        </Link>
        <Link href="/proyectos" style={{ padding: '0.6rem 1rem', background: '#000', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          Proyectos
        </Link>
      </nav>

      <h2>Métricas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalClientes}</div>
          <div style={{ color: '#666' }}>Clientes</div>
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalProyectos}</div>
          <div style={{ color: '#666' }}>Proyectos</div>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Proyectos por estado</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{porEstado.pendiente}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Pendiente</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{porEstado['en progreso']}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>En progreso</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{porEstado.entregado}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Entregado</div>
        </div>
      </div>
    </div>
  )
}