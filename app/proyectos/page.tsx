'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { SkeletonCard } from '@/components/Skeleton'
import { FormField, inputBaseClass, inputErrorClass } from '@/components/FormField'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/lib/toast'
import { proyectoSchema } from '@/lib/validations'
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

type FormErrors = {
  name?: string
  stack?: string
  status?: string
  client_id?: string
}

const ESTADOS = ['pendiente', 'en progreso', 'entregado'] as const

const statusColor: Record<string, string> = {
  pendiente: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  'en progreso': 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  entregado: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
}

export default function ProyectosPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [name, setName] = useState('')
  const [stack, setStack] = useState('')
  const [status, setStatus] = useState('pendiente')
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [errors, setErrors] = useState<FormErrors>({})

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

  function labelEstado(s: string): string {
    if (s === 'pendiente') return t('pending')
    if (s === 'en progreso') return t('inProgress')
    if (s === 'entregado') return t('delivered')
    return s
  }

  function traducirError(code: string): string {
    return t(code as any) ?? code
  }

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
    setCargandoLista(false)
  }

  function limpiarForm() {
    setName('')
    setStack('')
    setStatus('pendiente')
    setClientId('')
    setEditandoId(null)
    setErrors({})
  }

  function empezarEdicion(p: Proyecto) {
    setName(p.name)
    setStack(p.stack ?? '')
    setStatus(p.status)
    setClientId(p.client_id)
    setEditandoId(p.id)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = proyectoSchema.safeParse({
      name,
      stack: stack || null,
      status,
      client_id: clientId,
    })

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

    const datos = {
      name: result.data.name,
      stack: result.data.stack || null,
      status: result.data.status,
      client_id: result.data.client_id,
    }

    const { error } = editandoId
      ? await supabase.from('projects').update(datos).eq('id', editandoId)
      : await supabase.from('projects').insert(datos)

    if (error) {
      toast(error.message, 'error')
      setLoading(false)
      return
    }

    toast(editandoId ? t('projectUpdated') : t('projectCreated'))
    limpiarForm()
    await cargarTodo()
    setLoading(false)
  }

  async function borrarProyecto(id: string) {
    if (!confirm(t('confirmDeleteProject'))) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      toast(error.message, 'error')
      return
    }
    toast(t('projectDeleted'))
    await cargarTodo()
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
      toast(error.message, 'error')
      return
    }

    toast(t('noteCreated'))
    setNuevaNota('')
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', notasProyectoId)
      .order('created_at', { ascending: false })
    setNotas(data ?? [])
  }

  async function borrarNota(id: string) {
    if (!confirm(t('confirmDeleteNote'))) return
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      toast(error.message, 'error')
      return
    }
    toast(t('noteDeleted'))
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
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-16" />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <Header user={user} breadcrumb={t('projectsTitle')} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editandoId ? t('editProject') : t('newProject')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <FormField error={errors.name}>
              <input
                placeholder={t('projectNamePlaceholder')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: undefined })
                }}
                className={`${inputBaseClass} ${errors.name ? inputErrorClass : ''}`}
              />
            </FormField>

            <FormField error={errors.stack}>
              <input
                placeholder={t('stackPlaceholder')}
                value={stack}
                onChange={(e) => {
                  setStack(e.target.value)
                  if (errors.stack) setErrors({ ...errors, stack: undefined })
                }}
                className={`${inputBaseClass} ${errors.stack ? inputErrorClass : ''}`}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField error={errors.status}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputBaseClass}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{labelEstado(e)}</option>
                  ))}
                </select>
              </FormField>

              <FormField error={errors.client_id}>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value)
                    if (errors.client_id) setErrors({ ...errors, client_id: undefined })
                  }}
                  className={`${inputBaseClass} ${errors.client_id ? inputErrorClass : ''}`}
                >
                  <option value="">{t('selectClient')}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {loading ? t('saving') : editandoId ? t('saveChanges') : t('addProject')}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarForm}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {t('list')} <span className="text-zinc-500 dark:text-zinc-400 font-normal">({proyectosFiltrados.length}{((busqueda || filtroEstado !== 'todos') && ` / ${proyectos.length}`)})</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder={t('searchProjects')}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          >
            <option value="todos">{t('allStatuses')}</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{labelEstado(e)}</option>
            ))}
          </select>
        </div>

        {cargandoLista ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 py-8 text-center">
            {busqueda || filtroEstado !== 'todos' ? t('noProjectsMatch') : t('noProjects')}
          </p>
        ) : (
          <ul className="space-y-3">
            {proyectosFiltrados.map((p) => (
              <li key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="font-semibold">{p.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor[p.status] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'}`}>
                        {labelEstado(p.status)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t('client')}: {p.clients?.name ?? t('unknownClient')}
                    </p>
                    {p.stack && <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">{p.stack}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => empezarEdicion(p)}
                      className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-medium transition"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => abrirNotas(p)}
                      className="px-3 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium transition"
                    >
                      {t('notes')}
                    </button>
                    <button
                      onClick={() => borrarProyecto(p.id)}
                      className="px-3 py-1 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950 text-red-700 dark:text-red-400 rounded-md text-xs font-medium transition"
                    >
                      {t('delete')}
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
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('notesTitle')} — {notasProyectoNombre}</h3>
              <button
                onClick={cerrarNotas}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-2xl leading-none transition"
              >
                ×
              </button>
            </div>

            <form onSubmit={agregarNota} className="flex gap-2 mb-4">
              <input
                placeholder={t('newNotePlaceholder')}
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                maxLength={500}
                className={inputBaseClass}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                {t('addNote')}
              </button>
            </form>

            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {cargandoNotas ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">{t('loadingNotes')}</p>
              ) : notas.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">{t('noNotes')}</p>
              ) : (
                <ul className="space-y-2">
                  {notas.map((n) => (
                    <li key={n.id} className="bg-stone-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                      <p className="text-sm break-words">{n.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        <button
                          onClick={() => borrarNota(n.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 transition"
                        >
                          {t('delete')}
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