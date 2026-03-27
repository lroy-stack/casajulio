'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Download, Loader2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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

const ESTADO_OPTIONS: { value: 'todas' | EstadoReserva; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_presentado', label: 'No presentado' },
];

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

function exportCsv(reservas: readonly Reserva[], fecha: string) {
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
  a.download = `reservas-${fecha}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReservasPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate());
  const [estadoFilter, setEstadoFilter] = useState<'todas' | EstadoReserva>('todas');
  const [reservas, setReservas] = useState<readonly Reserva[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const fetchReservas = useCallback(async (date: Date, estado: 'todas' | EstadoReserva) => {
    setLoading(true);
    const fechaStr = format(date, 'yyyy-MM-dd');

    // Fetch filtered + total pending for the day
    const [filteredResult, pendingResult] = await Promise.all([
      supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fechaStr)
        .order('hora', { ascending: true })
        .then((r) => estado !== 'todas'
          ? supabase.from('reservas').select('*').eq('fecha', fechaStr).eq('estado', estado).order('hora', { ascending: true })
          : r
        ),
      supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', fechaStr)
        .eq('estado', 'pendiente'),
    ]);

    setReservas(filteredResult.data ?? []);
    setPendingCount(pendingResult.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReservas(selectedDate, estadoFilter);
  }, [selectedDate, estadoFilter, fetchReservas]);

  const handleUpdate = useCallback((updated: Reserva) => {
    setReservas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (updated.estado !== 'pendiente') {
      setPendingCount((n) => Math.max(0, n - 1));
    }
  }, []);

  function goDay(offset: number) {
    setSelectedDate((prev) => {
      const next = addDays(prev, offset);
      next.setHours(12, 0, 0, 0);
      return next;
    });
  }

  const fechaStr = format(selectedDate, 'yyyy-MM-dd');
  const dayLabel = getDayLabel(selectedDate);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="font-heading text-2xl md:text-3xl text-carbon">Reservas</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
          onClick={() => exportCsv(reservas, fechaStr)}
          disabled={reservas.length === 0}
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Prev / Next */}
        <Button variant="outline" size="icon-sm" onClick={() => goDay(-1)} title="Día anterior">
          <ChevronLeft className="size-4" />
        </Button>

        <Button variant="outline" size="icon-sm" onClick={() => goDay(1)} title="Día siguiente">
          <ChevronRight className="size-4" />
        </Button>

        {/* Day label + calendar picker */}
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

        {/* Quick shortcuts */}
        {!isToday(selectedDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(todayDate())}
            className="gap-1.5 text-xs"
          >
            <Clock className="size-3.5" />
            Hoy
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSelectedDate(addDays(todayDate(), 1)); }}
          className={`text-xs ${isTomorrow(selectedDate) ? 'border-terracota text-terracota' : ''}`}
        >
          Mañana
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-carbon/50 font-sans uppercase tracking-wider">Filtrar:</span>

        {/* Quick: Pendientes */}
        <button
          type="button"
          onClick={() => setEstadoFilter(estadoFilter === 'pendiente' ? 'todas' : 'pendiente')}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-sans transition-all',
            estadoFilter === 'pendiente'
              ? 'bg-yellow-400 border-yellow-400 text-yellow-900 font-semibold'
              : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50',
          ].join(' ')}
        >
          Pendientes
          {pendingCount > 0 && (
            <Badge className="bg-yellow-700 text-white text-[10px] px-1.5 py-0 h-4 min-w-0">
              {pendingCount}
            </Badge>
          )}
        </button>

        {/* Full estado select */}
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
      ) : reservas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-border gap-2">
          <p className="font-sans text-sm text-carbon/40">
            No hay reservas {estadoFilter !== 'todas' ? `con estado "${estadoFilter}"` : ''} para {dayLabel.toLowerCase()}.
          </p>
          {estadoFilter !== 'todas' && (
            <button
              type="button"
              onClick={() => setEstadoFilter('todas')}
              className="text-xs text-terracota underline"
            >
              Ver todas las reservas
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
              {reservas.map((reserva) => (
                <ReservaRow key={reserva.id} reserva={reserva} onUpdate={handleUpdate} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="font-sans text-xs text-carbon/40">
        {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'} · {dayLabel}
        {pendingCount > 0 && estadoFilter !== 'pendiente' && (
          <span className="text-yellow-600 ml-2">· {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  );
}
