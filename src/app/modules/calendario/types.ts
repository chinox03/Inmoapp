export type EventType = 'reserva' | 'mudanza' | 'amonestacion' | 'mantenimiento';

export interface EventDetails {
  solicitante: string;
  personas?: number;
  residencial: string;
  espacio?: string;
  observaciones?: string;
  tipo?: string;
  estado?: string;
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  details: EventDetails;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface FilterState {
  reservas: boolean;
  mudanzas: boolean;
  amonestaciones: boolean;
  mantenimiento: boolean;
}
