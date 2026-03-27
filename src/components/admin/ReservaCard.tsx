'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EstadoBadge } from '@/components/admin/EstadoBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Users, Check, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Reserva } from '@/lib/types';

interface ReservaCardProps {
  readonly reserva: Reserva;
  readonly onUpdate?: (updated: Reserva) => void;
}

async function patchReserva(id: string, updates: { estado?: string; nota_interna?: string }): Promise<Reserva> {
  const res = await fetch('/api/admin/reservas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Error al actualizar');
  }
  return res.json();
}

export function ReservaCard({ reserva, onUpdate }: ReservaCardProps) {
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const canConfirm = reserva.estado === 'pendiente' && !!onUpdate;
  const canCancel = reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && !!onUpdate;

  async function handleConfirm() {
    setBusy(true);
    try {
      const updated = await patchReserva(reserva.id, { estado: 'confirmada' });
      onUpdate?.(updated);
      toast.success(`Reserva de ${reserva.nombre} confirmada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al confirmar');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    try {
      const updated = await patchReserva(reserva.id, { estado: 'cancelada' });
      onUpdate?.(updated);
      toast.success('Reserva cancelada');
      setCancelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card className="bg-white" size="sm">
        <CardContent className="flex items-center gap-3">
          {/* Time + info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex flex-col items-center shrink-0">
              <Clock className="size-3.5 text-carbon/40 mb-0.5" />
              <span className="text-sm font-medium text-carbon">{reserva.hora}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-carbon truncate">{reserva.nombre}</p>
              <div className="flex items-center gap-1.5 text-xs text-carbon/50">
                <Users className="size-3" />
                <span>{reserva.comensales} pers.</span>
                {reserva.peticion_especial && (
                  <span className="text-terracota/70 truncate max-w-[120px]">· {reserva.peticion_especial}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <EstadoBadge estado={reserva.estado} />
            {canConfirm && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={handleConfirm}
                disabled={busy}
                className="text-green-600 border-green-200 hover:bg-green-50"
                title="Confirmar reserva"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              </Button>
            )}
            {canCancel && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setCancelOpen(true)}
                disabled={busy}
                className="text-destructive border-red-200 hover:bg-red-50"
                title="Cancelar reserva"
              >
                <XCircle className="size-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              ¿Cancelar la reserva de <strong>{reserva.nombre}</strong> a las {reserva.hora}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={busy}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : 'Cancelar reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
