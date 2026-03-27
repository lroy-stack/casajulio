export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_presentado';

export type CodigoAlergeno =
  | 'gluten' | 'lacteos' | 'huevos' | 'mariscos' | 'pescado'
  | 'frutos_secos' | 'soja' | 'apio' | 'mostaza' | 'sesamo'
  | 'sulfitos' | 'moluscos' | 'altramuces' | 'cacahuetes';

export interface Categoria {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly imagen_url: string | null;
  readonly orden: number;
  readonly activo: boolean;
  readonly created_at: string;
}

export interface Plato {
  readonly id: string;
  readonly categoria_id: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precio: number;
  readonly alergenos: readonly CodigoAlergeno[];
  readonly disponible: boolean;
  readonly orden: number;
  readonly created_at: string;
}

export interface MenuDia {
  readonly id: string;
  readonly nombre: string;
  readonly precio: number;
  readonly descripcion: string | null;
  readonly activo: boolean;
  readonly dias_semana: readonly string[];
}

export interface Reserva {
  readonly id: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly fecha: string;
  readonly hora: string;
  readonly comensales: number;
  readonly alergenos_grupo: readonly CodigoAlergeno[];
  readonly peticion_especial: string | null;
  readonly estado: EstadoReserva;
  readonly nota_interna: string | null;
  readonly numero_reserva: string;
  readonly created_at: string;
}

export interface Configuracion {
  readonly id: string;
  readonly clave: string;
  readonly valor: string;
  readonly updated_at: string;
}

export interface ReservaFormData {
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly fecha: string;
  readonly hora: string;
  readonly comensales: number;
  readonly alergenos_grupo: readonly CodigoAlergeno[];
  readonly peticion_especial: string;
}

export interface Horario {
  readonly dia: string;
  readonly abierto: boolean;
  readonly hora_apertura: string;
  readonly hora_cierre: string;
}

export const ALERGENOS: Record<CodigoAlergeno, { nombre: string; emoji: string }> = {
  gluten: { nombre: 'Gluten', emoji: '🌾' },
  lacteos: { nombre: 'Lácteos', emoji: '🥛' },
  huevos: { nombre: 'Huevos', emoji: '🥚' },
  mariscos: { nombre: 'Mariscos', emoji: '🦐' },
  pescado: { nombre: 'Pescado', emoji: '🐟' },
  frutos_secos: { nombre: 'Frutos secos', emoji: '🥜' },
  soja: { nombre: 'Soja', emoji: '🫘' },
  apio: { nombre: 'Apio', emoji: '🥬' },
  mostaza: { nombre: 'Mostaza', emoji: '🟡' },
  sesamo: { nombre: 'Sésamo', emoji: '⚪' },
  sulfitos: { nombre: 'Sulfitos', emoji: '🍷' },
  moluscos: { nombre: 'Moluscos', emoji: '🦪' },
  altramuces: { nombre: 'Altramuces', emoji: '🌿' },
  cacahuetes: { nombre: 'Cacahuetes', emoji: '🥜' },
} as const;

export const FRANJAS_HORARIAS = [
  '13:00', '13:30', '14:00', '14:30',
  '20:00', '20:30', '21:00', '21:30',
] as const;
