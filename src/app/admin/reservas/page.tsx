'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Download, Loader2, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReservaRow } from '@/components/admin/ReservaRow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ALERGENOS } from '@/lib/types';
import type { Reserva, EstadoReserva } from '@/lib/types';

/* ── Constants ─────────────────────────────────────────────────────────── */

const ESTADO_OPTIONS: { value: 'todas' | EstadoReserva; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_presentado', label: 'No presentado' },
];

type ViewMode = 'dia' | 'pendientes';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function todayDate(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

function getDayLabel(date: Date): string {
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  if (isYesterday(date)) return 'Ayer';
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

function exportCsv(reservas: readonly Reserva[], label: string) {
  const headers = [
    'N.º reserva', 'Nombre', 'Teléfono', 'Email',
    'Fecha', 'Hora', 'Comensales', 'Estado',
    'Alérgenos', 'Petición especial', 'Nota interna',
  ];
  const rows = reservas.map((r) => [
    r.numero_reserva, r.nombre, r.telefono, r.email, r.fecha, r.hora,
    String(r.comensales), r.estado,
    r.alergenos_grupo.map((a) => ALERGENOS[a]?.nombre ?? a).join('; '),
    r.peticion_especial ?? '', r.nota_interna ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservas-${label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Page                                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function AdminReservasPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('pendientes');

  // Day-view state
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate());
  const [estadoFilter, setEstadoFilter] = useState<'todas' | EstadoReserva>('todas');
  const [dayReservas, setDayReservas] = useState<readonly Reserva[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Pending-view state
  const [pendingReservas, setPendingReservas] = useState<readonly Reserva[]>([]);
  const [totalPending, setTotalPending] = useState(0);

  const [loading, setLoading] = useState(true);

  /* ── Fetch day reservations ─────────────────────────────────────────── */
  const fetchDayReservas = useCallback(async (date: Date, estado: 'todas' | EstadoReserva) => {
    setLoading(true);
    const fechaStr = format(date, 'yyyy-MM-dd');
    let query = supabase
      .from('reservas')
      .select('*')
      .eq('fecha', fechaStr)
      .order('hora', { ascending: true });
    if (estado !== 'todas') query = query.eq('estado', estado);
    const { data } = await query;
    setDayReservas(data ?? []);
    setLoading(false);
  }, []);

  /* ── Fetch ALL pending reservations ────────────────────────────────── */
  const fetchPendingReservas = useCallback(async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('estado', 'pendiente')
      .gte('fecha', today)          // solo desde hoy en adelante
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    const all = data ?? [];
    setPendingReservas(all);
    setTotalPending(all.length);
    setLoading(false);
  }, []);

  /* ── Also load total pending count for the badge ────────────────────── */
  const refreshPendingCount = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { count } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .gte('fecha', today);
    setTotalPending(count ?? 0);
  }, []);

  useEffect(() => {
    if (viewMode === 'dia') {
      fetchDayReservas(selectedDate, estadoFilter);
      refreshPendingCount();
    } else {
      fetchPendingReservas();
    }
  }, [viewMode, selectedDate, estadoFilter, fetchDayReservas, fetchPendingReservas, refreshPendingCount]);

  /* ── Update handlers ───────────────────────────────────────────────── */
  const handleUpdateDay = useCallback((updated: Reserva) => {
    setDayReservas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    refreshPendingCount();
  }, [refreshPendingCount]);

  const handleUpdatePending = useCallback((updated: Reserva) => {
    // If estado changed from pendiente, remove from pending list
    if (updated.estado !== 'pendiente') {
      setPendingReservas((prev) => prev.filter((r) => r.id !== updated.id));
      setTotalPending((n) => Math.max(0, n - 1));
    } else {
      setPendingReservas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  }, []);

  /* ── Day nav ───────────────────────────────────────────────────────── */
  function goDay(offset: number) {
    setSelectedDate((prev) => {
      const next = addDays(prev, offset);
      next.setHours(12, 0, 0, 0);
      return next;
    });
  }

  const fechaStr = format(selectedDate, 'yyyy-MM-dd');
  const dayLabel = getDayLabel(selectedDate);

  /* ══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="font-heading text-2xl md:text-3xl text-carbon">Reservas</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
          onClick={() => exportCsv(
            viewMode === 'dia' ? dayReservas : pendingReservas,
            viewMode === 'dia' ? fechaStr : 'pendientes'
          )}
          disabled={(viewMode === 'dia' ? dayReservas : pendingReservas).length === 0}
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center gap-1 p-1 bg-crema rounded-xl w-fit border border-border">
        <button
          type="button"
          onClick={() => setViewMode('pendientes')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all',
            viewMode === 'pendientes'
              ? 'bg-white shadow-sm text-carbon font-medium'
              : 'text-carbon/50 hover:text-carbon',
          ].join(' ')}
        >
          <AlertCircle className="size-4" />
          Pendientes
          {totalPending > 0 && (
            <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0 h-4 min-w-0">
              {totalPending}
            </Badge>
          )}
        </button>
        <button
          type="button"
          onClick={() => setViewMode('dia')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all',
            viewMode === 'dia'
              ? 'bg-white shadow-sm text-carbon font-medium'
              : 'text-carbon/50 hover:text-carbon',
          ].join(' ')}
        >
          <CalendarIcon className="size-4" />
          Por día
        </button>
      </div>

      {/* ── PENDING VIEW ─────────────────────────────────────────────── */}
      {viewMode === 'pendientes' && (
        <>
          <div className="flex items-center gap-2">
            <p className="font-sans text-sm text-carbon/60">
              {loading ? 'Cargando...' : (
                totalPending === 0
                  ? 'No hay reservas pendientes.'
                  : `${totalPending} reserva${totalPending !== 1 ? 's' : ''} pendiente${totalPending !== 1 ? 's' : ''} de confirmación`
              )}
            </p>
            {!loading && totalPending > 0 && (
              <button
                type="button"
                onClick={fetchPendingReservas}
                className="text-xs text-terracota hover:underline"
              >
                Actualizar
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-7 animate-spin text-terracota" />
            </div>
          ) : pendingReservas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-border gap-3">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-sans text-sm text-carbon/40">Todas las reservas están gestionadas.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Fecha</TableHead>
                    <TableHead className="w-16">Hora</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-16 text-center">Pers.</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Alérgenos</TableHead>
                    <TableHead className="hidden xl:table-cell">Petición</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReservas.map((reserva) => (
                    <ReservaRow
                      key={reserva.id}
                      reserva={reserva}
                      onUpdate={handleUpdatePending}
                      showDate
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* ── DAY VIEW ─────────────────────────────────────────────────── */}
      {viewMode === 'dia' && (
        <>
          {/* Date navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon-sm" onClick={() => goDay(-1)} title="Día anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => goDay(1)} title="Día siguiente">
              <ChevronRight className="size-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={<button type="button" />}
                className="flex h-9 items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-1 text-sm font-medium transition-colors hover:bg-muted capitalize"
              >
                <CalendarIcon className="size-4 text-carbon/40 shrink-0" />
                {dayLabel}
                {!isToday(selectedDate) && (
                  <span className="text-xs text-carbon/40 font-normal">
                    · {format(selectedDate, 'd MMM', { locale: es })}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      const d = new Date(date);
                      d.setHours(12, 0, 0, 0);
                      setSelectedDate(d);
                      setCalendarOpen(false);
                    }
                  }}
                  locale={es}
                />
              </PopoverContent>
            </Popover>

            {!isToday(selectedDate) && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(todayDate())} className="gap-1.5 text-xs">
                <Clock className="size-3.5" />
                Hoy
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(todayDate(), 1))}
              className={`text-xs ${isTomorrow(selectedDate) ? 'border-terracota text-terracota' : ''}`}
            >
              Mañana
            </Button>
          </div>

          {/* Estado filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-carbon/50 font-sans uppercase tracking-wider">Estado:</span>
            <Select
              value={estadoFilter}
              onValueChange={(v) => setEstadoFilter(v as 'todas' | EstadoReserva)}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-7 animate-spin text-terracota" />
            </div>
          ) : dayReservas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-border gap-2">
              <p className="font-sans text-sm text-carbon/40">
                No hay reservas {estadoFilter !== 'todas' ? `"${estadoFilter}"` : ''} para {dayLabel.toLowerCase()}.
              </p>
              {estadoFilter !== 'todas' && (
                <button type="button" onClick={() => setEstadoFilter('todas')} className="text-xs text-terracota underline">
                  Ver todas
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Hora</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-16 text-center">Pers.</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Alérgenos</TableHead>
                    <TableHead className="hidden xl:table-cell">Petición</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayReservas.map((reserva) => (
                    <ReservaRow key={reserva.id} reserva={reserva} onUpdate={handleUpdateDay} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="font-sans text-xs text-carbon/40">
            {dayReservas.length} {dayReservas.length === 1 ? 'reserva' : 'reservas'} · {dayLabel}
          </p>
        </>
      )}
    </div>
  );
}
