import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { EstadoReserva, Reserva } from '@/lib/types';

const ESTADOS_VALIDOS: readonly EstadoReserva[] = [
  'pendiente',
  'confirmada',
  'completada',
  'cancelada',
  'no_presentado',
];

function isEstadoValido(value: unknown): value is EstadoReserva {
  return typeof value === 'string' && ESTADOS_VALIDOS.includes(value as EstadoReserva);
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (!b.id || typeof b.id !== 'string') {
    return NextResponse.json({ error: 'El campo id es obligatorio' }, { status: 400 });
  }

  if (b.estado !== undefined && !isEstadoValido(b.estado)) {
    return NextResponse.json(
      { error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (b.estado !== undefined) updates.estado = b.estado;
  if (typeof b.nota_interna === 'string') updates.nota_interna = b.nota_interna.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay campos a actualizar' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reservas')
    .update(updates)
    .eq('id', b.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar la reserva' }, { status: 500 });
  }

  return NextResponse.json(data as Reserva);
}
