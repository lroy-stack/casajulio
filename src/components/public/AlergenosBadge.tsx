'use client';

import { AlergenoIcon } from '@/components/icons/AlergenoIcon';
import { ALERGENOS } from '@/lib/types';
import type { CodigoAlergeno } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AlergenosBadgeProps {
  readonly alergenos: readonly CodigoAlergeno[];
}

export function AlergenosBadge({ alergenos }: AlergenosBadgeProps) {
  if (alergenos.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 flex-wrap">
        {alergenos.map((codigo) => {
          const info = ALERGENOS[codigo];
          return (
            <Tooltip key={codigo}>
              <TooltipTrigger
                render={
                  <span
                    className="inline-flex items-center justify-center bg-crema border border-border rounded-full p-1 cursor-default transition-colors hover:bg-terracota/10"
                    aria-label={info.nombre}
                  />
                }
              >
                <AlergenoIcon
                  code={codigo}
                  size={14}
                  className="text-carbon/60"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {info.nombre}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
