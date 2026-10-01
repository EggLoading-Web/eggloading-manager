import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Egg Loading Manager',
  description: 'CRM para gestionar clientes y proyectos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  )
}