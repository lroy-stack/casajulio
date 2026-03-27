import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FRANJAS_HORARIAS } from '@/lib/types';

interface FranjaInfo {
  readonly reservadas: number;
  readonly max: number;
  readonly disponible: boolean;
}

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(`${dateStr}T00:00:00`);
  return !isNaN(date.getTime());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get('fecha');

  if (!fecha || !isValidDate(fecha)) {
    return NextResponse.json(
      { error: 'Parámetro "fecha" requerido en formato YYYY-MM-DD' },
      { status: 400 }
    );
  }

  try {
    const [reservasResult, configResult] = await Promise.all([
      supabase
        .from('reservas')
        .select('hora')
        .eq('fecha', fecha)
        .not('estado', 'in', '("cancelada","no_presentado")'),
      supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'max_mesas_por_franja')
        .single(),
    ]);

    if (reservasResult.error) {
      return NextResponse.json(
        { error: 'Error al consultar reservas' },
        { status: 500 }
      );
    }

    const maxMesas = configResult.data
      ? parseInt(configResult.data.valor, 10)
      : 10;

    const conteo: Record<string, number> = {};
    for (const row of reservasResult.data ?? []) {
      conteo[row.hora] = (conteo[row.hora] ?? 0) + 1;
    }

    const franjas: Record<string, FranjaInfo> = {};
    for (const hora of FRANJAS_HORARIAS) {
      const reservadas = conteo[hora] ?? 0;
      franjas[hora] = {
        reservadas,
        max: maxMesas,
        disponible: reservadas < maxMesas,
      };
    }

    return NextResponse.json({ franjas });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
