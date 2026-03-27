'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlergenoIcon } from '@/components/icons/AlergenoIcon';
import { AlergenosBadge } from '@/components/public/AlergenosBadge';
import { ALERGENOS } from '@/lib/types';
import type { Categoria, Plato, MenuDia, CodigoAlergeno } from '@/lib/types';

type CategoriaConPlatos = Categoria & { readonly platos: readonly Plato[] };

interface CartaContentProps {
  readonly categorias: readonly CategoriaConPlatos[];
  readonly menusDia: readonly MenuDia[];
}

const ALL_ALERGENOS = Object.keys(ALERGENOS) as CodigoAlergeno[];

export function CartaContent({ categorias, menusDia }: CartaContentProps) {
  const [activeFilters, setActiveFilters] = useState<ReadonlySet<CodigoAlergeno>>(
    new Set(),
  );

  const toggleFilter = (code: CodigoAlergeno) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const filteredCategorias = useMemo(() => {
    if (activeFilters.size === 0) return categorias;

    return categorias.map((cat) => ({
      ...cat,
      platos: cat.platos.filter((plato) =>
        Array.from(activeFilters).every((f) => !plato.alergenos.includes(f)),
      ),
    }));
  }, [categorias, activeFilters]);

  const defaultTab = categorias[0]?.id ?? '';

  if (categorias.length === 0) {
    return (
      <p className="py-16 text-center font-sans text-carbon/40">
        La carta no está disponible en este momento.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Allergen filter bar */}
      <AllergenFilterBar
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onClear={() => setActiveFilters(new Set())}
      />

      {/* Menú del día */}
      {menusDia.length > 0 && <MenuDelDiaSection menusDia={menusDia} />}

      {/* Category tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-crema border border-carbon/10 p-1 rounded-xl mb-6 w-full justify-start">
          {categorias.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="font-display text-base px-4 py-2 rounded-lg data-[state=active]:bg-terracota data-[state=active]:text-crema data-[state=active]:shadow-sm transition-all"
            >
              {cat.nombre}
            </TabsTrigger>
          ))}
        </TabsList>

        {filteredCategorias.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0 focus-visible:outline-none">
            {/* Category hero */}
            <CategoryHero categoria={cat} />

            {cat.platos.length === 0 ? (
              <p className="py-12 text-center font-sans text-carbon/40 text-sm">
                {activeFilters.size > 0
                  ? 'Ningún plato de esta categoría coincide con los filtros activos.'
                  : 'No hay platos disponibles en esta categoría.'}
              </p>
            ) : (
              <ul className="space-y-3 mt-6">
                {cat.platos.map((plato) => (
                  <DishCard key={plato.id} plato={plato} />
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Sticky allergen legend on mobile */}
      <div className="fixed bottom-16 left-0 right-0 z-20 md:hidden pointer-events-none">
        <div className="mx-4 pointer-events-auto">
          <details className="rounded-xl border border-carbon/10 bg-crema-light/95 backdrop-blur-sm shadow-lg text-xs font-sans">
            <summary className="px-4 py-2 cursor-pointer text-carbon/60 list-none flex items-center justify-between select-none">
              <span>Información sobre alérgenos</span>
              <span className="text-terracota">▾</span>
            </summary>
            <div className="px-4 pb-3 pt-1 text-carbon/50 leading-relaxed">
              Si tienes alguna alergia o intolerancia alimentaria, consulta con
              nuestro personal antes de realizar tu pedido. Elaboramos en cocinas
              donde se manipulan alérgenos.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

/* ── Category Hero ────────────────────────────────────────────────────────── */

interface CategoryHeroProps {
  readonly categoria: CategoriaConPlatos;
}

function CategoryHero({ categoria }: CategoryHeroProps) {
  if (categoria.imagen_url) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '21/8' }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url(${categoria.imagen_url})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 via-carbon/30 to-transparent" aria-hidden="true" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <h2 className="font-display text-3xl md:text-4xl text-crema-light leading-tight drop-shadow">
            {categoria.nombre}
          </h2>
          {categoria.descripcion && (
            <p className="mt-2 font-sans text-sm text-crema-light/80 max-w-xl leading-relaxed drop-shadow">
              {categoria.descripcion}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* Fallback: gradient banner when no image */
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-crema to-terracota/10 border border-terracota/20" style={{ minHeight: '120px' }}>
      <div className="absolute inset-0 texture-paper" aria-hidden="true" />
      <div className="relative p-6 md:p-8">
        <h2 className="font-display text-3xl md:text-4xl text-carbon leading-tight">
          {categoria.nombre}
        </h2>
        {categoria.descripcion && (
          <p className="mt-2 font-sans text-sm text-carbon/65 max-w-xl leading-relaxed">
            {categoria.descripcion}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Allergen Filter Bar ──────────────────────────────────────────────────── */

interface AllergenFilterBarProps {
  readonly activeFilters: ReadonlySet<CodigoAlergeno>;
  readonly onToggle: (code: CodigoAlergeno) => void;
  readonly onClear: () => void;
}

function AllergenFilterBar({ activeFilters, onToggle, onClear }: AllergenFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-crema border border-carbon/10">
      <p className="font-sans text-xs uppercase tracking-widest text-carbon/50 mb-3">
        Filtrar: mostrar solo sin&hellip;
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_ALERGENOS.map((codigo) => {
          const info = ALERGENOS[codigo];
          const isActive = activeFilters.has(codigo);
          return (
            <button
              key={codigo}
              type="button"
              onClick={() => onToggle(codigo)}
              aria-pressed={isActive}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-sans text-xs transition-all duration-150 select-none',
                isActive
                  ? 'bg-terracota text-crema border-terracota shadow-sm'
                  : 'bg-transparent text-carbon/60 border-carbon/20 hover:border-terracota/50 hover:text-carbon',
              ].join(' ')}
            >
              <AlergenoIcon code={codigo} size={14} className="shrink-0" />
              <span>{info.nombre}</span>
            </button>
          );
        })}
      </div>
      {activeFilters.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 font-sans text-xs text-terracota underline underline-offset-2 hover:text-terracota-dark transition-colors"
        >
          Quitar todos los filtros
        </button>
      )}
    </div>
  );
}

/* ── Menu del Dia Section ─────────────────────────────────────────────────── */

interface MenuDelDiaSectionProps {
  readonly menusDia: readonly MenuDia[];
}

function MenuDelDiaSection({ menusDia }: MenuDelDiaSectionProps) {
  return (
    <div className="rounded-2xl border border-terracota/20 bg-terracota/8 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-2 h-2 rounded-full bg-terracota" />
        <span className="font-sans text-xs tracking-widest uppercase text-terracota font-medium">
          Disponible hoy
        </span>
      </div>
      <h2 className="font-display text-3xl text-carbon mb-6">Menú del Día</h2>

      <div className="flex flex-col gap-4">
        {menusDia.map((menu) => (
          <div
            key={menu.id}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
          >
            <div className="flex-1">
              <p className="font-display text-xl text-carbon">{menu.nombre}</p>
              {menu.descripcion && (
                <p className="mt-1 font-sans text-sm text-carbon/60 leading-relaxed">
                  {menu.descripcion}
                </p>
              )}
            </div>
            <span className="shrink-0 font-display text-2xl text-terracota sm:ml-6">
              {menu.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 font-sans text-xs text-carbon/40">
        El menú del día incluye primer plato, segundo plato, postre o café y bebida.
        Disponible al mediodía de lunes a viernes.
      </p>
    </div>
  );
}

/* ── Dish Card ────────────────────────────────────────────────────────────── */

interface DishCardProps {
  readonly plato: Plato;
}

function DishCard({ plato }: DishCardProps) {
  const isSoldOut = !plato.disponible;

  return (
    <li className={['rounded-xl bg-crema-light border border-carbon/5 p-4 transition-opacity', isSoldOut ? 'opacity-50' : ''].join(' ')}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-display text-lg text-carbon leading-snug">
              {plato.nombre}
            </h3>
            {isSoldOut && (
              <Badge variant="destructive" className="text-[10px]">
                Agotado
              </Badge>
            )}
          </div>

          {plato.descripcion && (
            <p className="mt-1 font-sans text-sm text-carbon/60 leading-relaxed">
              {plato.descripcion}
            </p>
          )}

          {plato.alergenos.length > 0 && (
            <div className="mt-2">
              <AlergenosBadge alergenos={plato.alergenos} />
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center ml-2 pt-0.5">
          <span
            className="hidden sm:block border-b border-dotted border-carbon/20 w-12 mb-1 mx-2"
            aria-hidden="true"
          />
          <span className="font-display text-xl text-terracota whitespace-nowrap">
            {plato.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </li>
  );
}
