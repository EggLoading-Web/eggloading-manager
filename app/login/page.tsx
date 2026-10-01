'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/clientes')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
      </button>
    </div>
  )
}