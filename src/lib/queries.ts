import { createSupabaseServer } from '@/lib/supabase-server';
import type { Categoria, Plato, MenuDia, Reserva, Configuracion } from '@/lib/types';

export async function getCategorias(): Promise<readonly Categoria[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) {
    throw new Error(`Error fetching categorías: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}

export async function getPlatosByCategoria(categoriaId: string): Promise<readonly Plato[]> {
  if (!categoriaId) {
    throw new Error('categoriaId is required');
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('platos')
    .select('*')
    .eq('categoria_id', categoriaId)
    .eq('disponible', true)
    .order('orden', { ascending: true });

  if (error) {
    throw new Error(`Error fetching platos for category ${categoriaId}: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}

export async function getCartaCompleta(): Promise<
  readonly (Categoria & { platos: readonly Plato[] })[]
> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('categorias')
    .select('*, platos(*)')
    .eq('activo', true)
    .eq('platos.disponible', true)
    .order('orden', { ascending: true });

  if (error) {
    throw new Error(`Error fetching carta completa: ${error.message}`);
  }

  const categorias = (data ?? []).map((categoria) => {
    const platos = ((categoria.platos as Plato[]) ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden);

    return Object.freeze({
      ...categoria,
      platos: Object.freeze(platos),
    } as Categoria & { platos: readonly Plato[] });
  });

  return Object.freeze(categorias);
}

export async function getAllPlatos(): Promise<readonly Plato[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('platos')
    .select('*')
    .order('orden', { ascending: true });

  if (error) {
    throw new Error(`Error fetching platos: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}

export async function getMenusDia(): Promise<readonly MenuDia[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('menus_dia')
    .select('*')
    .eq('activo', true);

  if (error) {
    throw new Error(`Error fetching menús del día: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}

export async function getConfiguracion(): Promise<Record<string, string>> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('configuracion')
    .select('clave, valor');

  if (error) {
    throw new Error(`Error fetching configuración: ${error.message}`);
  }

  const config = (data as Pick<Configuracion, 'clave' | 'valor'>[] ?? []).reduce<
    Record<string, string>
  >((acc, row) => {
    return { ...acc, [row.clave]: row.valor };
  }, {});

  return config;
}

export async function getReservasPorFranjaYFecha(
  fecha: string,
  hora: string
): Promise<number> {
  if (!fecha || !hora) {
    throw new Error('fecha and hora are required');
  }

  const supabase = await createSupabaseServer();
  const { count, error } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('fecha', fecha)
    .eq('hora', hora)
    .neq('estado', 'cancelada');

  if (error) {
    throw new Error(
      `Error counting reservas for ${fecha} ${hora}: ${error.message}`
    );
  }

  return count ?? 0;
}

export async function getReservasHoy(): Promise<readonly Reserva[]> {
  const today = new Date().toISOString().split('T')[0];

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', today)
    .order('hora', { ascending: true });

  if (error) {
    throw new Error(`Error fetching reservas de hoy: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}

export async function getReservasManana(): Promise<readonly Reserva[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('fecha', tomorrowStr)
    .order('hora', { ascending: true });

  if (error) {
    throw new Error(`Error fetching reservas de mañana: ${error.message}`);
  }

  return Object.freeze(data ?? []);
}
