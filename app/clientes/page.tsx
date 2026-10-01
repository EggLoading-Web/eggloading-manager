'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Cliente = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
}

export default function ClientesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUser(data.user)
        cargarClientes()
      }
    })
  }, [router])

  async function cargarClientes() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    setClientes(data ?? [])
  }

  function limpiarForm() {
    setName('')
    setEmail('')
    setPhone('')
    setEditandoId(null)
  }

  function empezarEdicion(c: Cliente) {
    setName(c.name)
    setEmail(c.email ?? '')
    setPhone(c.phone ?? '')
    setEditandoId(c.id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const datos = { name, email: email || null, phone: phone || null }

    const { error } = editandoId
      ? await supabase.from('clients').update(datos).eq('id', editandoId)
      : await supabase.from('clients').insert(datos)

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    limpiarForm()
    await cargarClientes()
    setLoading(false)
  }

  async function borrarCliente(id: string) {
    if (!confirm('¿Borrar este cliente?')) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    await cargarClientes()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.toLowerCase().includes(q) ?? false)
    )
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
            <h1 className="text-2xl font-bold">Clientes</h1>
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
            {editandoId ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <input
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {loading ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar cliente'}
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
            Lista <span className="text-zinc-500 font-normal">({clientesFiltrados.length}{busqueda && ` de ${clientes.length}`})</span>
          </h2>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>

        {clientesFiltrados.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">
            {busqueda ? 'No hay clientes que coincidan.' : 'No hay clientes todavía.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {clientesFiltrados.map((c) => (
              <li key={c.id} className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.email && <p className="text-sm text-zinc-500 mt-0.5">{c.email}</p>}
                    {c.phone && <p className="text-sm text-zinc-500">{c.phone}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => empezarEdicion(c)}
                      className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-medium transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => borrarCliente(c.id)}
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
    </div>
  )
}