import { ClaimType, ProblemLocation, TeamType, RejectionReason } from './types';

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  door_frame: 'Marco de Puerta',
  door: 'Puerta',
  floor: 'Piso',
  window: 'Ventana',
  electrical: 'Eléctrico',
  plumbing: 'Plomería',
  water_pressure: 'Presión de Agua',
  water_temperature: 'Temperatura de Agua',
  humidity: 'Humedad',
  leak: 'Fuga',
  paint: 'Pintura',
  tiles: 'Azulejos',
  other: 'Otro',
};

export const LOCATION_LABELS: Record<ProblemLocation, string> = {
  master_bedroom: 'Recámara Principal',
  secondary_bedroom_1: 'Recámara Secundaria 1',
  secondary_bedroom_2: 'Recámara Secundaria 2',
  secondary_bedroom_3: 'Recámara Secundaria 3',
  living_room: 'Sala',
  dining_room: 'Comedor',
  kitchen: 'Cocina',
  master_bathroom: 'Baño Principal',
  secondary_bathroom: 'Baño Secundario',
  guest_bathroom: 'Baño de Visitas',
  internal_garden: 'Jardín Interno',
  external_garden: 'Jardín Externo',
  backyard: 'Patio Trasero',
  front_yard: 'Jardín Frontal',
  garage: 'Garage',
  balcony: 'Balcón',
  terrace: 'Terraza',
  laundry_room: 'Cuarto de Lavado',
  storage: 'Bodega',
  hallway: 'Pasillo',
  stairs: 'Escaleras',
};

export const STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  in_progress: 'En Progreso',
  resolved: 'Resuelta',
};

export const TEAM_LABELS: Record<TeamType, string> = {
  customer_experience: 'Experiencia al Cliente',
  operations: 'Operaciones',
  construction: 'Obra',
  finishing: 'Acabados',
};

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  out_of_warranty: 'Fuera de Garantía',
  customer_damage: 'Daño por Cliente',
  normal_wear: 'Desgaste Normal',
  incomplete_info: 'Información Incompleta',
  duplicate: 'Duplicado',
  other: 'Otro',
};

export const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
