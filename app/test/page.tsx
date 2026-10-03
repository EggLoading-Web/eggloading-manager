import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  const { data, error } = await supabase.from('clients').select('*')

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Test de conexión Supabase</h1>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {!error && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Conexión OK ✅</strong>
          <p>Clientes encontrados: {data?.length ?? 0}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
