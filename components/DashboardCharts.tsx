'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'

type ChartsProps = {
  pendiente: number
  enProgreso: number
  entregado: number
  labels: {
    pending: string
    inProgress: string
    delivered: string
  }
}

export function StatusBarChart({ pendiente, enProgreso, entregado, labels }: ChartsProps) {
  const data = [
    { name: labels.pending, value: pendiente, fill: '#f59e0b' },
    { name: labels.inProgress, value: enProgreso, fill: '#2563eb' },
    { name: labels.delivered, value: entregado, fill: '#16a34a' },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold mb-4">
        {labels.pending} / {labels.inProgress} / {labels.delivered}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(120, 120, 120, 0.1)' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e4e4e7',
              fontSize: 13,
              background: 'white',
              color: '#18181b',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatusPieChart({ pendiente, enProgreso, entregado }: ChartsProps) {
  const data = [
    { name: 'Pendiente', value: pendiente, fill: '#f59e0b' },
    { name: 'En progreso', value: enProgreso, fill: '#2563eb' },
    { name: 'Entregado', value: entregado, fill: '#16a34a' },
  ].filter((d) => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-4">Distribución</h3>
        <div className="h-[260px] flex items-center justify-center text-zinc-400 text-sm">
          No hay proyectos todavía
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold mb-4">Distribución</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e4e4e7',
              fontSize: 13,
              background: 'white',
              color: '#18181b',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
