import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { FRANJAS_HORARIAS, type ReservaFormData } from '@/lib/types';

function generateNumeroReserva(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `CJ-${random}`;
}

function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateStr}T00:00:00`);
  return date < today;
}

function validateFormData(
  body: unknown
): { valid: true; data: ReservaFormData } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Datos de formulario inválidos' };
  }

  const b = body as Record<string, unknown>;

  if (!b.nombre || typeof b.nombre !== 'string' || b.nombre.trim().length < 2) {
    return { valid: false, error: 'El nombre es obligatorio (mín. 2 caracteres)' };
  }
  if (!b.telefono || typeof b.telefono !== 'string' || b.telefono.trim().length < 6) {
    return { valid: false, error: 'El teléfono es obligatorio' };
  }
  if (!b.email || typeof b.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    return { valid: false, error: 'El email no es válido' };
  }
  if (!b.fecha || typeof b.fecha !== 'string') {
    return { valid: false, error: 'La fecha es obligatoria' };
  }
  if (!b.hora || typeof b.hora !== 'string') {
    return { valid: false, error: 'La hora es obligatoria' };
  }
  if (!b.comensales || typeof b.comensales !== 'number' || b.comensales < 1 || b.comensales > 12) {
    return { valid: false, error: 'El número de comensales debe ser entre 1 y 12' };
  }

  return {
    valid: true,
    data: {
      nombre: b.nombre.trim(),
      telefono: b.telefono.trim(),
      email: b.email.trim().toLowerCase(),
      fecha: b.fecha,
      hora: b.hora,
      comensales: b.comensales,
      alergenos_grupo: Array.isArray(b.alergenos_grupo) ? b.alergenos_grupo : [],
      peticion_especial: typeof b.peticion_especial === 'string' ? b.peticion_especial.trim() : '',
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const validation = validateFormData(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { data } = validation;

  if (isPastDate(data.fecha)) {
    return NextResponse.json(
      { error: 'No se puede reservar en una fecha pasada' },
      { status: 400 }
    );
  }

  if (!FRANJAS_HORARIAS.includes(data.hora as typeof FRANJAS_HORARIAS[number])) {
    return NextResponse.json(
      { error: 'Franja horaria no válida' },
      { status: 400 }
    );
  }

  try {
    // Check availability
    const { count, error: countError } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('fecha', data.fecha)
      .eq('hora', data.hora)
      .not('estado', 'in', '("cancelada","no_presentado")');

    if (countError) {
      return NextResponse.json(
        { error: 'Error al verificar disponibilidad' },
        { status: 500 }
      );
    }

    const { data: configData } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'max_mesas_por_franja')
      .single();

    const maxMesas = configData ? parseInt(configData.valor, 10) : 10;

    if ((count ?? 0) >= maxMesas) {
      return NextResponse.json(
        { error: 'Lo sentimos, esta franja horaria ya está completa' },
        { status: 409 }
      );
    }

    const numero_reserva = generateNumeroReserva();

    const { error: insertError } = await supabase.from('reservas').insert({
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email,
      fecha: data.fecha,
      hora: data.hora,
      comensales: data.comensales,
      alergenos_grupo: data.alergenos_grupo,
      peticion_especial: data.peticion_especial || null,
      estado: 'pendiente',
      numero_reserva,
    });

    if (insertError) {
      return NextResponse.json(
        { error: 'Error al crear la reserva' },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking)
    try {
      await resend.emails.send({
        from: 'Casa Julio <reservas@casajulio.es>',
        to: data.email,
        subject: 'Reserva confirmada - Casa Julio',
        html: buildConfirmationEmail({ ...data, numero_reserva }),
      });
    } catch {
      // Email failure should not fail the reservation
      console.error('Error enviando email de confirmación para', numero_reserva);
    }

    return NextResponse.json({ success: true, numero_reserva }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function buildConfirmationEmail(info: ReservaFormData & { numero_reserva: string }): string {
  return `
    <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;color:#1C1410;">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;color:#B85C38;margin-bottom:8px;">
        Casa Julio
      </h1>
      <p style="font-size:14px;color:#6B6560;margin-bottom:24px;">Reserva confirmada</p>
      <div style="background:#FAF7F2;border-radius:12px;padding:24px;border:1px solid #D9D0C4;">
        <p style="margin:0 0 4px;font-size:12px;color:#6B6560;">N.&ordm; de reserva</p>
        <p style="margin:0 0 16px;font-size:20px;font-weight:600;letter-spacing:2px;">${info.numero_reserva}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#6B6560;">Nombre</p>
        <p style="margin:0 0 16px;">${info.nombre}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#6B6560;">Fecha y hora</p>
        <p style="margin:0 0 16px;">${info.fecha} a las ${info.hora}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#6B6560;">Comensales</p>
        <p style="margin:0;">${info.comensales}</p>
      </div>
      <p style="margin-top:24px;font-size:13px;color:#6B6560;">
        Si necesitas modificar o cancelar tu reserva, llámanos al
        <strong>+34 971 71 06 70</strong>.
      </p>
    </div>
  `.trim();
}
