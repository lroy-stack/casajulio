# Casa Julio — Web Restaurante

Sitio web completo para **Restaurante Casa Julio**, Palma de Mallorca. Incluye landing page, carta digital con alérgenos, sistema de reservas en tiempo real y panel de administración.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Estilos | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Emails | Resend |
| i18n | next-intl — ES · DE · EN |
| Deploy | Vercel (región `cdg1` — Europa) |

---

## Funcionalidades

### Público
- **Landing page** — Hero, Sobre nosotros, preview de carta, formulario de reservas, cómo llegar
- **Carta digital** — Categorías con hero image, 14 alérgenos EU con filtros, menú del día
- **Reservas** — Formulario en 2 pasos, disponibilidad en tiempo real, email de confirmación, descarga iCal
- **i18n** — Español, Alemán, Inglés con selector en navbar y bottom bar

### Admin (`/admin`)
- **Dashboard** — Reservas de hoy con acciones rápidas (confirmar/cancelar)
- **Gestión de reservas** — Vista global de pendientes + navegación por día (◀▶)
- **Editor de carta** — CRUD de categorías, platos y menú del día; toggle disponible/agotado
- **Editor de contenido** — Tagline, sobre nosotros, horarios, contacto, redes sociales, config de reservas

---

## Variables de entorno

Copia `.env.example` como `.env.local` y rellena los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) | Dashboard → Settings → API |
| `RESEND_API_KEY` | Clave de API de Resend | [resend.com/api-keys](https://resend.com/api-keys) |

> `SUPABASE_SERVICE_ROLE_KEY` solo se necesita para el script de creación de usuarios. **No añadir a Vercel.**

---

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Ejecuta las migraciones en el SQL Editor de tu proyecto Supabase:

```bash
# En orden:
supabase/migrations/20260327000001_initial_schema.sql   # tablas + seed
supabase/migrations/20260327000002_rls_policies.sql     # RLS
supabase/migrations/20260327000003_real_data.sql        # datos reales
```

O con la CLI (si tienes el proyecto vinculado):

```bash
supabase db push --dns-resolver https --password 'TU_PASSWORD'
```

### 3. Crear usuario administrador

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/create-admin-user.mjs
```

Credenciales creadas por el script:
- Email: `demo@casajulio.es`
- Password: `CasaJulio2026!`

### 4. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Schema de base de datos

```
categorias     — nombre, descripcion, imagen_url, orden, activo
platos         — categoria_id, nombre, descripcion, precio, alergenos[], disponible, orden
menus_dia      — nombre, precio, descripcion, activo, dias_semana[]
reservas       — nombre, telefono, email, fecha, hora, comensales, alergenos_grupo[],
                 peticion_especial, estado, nota_interna, numero_reserva
configuracion  — clave/valor (tagline, horarios, contacto, redes sociales, max_mesas)
```

**RLS:** `categorias`, `platos`, `menus_dia` y `configuracion` son de lectura pública. `reservas` permite INSERT anónimo y operaciones completas solo a usuarios autenticados.

---

## Despliegue en Vercel

### 1. Conectar el repositorio

En [vercel.com/new](https://vercel.com/new), importa el repo `lroy-stack/casajulio`.

### 2. Añadir variables de entorno

En Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
RESEND_API_KEY
```

### 3. Configurar dominio de email en Resend

Para enviar emails desde `reservas@casajulio.es`:
1. Añade el dominio en [resend.com/domains](https://resend.com/domains)
2. Añade los registros DNS indicados
3. Verifica el dominio

Durante desarrollo puedes usar el sandbox de Resend (envía solo a emails verificados).

### 4. Deploy

Vercel detecta automáticamente Next.js. El archivo `vercel.json` configura la región europea (`cdg1`) y security headers.

```bash
git push origin main  # activa el deploy automáticamente
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── [locale]/          # páginas públicas (landing, carta, reservas)
│   ├── admin/             # panel de administración
│   └── api/               # route handlers (reservas, disponibilidad)
├── components/
│   ├── public/            # Hero, Carta, Reservas, Footer, LanguageSwitcher...
│   ├── admin/             # ReservaCard, ReservaRow, AdminSidebar...
│   └── ui/                # componentes shadcn/ui
├── i18n/                  # routing.ts, request.ts, navigation.ts
├── lib/                   # supabase.ts, supabase-server.ts, resend.ts, types.ts
└── middleware.ts           # auth admin + i18n routing
messages/
├── es.json
├── de.json
└── en.json
supabase/
└── migrations/
```

---

## Comandos útiles

```bash
npm run dev          # servidor de desarrollo (Turbopack)
npm run build        # build de producción
npm run lint         # linter
supabase db push     # aplicar migraciones al proyecto remoto
```

---

## Notas para producción

- El email remitente está en `src/app/api/reservas/route.ts` — cámbialo si usas otro dominio
- `max_mesas_por_franja` (por defecto: 4) se configura desde `/admin/contenido`
- Las imágenes de categorías en la carta son URLs de Unsplash — reemplazables desde `/admin/carta`
- El restaurante está configurado como abierto todos los días 13:00–23:00; ajusta `dias_cerrado` en la tabla `configuracion` si cambia el horario
