-- ============================================================
-- Casa Julio — Row Level Security
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table categorias   enable row level security;
alter table platos       enable row level security;
alter table menus_dia    enable row level security;
alter table reservas     enable row level security;
alter table configuracion enable row level security;

-- ============================================================
-- categorias: lectura pública, escritura solo autenticados
-- ============================================================
drop policy if exists "categorias_public_select" on categorias;
drop policy if exists "categorias_admin_all"     on categorias;

create policy "categorias_public_select"
  on categorias for select
  using (true);

create policy "categorias_admin_all"
  on categorias for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- platos: lectura pública, escritura solo autenticados
-- ============================================================
drop policy if exists "platos_public_select" on platos;
drop policy if exists "platos_admin_all"     on platos;

create policy "platos_public_select"
  on platos for select
  using (true);

create policy "platos_admin_all"
  on platos for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- menus_dia: lectura pública, escritura solo autenticados
-- ============================================================
drop policy if exists "menus_public_select" on menus_dia;
drop policy if exists "menus_admin_all"     on menus_dia;

create policy "menus_public_select"
  on menus_dia for select
  using (true);

create policy "menus_admin_all"
  on menus_dia for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- reservas: INSERT anónimo, todo lo demás solo autenticados
-- ============================================================
drop policy if exists "reservas_public_insert" on reservas;
drop policy if exists "reservas_admin_all"      on reservas;

create policy "reservas_public_insert"
  on reservas for insert
  with check (true);

create policy "reservas_admin_all"
  on reservas for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- configuracion: lectura pública, escritura solo autenticados
-- ============================================================
drop policy if exists "config_public_select" on configuracion;
drop policy if exists "config_admin_all"     on configuracion;

create policy "config_public_select"
  on configuracion for select
  using (true);

create policy "config_admin_all"
  on configuracion for all
  using (auth.role() = 'authenticated');
