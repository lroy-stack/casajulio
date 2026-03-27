import { TableCell, TableRow } from '@/components/ui/table';
import { EstadoBadge } from '@/components/admin/EstadoBadge';
import { ReservaActions } from '@/components/admin/ReservaActions';
import { ALERGENOS } from '@/lib/types';
import type { Reserva } from '@/lib/types';

interface ReservaRowProps {
  readonly reserva: Reserva;
  readonly onUpdate: (updated: Reserva) => void;
}

export function ReservaRow({ reserva, onUpdate }: ReservaRowProps) {
  const alergenosText =
    reserva.alergenos_grupo.length > 0
      ? reserva.alergenos_grupo
          .map((a) => ALERGENOS[a]?.nombre ?? a)
          .join(', ')
      : '-';

  return (
    <TableRow>
      <TableCell className="font-medium">{reserva.hora}</TableCell>
      <TableCell>{reserva.nombre}</TableCell>
      <TableCell className="text-center">{reserva.comensales}</TableCell>
      <TableCell className="hidden md:table-cell">{reserva.telefono}</TableCell>
      <TableCell className="hidden lg:table-cell">{reserva.email}</TableCell>
      <TableCell>
        <EstadoBadge estado={reserva.estado} />
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs max-w-[150px] truncate">
        {alergenosText}
      </TableCell>
      <TableCell className="hidden xl:table-cell text-xs max-w-[150px] truncate">
        {reserva.peticion_especial ?? '-'}
      </TableCell>
      <TableCell>
        <ReservaActions reserva={reserva} onUpdate={onUpdate} />
      </TableCell>
    </TableRow>
  );
}
