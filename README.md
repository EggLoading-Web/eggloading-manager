# 🥚 Egg Loading Manager

CRM full-stack para gestionar clientes y proyectos de un estudio freelance de desarrollo web.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)

## 📸 Capturas

> Agregá tus capturas acá. Guardá las imágenes en `public/` o `docs/` y reemplazá los nombres.

![Dashboard](./docs/dashboard.png)
![Clientes](./docs/clientes.png)
![Proyectos](./docs/proyectos.png)

## ✨ Features

- 🔐 **Autenticación** — Registro y login con email/contraseña (Supabase Auth)
- 👥 **Clientes** — CRUD completo con búsqueda por nombre, email o teléfono
- 📁 **Proyectos** — CRUD con estado (pendiente / en progreso / entregado), stack y cliente asociado
- 🔍 **Búsqueda y filtros** — Filtrá proyectos por estado y buscá por nombre, stack o cliente
- 📝 **Notas por proyecto** — Agregá notas con fecha a cada proyecto
- 📊 **Dashboard** — Métricas: total de clientes, proyectos y proyectos por estado
- 🔒 **RLS** — Cada usuario ve solo sus propios datos (Row Level Security)
- 📱 **Responsive** — Funciona en mobile, tablet y desktop

## 🛠️ Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Deploy | Vercel |

## 🚀 Correr localmente

### 1. Clonar el repo

```bash
git clone https://github.com/EggLoading-Web/eggloading-manager.git
cd eggloading-manager