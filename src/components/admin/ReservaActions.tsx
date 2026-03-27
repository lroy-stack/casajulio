'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Check, XCircle, Ban, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import type { Reserva, EstadoReserva } from '@/lib/types';

interface ReservaActionsProps {
  readonly reserva: Reserva;
  readonly onUpdate: (updated: Reserva) => void;
}

async function updateReserva(
  id: string,
  updates: { estado?: EstadoReserva; nota_interna?: string }
): Promise<Reserva> {
  const res = await fetch('/api/admin/reservas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Error al actualizar la reserva');
  }

  return res.json();
}

export function ReservaActions({ reserva, onUpdate }: ReservaActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [noteText, setNoteText] = useState(reserva.nota_interna ?? '');
  const [busy, setBusy] = useState(false);

  async function handleEstadoChange(estado: EstadoReserva) {
    setBusy(true);
    try {
      const updated = await updateReserva(reserva.id, { estado });
      onUpdate(updated);
      toast.success(`Reserva marcada como ${estado}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    try {
      const nota = cancelReason.trim()
        ? `Motivo cancelación: ${cancelReason.trim()}`
        : reserva.nota_interna;
      const updated = await updateReserva(reserva.id, {
        estado: 'cancelada',
        ...(nota ? { nota_interna: nota } : {}),
      });
      onUpdate(updated);
      toast.success('Reserva cancelada');
      setCancelOpen(false);
      setCancelReason('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(false);
    }
  }

  async function handleNoteSave() {
    setBusy(true);
    try {
      const updated = await updateReserva(reserva.id, {
        nota_interna: noteText.trim(),
      });
      onUpdate(updated);
      toast.success('Nota guardada');
      setNoteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={busy} />}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {reserva.estado === 'pendiente' && (
            <DropdownMenuItem onClick={() => handleEstadoChange('confirmada')}>
              <Check className="size-4 text-green-600" />
              Confirmar
            </DropdownMenuItem>
          )}
          {(reserva.estado === 'confirmada' || reserva.estado === 'pendiente') && (
            <DropdownMenuItem onClick={() => handleEstadoChange('completada')}>
              <Check className="size-4 text-blue-600" />
              Marcar completada
            </DropdownMenuItem>
          )}
          {reserva.estado !== 'cancelada' && (
            <>
              <DropdownMenuItem onClick={() => handleEstadoChange('no_presentado')}>
                <Ban className="size-4 text-gray-500" />
                Marcar no presentado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="size-4" />
                Cancelar reserva
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setNoteOpen(true)}>
            <StickyNote className="size-4" />
            Añadir nota
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres cancelar la reserva de {reserva.nombre}?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo de cancelación (opcional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={busy}
            >
              Cancelar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nota interna</DialogTitle>
            <DialogDescription>
              Añade una nota sobre la reserva de {reserva.nombre}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Escribe una nota interna..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNoteSave} disabled={busy}>
              Guardar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
