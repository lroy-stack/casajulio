import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EstadoReserva } from '@/lib/types';

const ESTADO_STYLES: Record<EstadoReserva, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmada: 'bg-green-100 text-green-800 border-green-300',
  completada: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelada: 'bg-red-100 text-red-800 border-red-300',
  no_presentado: 'bg-gray-100 text-gray-600 border-gray-300',
} as const;

const ESTADO_LABELS: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_presentado: 'No presentado',
} as const;

interface EstadoBadgeProps {
  readonly estado: EstadoReserva;
  readonly className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(ESTADO_STYLES[estado], className)}
    >
      {ESTADO_LABELS[estado]}
    </Badge>
  );
}

export { ESTADO_LABELS };
