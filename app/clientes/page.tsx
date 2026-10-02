'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
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
  const { t } = useI18n()
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
    if (!confirm(t('confirmDeleteClient'))) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    await cargarClientes()
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

  if (!user) return <p className="p-8 text-zinc-500">{t('loading')}</p>

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} breadcrumb={t('clientsTitle')} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editandoId ? t('editClient') : t('newClient')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <input
              placeholder={t('emailPlaceholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <input
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {loading ? t('saving') : editandoId ? t('saveChanges') : t('addClient')}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarForm}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            {t('list')} <span className="text-zinc-500 font-normal">({clientesFiltrados.length}{busqueda && ` / ${clientes.length}`})</span>
          </h2>
          <input
            type="text"
            placeholder={t('search')}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>

        {clientesFiltrados.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">
            {busqueda ? t('noClientsMatch') : t('noClients')}
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
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => borrarCliente(c.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-medium transition"
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
    </div>
  )
}