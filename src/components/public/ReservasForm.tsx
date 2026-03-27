'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { es, de, enUS, type Locale } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { CalendarIcon, Loader2, CheckCircle, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DATE_FNS_LOCALES: Record<string, Locale> = { es, de, en: enUS };

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  FRANJAS_HORARIAS,
  ALERGENOS,
  type CodigoAlergeno,
  type ReservaFormData,
} from '@/lib/types';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface FranjaInfo {
  readonly reservadas: number;
  readonly max: number;
  readonly disponible: boolean;
}

type DisponibilidadMap = Readonly<Record<string, FranjaInfo>>;

interface ConfirmacionData {
  readonly numero_reserva: string;
  readonly nombre: string;
  readonly email: string;
  readonly fecha: Date;
  readonly hora: string;
  readonly comensales: number;
}

/* ── Constants ──────────────────────────────────────────────────────────── */

const COMENSALES_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const ALERGENO_ENTRIES = Object.entries(ALERGENOS) as ReadonlyArray<
  [CodigoAlergeno, { nombre: string; emoji: string }]
>;

/* ── Helpers ────────────────────────────────────────────────────────────── */

function buildMinDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildMaxDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildIcal(data: ConfirmacionData): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = format(data.fecha, 'yyyyMMdd');
  const [hh, mm] = data.hora.split(':');
  const startTime = `${dateStr}T${pad(Number(hh))}${pad(Number(mm))}00`;
  const endHour = Number(hh) + 2;
  const endTime = `${dateStr}T${pad(endHour)}${pad(Number(mm))}00`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Casa Julio//Reservas//ES',
    'BEGIN:VEVENT',
    `UID:${data.numero_reserva}@casajulio.es`,
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
    `SUMMARY:Reserva en Casa Julio (${data.numero_reserva})`,
    `DESCRIPTION:${data.comensales} ${data.comensales === 1 ? 'persona' : 'personas'}`,
    'LOCATION:Carrer de la Previsió\\, 4\\, 07001 Palma',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadIcal(data: ConfirmacionData) {
  const content = buildIcal(data);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reserva-casa-julio-${data.numero_reserva}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Stepper ────────────────────────────────────────────────────────────── */

function Stepper({ step, label1, label2 }: { step: 1 | 2; label1: string; label2: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          step >= 1 ? 'bg-terracota text-crema-light' : 'bg-carbon/10 text-carbon/40'
        }`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <span className="text-[10px] font-sans text-carbon/50 tracking-wide">{label1}</span>
      </div>

      <div className={`h-px w-12 mb-4 transition-colors ${step >= 2 ? 'bg-terracota' : 'bg-carbon/15'}`} />

      <div className="flex flex-col items-center gap-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          step >= 2 ? 'bg-terracota text-crema-light' : 'bg-carbon/10 text-carbon/40'
        }`}>
          2
        </div>
        <span className="text-[10px] font-sans text-carbon/50 tracking-wide">{label2}</span>
      </div>
    </div>
  );
}

/* ── Inline error ───────────────────────────────────────────────────────── */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function ReservasForm() {
  const t = useTranslations('reservas');
  const locale = useLocale();
  const dateFnsLocale = DATE_FNS_LOCALES[locale] ?? es;

  // Step state
  const [step, setStep] = useState<1 | 2>(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Step 1 fields
  const [fecha, setFecha] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState('');
  const [comensales, setComensales] = useState(2);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadMap>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Step 2 fields
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [alergenos, setAlergenos] = useState<readonly CodigoAlergeno[]>([]);
  const [peticionEspecial, setPeticionEspecial] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionData | null>(null);

  /* ── Validation ─────────────────────────────────────────────────────── */

  const ERRORS_STEP1: Record<string, string | undefined> = {
    fecha: !fecha ? t('error_fecha') : undefined,
    hora: !hora ? t('error_hora') : undefined,
    comensales: comensales < 1 || comensales > 12 ? t('error_fecha') : undefined,
  };

  const ERRORS_STEP2: Record<string, string | undefined> = {
    nombre: !nombre.trim() || nombre.trim().length < 2 ? t('error_nombre') : undefined,
    telefono: !telefono.trim() || telefono.trim().length < 6 ? t('error_telefono') : undefined,
    email: !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t('error_email') : undefined,
  };

  const getError = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    return step === 1 ? ERRORS_STEP1[field] : ERRORS_STEP2[field];
  };

  const markTouched = (fields: string[]) => {
    setTouched((prev) => {
      const next = { ...prev };
      for (const f of fields) next[f] = true;
      return next;
    });
  };

  /* ── Availability ───────────────────────────────────────────────────── */

  const fetchDisponibilidad = useCallback(async (selectedDate: Date) => {
    const fechaStr = format(selectedDate, 'yyyy-MM-dd');
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/reservas/disponibilidad?fecha=${fechaStr}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDisponibilidad(json.franjas ?? {});
    } catch {
      toast.error('No se pudo cargar la disponibilidad. Inténtalo de nuevo.');
      setDisponibilidad({});
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = useCallback(
    (selected: Date | undefined) => {
      setFecha(selected);
      setHora('');
      setCalendarOpen(false);
      if (selected) fetchDisponibilidad(selected);
      else setDisponibilidad({});
    },
    [fetchDisponibilidad]
  );

  /* ── Navigation ─────────────────────────────────────────────────────── */

  function handleNext() {
    markTouched(Object.keys(ERRORS_STEP1));
    const hasErrors = Object.values(ERRORS_STEP1).some(Boolean);
    if (!hasErrors) setStep(2);
  }

  function handleBack() {
    setStep(1);
    setTouched({});
  }

  /* ── Submit ─────────────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    markTouched(Object.keys(ERRORS_STEP2));
    const hasErrors = Object.values(ERRORS_STEP2).some(Boolean);
    if (hasErrors) return;

    const formData: ReservaFormData = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      fecha: format(fecha!, 'yyyy-MM-dd'),
      hora,
      comensales,
      alergenos_grupo: alergenos,
      peticion_especial: peticionEspecial.trim(),
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Error al crear la reserva');
        return;
      }
      setConfirmacion({
        numero_reserva: json.numero_reserva,
        nombre: formData.nombre,
        email: formData.email,
        fecha: fecha!,
        hora,
        comensales,
      });
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Reset ──────────────────────────────────────────────────────────── */

  function resetForm() {
    setStep(1);
    setTouched({});
    setFecha(undefined);
    setHora('');
    setComensales(2);
    setDisponibilidad({});
    setNombre('');
    setTelefono('');
    setEmail('');
    setAlergenos([]);
    setPeticionEspecial('');
    setConfirmacion(null);
  }

  /* ── Confirmation screen ────────────────────────────────────────────── */

  if (confirmacion) {
    return (
      <section id="reservas" className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-crema-light rounded-2xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="size-14 text-terracota" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="font-display text-4xl text-carbon">{t('confirmada_titulo')}</h2>
              <p className="mt-2 font-sans text-sm text-carbon/55">{t('confirmada_subtitulo')}</p>
            </div>

            <div className="bg-crema rounded-xl px-6 py-4 border border-terracota/20">
              <p className="font-sans text-xs text-carbon/45 uppercase tracking-widest mb-1">{t('numero_label')}</p>
              <p className="font-display text-3xl text-terracota tracking-[0.15em]">{confirmacion.numero_reserva}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-crema rounded-lg p-3">
                <p className="font-sans text-[10px] text-carbon/40 uppercase tracking-wider mb-0.5">{t('fecha_label')}</p>
                <p className="font-sans text-sm font-medium text-carbon capitalize">
                  {format(confirmacion.fecha, 'd MMM', { locale: dateFnsLocale })}
                </p>
              </div>
              <div className="bg-crema rounded-lg p-3">
                <p className="font-sans text-[10px] text-carbon/40 uppercase tracking-wider mb-0.5">{t('hora_label')}</p>
                <p className="font-sans text-sm font-medium text-carbon">{confirmacion.hora}</p>
              </div>
              <div className="bg-crema rounded-lg p-3">
                <p className="font-sans text-[10px] text-carbon/40 uppercase tracking-wider mb-0.5">{t('comensales_label')}</p>
                <p className="font-sans text-sm font-medium text-carbon">{confirmacion.comensales}</p>
              </div>
            </div>

            <p className="font-sans text-xs text-carbon/50 leading-relaxed">
              {t('confirmada_email')}{' '}
              <span className="font-medium text-carbon/70">{confirmacion.email}</span>.
              <br />
              {t('confirmada_cancelar')}{' '}
              <a href="tel:+34971710670" className="text-terracota hover:underline">+34 971 71 06 70</a>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => downloadIcal(confirmacion)}>
                <Download className="size-4" />
                {t('ical')}
              </Button>
              <Button type="button" className="flex-1 gap-2 bg-terracota hover:bg-terracota-dark text-crema-light" onClick={resetForm}>
                <RotateCcw className="size-4" />
                {t('nueva_reserva')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Form ───────────────────────────────────────────────────────────── */

  return (
    <section id="reservas" className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block mb-3 text-terracota font-sans text-xs tracking-[0.25em] uppercase">
            {t('label')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-carbon">{t('titulo')}</h2>
          <p className="mt-3 font-sans text-sm text-carbon/55">{t('subtitulo')}</p>
        </div>

        <Stepper step={step} label1={t('paso1_label')} label2={t('paso2_label')} />

        <div className="bg-crema-light rounded-2xl p-6 md:p-8 shadow-sm">
          {step === 1 ? (
            /* ── STEP 1: RESERVATION DETAILS ────────────────────────── */
            <div className="space-y-5">
              <h3 className="font-display text-2xl text-carbon">{t('paso1_titulo')}</h3>

              {/* Date */}
              <div>
                <Label className="mb-1.5 block">{t('fecha_label')} *</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={<button type="button" />}
                    className={`flex h-9 w-full items-center gap-2 rounded-lg border bg-transparent px-3 py-1 text-sm transition-colors hover:bg-muted ${
                      touched.fecha && ERRORS_STEP1.fecha ? 'border-destructive' : 'border-input'
                    }`}
                    onBlur={() => markTouched(['fecha'])}
                  >
                    <CalendarIcon className="size-4 text-carbon/40" />
                    {fecha ? (
                      <span className="capitalize text-carbon">
                        {format(fecha, "EEEE d 'de' MMMM", { locale: dateFnsLocale })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{t('fecha_placeholder')}</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={handleDateSelect}
                      locale={dateFnsLocale}
                      disabled={(date) => date < buildMinDate() || date > buildMaxDate()}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError message={getError('fecha')} />
              </div>

              {/* Time */}
              <div>
                <Label className="mb-1.5 block">{t('hora_label')} *</Label>
                {!fecha ? (
                  <p className="text-sm text-carbon/40 italic">{t('hora_selecciona_fecha')}</p>
                ) : loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-carbon/50">
                    <Loader2 className="size-4 animate-spin" />
                    {t('hora_cargando')}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {FRANJAS_HORARIAS.map((slot) => {
                      const info = disponibilidad[slot];
                      const full = info ? !info.disponible : false;
                      const remaining = info ? info.max - info.reservadas : null;
                      const selected = hora === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={full}
                          onClick={() => { setHora(slot); markTouched(['hora']); }}
                          className={[
                            'relative flex flex-col items-center justify-center rounded-xl border py-2.5 px-1 text-xs font-sans transition-all',
                            full
                              ? 'border-carbon/10 bg-carbon/5 text-carbon/25 cursor-not-allowed'
                              : selected
                                ? 'border-terracota bg-terracota text-crema-light shadow-sm'
                                : 'border-border hover:border-terracota/50 hover:bg-crema cursor-pointer',
                          ].join(' ')}
                        >
                          <span className="font-medium">{slot}</span>
                          {full && <span className="text-[9px] mt-0.5 text-carbon/30">{t('completo')}</span>}
                          {!full && remaining !== null && remaining <= 2 && !selected && (
                            <span className="text-[9px] mt-0.5 text-terracota">{remaining}×</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <FieldError message={getError('hora')} />
              </div>

              {/* Guests */}
              <div>
                <Label className="mb-1.5 block">{t('comensales_label')} *</Label>
                <Select
                  value={String(comensales)}
                  onValueChange={(v) => { setComensales(Number(v ?? 2)); markTouched(['comensales']); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMENSALES_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {comensales > 8 && (
                  <p className="mt-2 text-sm text-terracota bg-terracota/8 rounded-lg px-3 py-2">
                    {t('grupos_grandes')}{' '}
                    <a href="tel:+34971710670" className="font-medium underline">+34 971 71 06 70</a>
                  </p>
                )}
                <FieldError message={getError('comensales')} />
              </div>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full h-11 bg-terracota hover:bg-terracota-dark text-crema-light font-sans"
              >
                {t('siguiente')}
              </Button>
            </div>
          ) : (
            /* ── STEP 2: CONTACT + ALLERGENS ─────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-sans text-carbon/50 hover:text-carbon transition-colors flex items-center gap-1"
                >
                  {t('volver')}
                </button>
                <span className="font-display text-2xl text-carbon ml-auto">{t('paso2_titulo')}</span>
              </div>

              {/* Booking summary pill */}
              {fecha && hora && (
                <div className="flex items-center gap-2 flex-wrap bg-crema rounded-xl px-4 py-3 text-xs font-sans text-carbon/60">
                  <span className="capitalize font-medium text-carbon">
                    {format(fecha, 'EEE d MMM', { locale: dateFnsLocale })}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-carbon">{hora}</span>
                  <span>·</span>
                  <span>{comensales}</span>
                  <button type="button" onClick={handleBack} className="ml-auto text-terracota hover:underline">
                    {t('cambiar')}
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <Label htmlFor="nombre" className="mb-1.5 block">{t('nombre_label')} *</Label>
                <Input
                  id="nombre"
                  type="text"
                  required
                  placeholder={t('nombre_placeholder')}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onBlur={() => markTouched(['nombre'])}
                  className={touched.nombre && ERRORS_STEP2.nombre ? 'border-destructive' : ''}
                />
                <FieldError message={getError('nombre')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono" className="mb-1.5 block">{t('telefono_label')} *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    required
                    placeholder={t('telefono_placeholder')}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    onBlur={() => markTouched(['telefono'])}
                    className={touched.telefono && ERRORS_STEP2.telefono ? 'border-destructive' : ''}
                  />
                  <FieldError message={getError('telefono')} />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-1.5 block">{t('email_label')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched(['email'])}
                    className={touched.email && ERRORS_STEP2.email ? 'border-destructive' : ''}
                  />
                  <FieldError message={getError('email')} />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <Label className="mb-1 block">{t('alergenos_titulo')}</Label>
                <p className="text-xs text-carbon/45 mb-3">{t('alergenos_hint')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALERGENO_ENTRIES.map(([codigo, { nombre: label, emoji }]) => (
                    <label
                      key={codigo}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={alergenos.includes(codigo)}
                        onCheckedChange={(checked) =>
                          setAlergenos((prev) =>
                            checked ? [...prev, codigo] : prev.filter((a) => a !== codigo)
                          )
                        }
                      />
                      <span className="font-sans text-carbon/75">
                        {emoji} {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special request */}
              <div>
                <Label htmlFor="peticion" className="mb-1.5 block">
                  {t('peticion_label')}{' '}
                  <span className="text-carbon/40 font-normal">({t('peticion_opcional')})</span>
                </Label>
                <Textarea
                  id="peticion"
                  placeholder={t('peticion_placeholder')}
                  value={peticionEspecial}
                  onChange={(e) => setPeticionEspecial(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-terracota hover:bg-terracota-dark text-crema-light font-sans text-base"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {t('confirmando')}
                  </span>
                ) : t('confirmar')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
