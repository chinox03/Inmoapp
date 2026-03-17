export type UserRole = 'SUPERADMIN' | 'ADMIN_RESIDENCIAL' | 'IT' | 'SEGURIDAD' | 'RESIDENTE';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LOGIN';

export type ResidenciaEstado = 'activa' | 'inactiva';

export type PagoEstado = 'pendiente' | 'aprobado' | 'rechazado';
export type PagoTipo = 'mantenimiento' | 'extraordinario' | 'multa';
export type EspacioEstado = 'activo' | 'inactivo' | 'mantenimiento';
export type ReservaEstado = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'completada';
export type AmonestacionTipo = 'ruido' | 'estacionamiento' | 'mascotas' | 'basura' | 'otro';
export type AmonestacionEstado = 'emitida' | 'apelada' | 'cerrada';
export type AccesoTipo = 'tarjeta_permanente' | 'codigo_temporal' | 'invitado';
export type AccesoEstado = 'activo' | 'expirado' | 'revocado';
export type MudanzaTipo = 'entrada' | 'salida';
export type MudanzaEstado = 'solicitada' | 'aprobada' | 'en_proceso' | 'completada' | 'cancelada';
export type RegistroTipo = 'entrada' | 'salida';

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  residencial_id?: string;
  created_at: string;
  updated_at: string;
}

export type Profile = User;

export interface Residencial {
  id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface Residencia {
  id: string;
  residencial_id: string;
  codigo: string;
  manzana?: string;
  numero?: string;
  estado: ResidenciaEstado;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  residencial_id?: string;
  user_id?: string;
  entidad: string;
  entidad_id: string;
  accion: AuditAction;
  diff?: Record<string, any>;
  ip?: string;
  user_agent?: string;
  created_at: string;
}

export interface EstadoCuenta {
  id: string;
  residencial_id: string;
  residente_id: string;
  periodo: string;
  total_mantenimiento: number;
  total_pagado: number;
  saldo_pendiente: number;
  fecha_generacion: string;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  residencial_id: string;
  residente_id: string;
  monto: number;
  tipo: PagoTipo;
  estado: PagoEstado;
  comprobante_url?: string;
  fecha_pago?: string;
  fecha_registro: string;
  aprobado_por?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface Espacio {
  id: string;
  residencial_id: string;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  amueblado: boolean;
  electricidad: boolean;
  dias_disponibles: string[];
  horas_disponibles: string[];
  estado: EspacioEstado;
  created_at: string;
  updated_at: string;
}

export interface Reserva {
  id: string;
  espacio_id: string;
  residente_id: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: ReservaEstado;
  motivo?: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface Amonestacion {
  id: string;
  residencial_id: string;
  tipo: AmonestacionTipo;
  descripcion: string;
  emisor_id: string;
  receptor_id: string;
  estado: AmonestacionEstado;
  respuesta_apelacion?: string;
  fecha_emision: string;
  fecha_resolucion?: string;
  created_at: string;
  updated_at: string;
}

export interface Acceso {
  id: string;
  residente_id: string;
  tipo: AccesoTipo;
  codigo_acceso: string;
  estado: AccesoEstado;
  fecha_emision: string;
  fecha_expiracion?: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface SolicitudAcceso {
  id: string;
  residente_id: string;
  tipo: AccesoTipo;
  motivo: string;
  estado: PagoEstado;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  aprobado_por?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface Mudanza {
  id: string;
  residencial_id: string;
  residente_id: string;
  tipo: MudanzaTipo;
  fecha: string;
  hora: string;
  observaciones?: string;
  estado: MudanzaEstado;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface GaritaRegistro {
  id: string;
  mudanza_id: string;
  guardia_id: string;
  tipo_registro: RegistroTipo;
  observaciones?: string;
  fecha_registro: string;
  created_at: string;
}
