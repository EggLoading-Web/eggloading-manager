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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
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

    const datos = {
      name,
      email: email || null,
      phone: phone || null,
    }

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

  if (!user) {
    return <p style={{ padding: '2rem', fontFamily: 'system-ui' }}>Cargando...</p>
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</Link>
          <h1 style={{ margin: 0 }}>Clientes</h1>
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
          placeholder="Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.6rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar cliente'}
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

      <h2 style={{ marginTop: '2rem' }}>Lista ({clientes.length})</h2>

      {clientes.length === 0 ? (
        <p>No hay clientes todavía.</p>
      ) : (
        <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
          {clientes.map((c) => (
            <li key={c.id} style={{ padding: '0.75rem', border: '1px solid #eee', borderRadius: 6, marginBottom: '0.5rem' }}>
              <strong>{c.name}</strong>
              {c.email && <div style={{ fontSize: '0.85rem', color: '#666' }}>{c.email}</div>}
              {c.phone && <div style={{ fontSize: '0.85rem', color: '#666' }}>{c.phone}</div>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => empezarEdicion(c)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => borrarCliente(c.id)}
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