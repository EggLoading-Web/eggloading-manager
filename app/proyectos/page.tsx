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

type Nota = {
  id: string
  content: string
  created_at: string
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
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Notas
  const [notasProyectoId, setNotasProyectoId] = useState<string | null>(null)
  const [notasProyectoNombre, setNotasProyectoNombre] = useState('')
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [cargandoNotas, setCargandoNotas] = useState(false)

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
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').order('name'),
    ])

    const clientesMap = new Map((clientesRes.data ?? []).map((c) => [c.id, c.name]))

    const proyectosConCliente = (proyectosRes.data ?? []).map((p) => ({
      ...p,
      clients: { name: clientesMap.get(p.client_id) ?? '—' },
    }))

    setProyectos(proyectosConCliente as Proyecto[])
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
    if (!confirm('¿Borrar este proyecto? También se borrarán sus notas.')) return

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

  async function abrirNotas(proyecto: Proyecto) {
    setNotasProyectoId(proyecto.id)
    setNotasProyectoNombre(proyecto.name)
    setNuevaNota('')
    setCargandoNotas(true)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', proyecto.id)
      .order('created_at', { ascending: false })
    setNotas(data ?? [])
    setCargandoNotas(false)
  }

  function cerrarNotas() {
    setNotasProyectoId(null)
    setNotasProyectoNombre('')
    setNotas([])
    setNuevaNota('')
  }

  async function agregarNota(e: React.FormEvent) {
    e.preventDefault()
    if (!notasProyectoId || !nuevaNota.trim()) return

    const { error } = await supabase.from('notes').insert({
      content: nuevaNota.trim(),
      project_id: notasProyectoId,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    setNuevaNota('')
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', notasProyectoId)
      .order('created_at', { ascending: false })
    setNotas(data ?? [])
  }

  async function borrarNota(id: string) {
    if (!confirm('¿Borrar esta nota?')) return

    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }

    if (notasProyectoId) {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', notasProyectoId)
        .order('created_at', { ascending: false })
      setNotas(data ?? [])
    }
  }

  const proyectosFiltrados = proyectos.filter((p) => {
    const q = busqueda.toLowerCase().trim()
    const coincideBusqueda =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.stack?.toLowerCase().includes(q) ?? false) ||
      (p.clients?.name.toLowerCase().includes(q) ?? false)

    const coincideEstado = filtroEstado === 'todos' || p.status === filtroEstado

    return coincideBusqueda && coincideEstado
  })

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

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>Lista ({proyectosFiltrados.length}{((busqueda || filtroEstado !== 'todos') && ` de ${proyectos.length}`)})</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, stack o cliente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.85rem', flex: 1 }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.85rem' }}
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {proyectosFiltrados.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>
          {busqueda || filtroEstado !== 'todos'
            ? 'No hay proyectos que coincidan con los filtros.'
            : 'No hay proyectos todavía.'}
        </p>
      ) : (
        <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
          {proyectosFiltrados.map((p) => (
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
                  onClick={() => abrirNotas(p)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                >
                  Notas
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

      {notasProyectoId && (
        <div
          onClick={cerrarNotas}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              color: '#111',
              borderRadius: 8,
              padding: '1.5rem',
              maxWidth: 500,
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Notas — {notasProyectoNombre}</h3>
              <button
                onClick={cerrarNotas}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={agregarNota} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                placeholder="Nueva nota..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: 6 }}
              />
              <button
                type="submit"
                style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Agregar
              </button>
            </form>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {cargandoNotas ? (
                <p>Cargando...</p>
              ) : notas.length === 0 ? (
                <p style={{ color: '#666' }}>No hay notas todavía.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {notas.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        padding: '0.6rem',
                        border: '1px solid #eee',
                        borderRadius: 6,
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>{n.content}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          {new Date(n.created_at).toLocaleString('es-ES')}
                        </span>
                        <button
                          onClick={() => borrarNota(n.id)}
                          style={{ fontSize: '0.75rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Borrar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}