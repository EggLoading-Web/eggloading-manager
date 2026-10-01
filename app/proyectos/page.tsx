'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Cliente = {
  id: string
  name: string
}

type Proyecto = {
  id: string
  name: string
  stack: string | null
  status: string
  client_id: string
  created_at: string
  clients: { name: string } | null
}

const ESTADOS = ['pendiente', 'en progreso', 'entregado']

export default function ProyectosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [name, setName] = useState('')
  const [stack, setStack] = useState('')
  const [status, setStatus] = useState('pendiente')
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        cargarTodo()
      }
    })
  }, [router])

  async function cargarTodo() {
    const [proyectosRes, clientesRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*, clients(name)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').order('name'),
    ])
    setProyectos((proyectosRes.data as Proyecto[]) ?? [])
    setClientes(clientesRes.data ?? [])
  }

  function limpiarForm() {
    setName('')
    setStack('')
    setStatus('pendiente')
    setClientId('')
    setEditandoId(null)
  }

  function empezarEdicion(p: Proyecto) {
    setName(p.name)
    setStack(p.stack ?? '')
    setStatus(p.status)
    setClientId(p.client_id)
    setEditandoId(p.id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const datos = {
      name,
      stack: stack || null,
      status,
      client_id: clientId,
    }

    const { error } = editandoId
      ? await supabase.from('projects').update(datos).eq('id', editandoId)
      : await supabase.from('projects').insert(datos)

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    limpiarForm()
    await cargarTodo()
    setLoading(false)
  }

  async function borrarProyecto(id: string) {
    if (!confirm('¿Borrar este proyecto?')) return

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    await cargarTodo()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) {
    return <p style={{ padding: '2rem', fontFamily: 'system-ui' }}>Cargando...</p>
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</Link>
          <h1 style={{ margin: 0 }}>Proyectos</h1>
        </div>
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        <input
          placeholder="Nombre del proyecto *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          placeholder="Stack (ej: Next.js, React)"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        >
          <option value="">Seleccioná un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.6rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar proyecto'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={limpiarForm}
            style={{ padding: '0.6rem', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <h2 style={{ marginTop: '2rem' }}>Lista ({proyectos.length})</h2>

      {proyectos.length === 0 ? (
        <p>No hay proyectos todavía.</p>
      ) : (
        <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
          {proyectos.map((p) => (
            <li key={p.id} style={{ padding: '0.75rem', border: '1px solid #eee', borderRadius: 6, marginBottom: '0.5rem' }}>
              <strong>{p.name}</strong>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                Cliente: {p.clients?.name ?? '—'} · Estado: {p.status}
              </div>
              {p.stack && <div style={{ fontSize: '0.85rem', color: '#666' }}>Stack: {p.stack}</div>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => empezarEdicion(p)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => borrarProyecto(p.id)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'red' }}
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}