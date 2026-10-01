'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Cliente = { id: string; name: string }

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

const statusColor: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  'en progreso': 'bg-blue-50 text-blue-700 border-blue-200',
  entregado: 'bg-green-50 text-green-700 border-green-200',
}

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

  const [notasProyectoId, setNotasProyectoId] = useState<string | null>(null)
  const [notasProyectoNombre, setNotasProyectoNombre] = useState('')
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [cargandoNotas, setCargandoNotas] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUser(data.user)
        cargarTodo()
      }
    })
  }, [router])

  async function cargarTodo() {
    const [proyectosRes, clientesRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
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

    const datos = { name, stack: stack || null, status, client_id: clientId }

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

  if (!user) return <p className="p-8 text-zinc-500">Cargando...</p>

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Proyectos</h1>
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

        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editandoId ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Nombre del proyecto *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <input
              placeholder="Stack (ej: Next.js, React)"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                <option value="">Seleccioná cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {loading ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar proyecto'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarForm}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            Lista <span className="text-zinc-500 font-normal">({proyectosFiltrados.length}{((busqueda || filtroEstado !== 'todos') && ` de ${proyectos.length}`)})</span>
          </h2>
        </div>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, stack o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          >
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        {proyectosFiltrados.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">
            {busqueda || filtroEstado !== 'todos'
              ? 'No hay proyectos que coincidan.'
              : 'No hay proyectos todavía.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {proyectosFiltrados.map((p) => (
              <li key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{p.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor[p.status] ?? 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Cliente: {p.clients?.name ?? '—'}
                    </p>
                    {p.stack && <p className="text-sm text-zinc-400 mt-0.5">{p.stack}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => empezarEdicion(p)}
                      className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-medium transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => abrirNotas(p)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md text-xs font-medium transition"
                    >
                      Notas
                    </button>
                    <button
                      onClick={() => borrarProyecto(p.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-medium transition"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notasProyectoId && (
        <div
          onClick={cerrarNotas}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-zinc-200 rounded-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notas — {notasProyectoNombre}</h3>
              <button
                onClick={cerrarNotas}
                className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none transition"
              >
                ×
              </button>
            </div>

            <form onSubmit={agregarNota} className="flex gap-2 mb-4">
              <input
                placeholder="Nueva nota..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Agregar
              </button>
            </form>

            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {cargandoNotas ? (
                <p className="text-zinc-500 text-center py-4">Cargando...</p>
              ) : notas.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No hay notas todavía.</p>
              ) : (
                <ul className="space-y-2">
                  {notas.map((n) => (
                    <li key={n.id} className="bg-stone-50 border border-zinc-200 rounded-lg p-3">
                      <p className="text-sm">{n.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-zinc-400">
                          {new Date(n.created_at).toLocaleString('es-ES')}
                        </span>
                        <button
                          onClick={() => borrarNota(n.id)}
                          className="text-xs text-red-600 hover:text-red-700 transition"
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