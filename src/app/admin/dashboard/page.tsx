'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/admin/StatCard';
import { ReservaCard } from '@/components/admin/ReservaCard';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  CalendarPlus,
  UtensilsCrossed,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { FRANJAS_HORARIAS } from '@/lib/types';
import type { Reserva } from '@/lib/types';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getFullSlots(reservas: readonly Reserva[]): readonly string[] {
  const countBySlot = FRANJAS_HORARIAS.reduce<Record<string, number>>(
    (acc, slot) => ({
      ...acc,
      [slot]: reservas.filter(
        (r) => r.hora === slot && r.estado !== 'cancelada'
      ).length,
    }),
    {}
  );

  return Object.entries(countBySlot)
    .filter(([, count]) => count >= 3)
    .map(([slot]) => slot);
}

export default function DashboardPage() {
  const [todayReservas, setTodayReservas] = useState<Reserva[]>([]);
  const [tomorrowCount, setTomorrowCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const today = todayStr();
      const tomorrow = tomorrowStr();

      const [todayRes, tomorrowRes, pendingRes] = await Promise.all([
        supabase
          .from('reservas')
          .select('*')
          .eq('fecha', today)
          .order('hora', { ascending: true }),
        supabase
          .from('reservas')
          .select('*', { count: 'exact', head: true })
          .eq('fecha', tomorrow)
          .neq('estado', 'cancelada'),
        supabase
          .from('reservas')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'pendiente'),
      ]);

      setTodayReservas((todayRes.data as Reserva[]) ?? []);
      setTomorrowCount(tomorrowRes.count ?? 0);
      setPendingCount(pendingRes.count ?? 0);
      setLoading(false);
    }

    fetchData();
  }, []);

  const today = todayStr();
  const fullSlots = getFullSlots(todayReservas);
  const activeToday = todayReservas.filter((r) => r.estado !== 'cancelada');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-terracota" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-carbon">
          Bienvenido
        </h1>
        <p className="text-sm text-carbon/60 mt-1 capitalize">
          {formatDateSpanish(today)}
        </p>
      </div>

      {/* Alert for full slots */}
      {fullSlots.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Franjas casi completas
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Las franjas de{' '}
              <strong>{fullSlots.join(', ')}</strong>{' '}
              tienen 3 o más reservas hoy.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Reservas hoy"
          value={activeToday.length}
          icon={CalendarDays}
          color="bg-terracota"
        />
        <StatCard
          title="Reservas mañana"
          value={tomorrowCount}
          icon={CalendarPlus}
          color="bg-oliva"
        />
        <StatCard
          title="Pendientes de confirmar"
          value={pendingCount}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
      </div>

      {/* Today's reservations */}
      <section>
        <h2 className="font-heading text-xl text-carbon mb-3">
          Reservas de hoy
        </h2>
        {todayReservas.length === 0 ? (
          <p className="text-sm text-carbon/50 bg-white rounded-xl p-6 text-center">
            No hay reservas para hoy.
          </p>
        ) : (
          <div className="grid gap-2">
            {todayReservas.map((reserva) => (
              <ReservaCard
                key={reserva.id}
                reserva={reserva}
                onUpdate={(updated) =>
                  setTodayReservas((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-heading text-xl text-carbon mb-3">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/reservas">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="size-4" />
              Gestionar reservas
            </Button>
          </Link>
          <Link href="/admin/carta">
            <Button variant="outline" className="gap-2">
              <UtensilsCrossed className="size-4" />
              Editar carta
            </Button>
          </Link>
          <Link href="/admin/contenido">
            <Button variant="outline" className="gap-2">
              <FileText className="size-4" />
              Editar contenido
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
