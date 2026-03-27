-- ============================================================
-- Casa Julio — Migración inicial
-- ============================================================

-- Categorias
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  imagen_url text,
  orden int default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Platos
create table if not exists platos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete cascade,
  nombre text not null,
  descripcion text,
  precio decimal(6,2),
  alergenos text[] default '{}',
  disponible boolean default true,
  orden int default 0,
  created_at timestamptz default now()
);

-- Menús del día
create table if not exists menus_dia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio decimal(6,2),
  descripcion text,
  activo boolean default true,
  dias_semana text[] default '{lunes,martes,miercoles,jueves,viernes,sabado,domingo}'
);

-- Reservas
create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  email text not null,
  fecha date not null,
  hora time not null,
  comensales int not null,
  alergenos_grupo text[] default '{}',
  peticion_especial text,
  estado text default 'pendiente'
    check (estado in ('pendiente','confirmada','completada','cancelada','no_presentado')),
  nota_interna text,
  numero_reserva text unique not null,
  created_at timestamptz default now()
);

-- Configuración
create table if not exists configuracion (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  valor text not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- Seed: configuración base
-- ============================================================
insert into configuracion (clave, valor) values
  ('tagline',               'Cocina de siempre, en el corazón de Palma'),
  ('sobre_nosotros',        'Casa Julio nació hace más de treinta años de la mano de Julio y Carmen, un matrimonio mallorquín con el sueño sencillo de cocinar bien y hacer sentir a la gente como en casa. Lo que empezó como un comedor familiar en el barrio de Santa Catalina se ha convertido en uno de los rincones más queridos de Palma.

Aquí no inventamos nada: respetamos el producto, honramos la temporada y recuperamos las recetas que nuestras madres sabían de memoria. Los arroces se hacen a fuego lento, el pan llega cada mañana del horno de enfrente y el vino viene de bodegas que conocemos por su nombre. Eso es todo lo que necesitamos.'),
  ('telefono',              '+34 971 71 06 70'),
  ('direccion',             'Carrer de la Previsió, 4, 07001 Palma'),
  ('email',                 'hola@casajulio.es'),
  ('maps_embed_url',        ''),
  ('instagram_url',         ''),
  ('facebook_url',          ''),
  ('tripadvisor_url',       ''),
  ('max_mesas_por_franja',  '4'),
  ('dias_cerrado',          'martes')
on conflict (clave) do nothing;

-- ============================================================
-- Seed: categorías de ejemplo con imágenes Unsplash
-- ============================================================
insert into categorias (nombre, descripcion, imagen_url, orden) values
  ('Entrantes',
   'Pa amb oli con embutidos artesanales, croquetas de la abuela, boquerones en vinagre y ensaladas de temporada con producto local.',
   'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=1200&q=80',
   0),
  ('Arroces y fideuás',
   'Nuestra especialidad. Arroz brut mallorquín, paella de marisco, arroz meloso de sepia y tinta, fideuá de gambas y calamares.',
   'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&q=80',
   1),
  ('Carnes y pescados',
   'Porcella asada al horno de leña, cordero a la brasa, lubina a la sal, dorada al horno con patatas panaderas y verduras de temporada.',
   'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1200&q=80',
   2),
  ('Postres caseros',
   'Ensaïmada rellena de cabello de ángel, coca de albaricoque, helado artesanal de almendra mallorquina y flan de huevo de la casa.',
   'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80',
   3)
on conflict do nothing;

-- ============================================================
-- Seed: menú del día
-- ============================================================
insert into menus_dia (nombre, precio, descripcion, activo, dias_semana) values
  ('Menú del día',
   16.00,
   'Primer plato a elegir entre 3 opciones · Segundo plato a elegir entre 3 opciones · Postre o café · Pan y bebida incluidos',
   true,
   '{lunes,miercoles,jueves,viernes}')
on conflict do nothing;

-- ============================================================
-- Seed: platos de ejemplo
-- ============================================================
do $$
declare
  cat_entrantes   uuid;
  cat_arroces     uuid;
  cat_carnes      uuid;
  cat_postres     uuid;
begin
  select id into cat_entrantes   from categorias where nombre = 'Entrantes'         limit 1;
  select id into cat_arroces     from categorias where nombre = 'Arroces y fideuás'  limit 1;
  select id into cat_carnes      from categorias where nombre = 'Carnes y pescados'  limit 1;
  select id into cat_postres     from categorias where nombre = 'Postres caseros'    limit 1;

  -- Entrantes
  insert into platos (categoria_id, nombre, descripcion, precio, alergenos, orden) values
    (cat_entrantes, 'Pa amb oli mallorquín',
     'Pan de payés tostado, aceite de oliva virgen extra, tomate de ramallet y embutidos artesanales de la isla.',
     9.50, '{gluten,lacteos}', 0),
    (cat_entrantes, 'Croquetas de la abuela',
     'Croquetas cremosas de jamón ibérico y pollo de corral, rebozadas en panko. Servidas con alioli casero.',
     8.50, '{gluten,lacteos,huevos}', 1),
    (cat_entrantes, 'Ensalada de temporada',
     'Lechugas del huerto, tomates cherry, pepino, cebolla morada y aceitunas arbequinas. Aliñada al momento.',
     7.50, '{}', 2),
    (cat_entrantes, 'Boquerones en vinagre',
     'Boquerones marinados con ajo, perejil y aceite de oliva. Servidos con pan tostado.',
     8.00, '{pescado,gluten}', 3)
  on conflict do nothing;

  -- Arroces
  insert into platos (categoria_id, nombre, descripcion, precio, alergenos, orden) values
    (cat_arroces, 'Arroz brut mallorquín',
     'Arroz caldoso con carne de cerdo, morcilla, col, pimiento rojo y especias tradicionales de la isla. La receta de siempre.',
     16.50, '{gluten}', 0),
    (cat_arroces, 'Paella de marisco',
     'Arroz socarrat con gambas rojas, mejillones, almejas y calamar. Caldo de pescado de roca casero.',
     19.50, '{mariscos,moluscos,pescado}', 1),
    (cat_arroces, 'Arroz meloso de sepia y tinta',
     'Arroz cremoso con sepia fresca, su tinta y un toque de ajo negro. Una receta con carácter.',
     17.50, '{moluscos}', 2),
    (cat_arroces, 'Fideuá de gambas',
     'Fideos finos socarrats con gambas de Sóller, calamar y alioli de limón.',
     17.00, '{gluten,mariscos}', 3)
  on conflict do nothing;

  -- Carnes y pescados
  insert into platos (categoria_id, nombre, descripcion, precio, alergenos, orden) values
    (cat_carnes, 'Porcella asada al horno de leña',
     'Lechón mallorquín asado lentamente con hierbas aromáticas. Piel crujiente, carne jugosa. Guarnición de patatas al horno.',
     22.00, '{}', 0),
    (cat_carnes, 'Cordero a la brasa',
     'Paletilla de cordero mallorquín a la brasa con romero, tomillo y ajos tiernos. Guarnición de verduras de temporada.',
     21.00, '{}', 1),
    (cat_carnes, 'Lubina a la sal',
     'Lubina fresca entera cocinada en costra de sal gruesa. Servida con aceite de oliva virgen extra y limón.',
     23.00, '{pescado}', 2),
    (cat_carnes, 'Dorada al horno',
     'Dorada del Mediterráneo con patatas panaderas, cebolla, pimiento verde y un chorro de vino blanco.',
     20.00, '{pescado}', 3)
  on conflict do nothing;

  -- Postres
  insert into platos (categoria_id, nombre, descripcion, precio, alergenos, orden) values
    (cat_postres, 'Ensaïmada de cabello de ángel',
     'Ensaïmada mallorquina artesanal rellena de cabello de ángel. Elaborada cada mañana en el obrador de enfrente.',
     5.50, '{gluten,lacteos,huevos}', 0),
    (cat_postres, 'Flan de huevo de la casa',
     'Flan casero de huevo con caramelo tostado. La receta de la abuela Carmen, sin más secreto que el tiempo.',
     4.50, '{lacteos,huevos}', 1),
    (cat_postres, 'Helado de almendra mallorquina',
     'Helado artesanal elaborado con almendras de la isla tostadas. Textura cremosa, sabor auténtico.',
     5.00, '{frutos_secos,lacteos}', 2),
    (cat_postres, 'Coca de albaricoque',
     'Coca mallorquina de temporada con albaricoques frescos, azúcar y canela. Solo cuando hay albaricoques.',
     5.50, '{gluten,huevos,lacteos}', 3)
  on conflict do nothing;
end;
$$;
