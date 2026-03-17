import { z } from 'zod';

export const pagoSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha_pago: z.string().min(1, 'La fecha es requerida'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
  referencia: z.string().optional(),
  estado: z.enum(['pendiente', 'aprobado', 'rechazado']),
  comprobante_url: z.string().optional(),
  notas: z.string().optional(),
});

export const espacioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  capacidad: z.number().int().positive('La capacidad debe ser mayor a 0'),
  precio_renta: z.number().min(0, 'El precio no puede ser negativo'),
  esta_activo: z.boolean().default(true),
  horario_inicio: z.string().optional(),
  horario_fin: z.string().optional(),
});

export const reservaSchema = z.object({
  espacio_id: z.string().uuid('Seleccione un espacio válido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  estado: z.enum(['pendiente', 'aprobada', 'rechazada', 'cancelada']),
  observaciones: z.string().optional(),
});

export const amonestacionSchema = z.object({
  residente_id: z.string().uuid('Seleccione un residente válido'),
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
  descripcion: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  nivel: z.enum(['leve', 'moderada', 'grave']),
  fecha_amonestacion: z.string().min(1, 'La fecha es requerida'),
  estado: z.enum(['activa', 'resuelta', 'apelada']),
});

export const accesoSchema = z.object({
  tipo_acceso: z.enum(['qr', 'rfid', 'biometrico', 'pin']),
  codigo_acceso: z.string().min(1, 'El código de acceso es requerido'),
  fecha_activacion: z.string().min(1, 'La fecha de activación es requerida'),
  fecha_expiracion: z.string().optional(),
  esta_activo: z.boolean().default(true),
  dispositivo_asignado: z.string().optional(),
});

export const mudanzaSchema = z.object({
  tipo_mudanza: z.enum(['entrada', 'salida']),
  fecha_programada: z.string().min(1, 'La fecha programada es requerida'),
  hora_inicio: z.string().min(1, 'La hora de inicio es requerida'),
  hora_fin: z.string().min(1, 'La hora de fin es requerida'),
  empresa_mudanza: z.string().optional(),
  contacto_empresa: z.string().optional(),
  num_personas: z.number().int().positive('Debe ser mayor a 0').optional(),
  vehiculos: z.string().optional(),
  estado: z.enum(['pendiente', 'aprobada', 'rechazada', 'completada']),
  observaciones: z.string().optional(),
});

export type PagoFormData = z.infer<typeof pagoSchema>;
export type EspacioFormData = z.infer<typeof espacioSchema>;
export type ReservaFormData = z.infer<typeof reservaSchema>;
export type AmonestacionFormData = z.infer<typeof amonestacionSchema>;
export type AccesoFormData = z.infer<typeof accesoSchema>;
export type MudanzaFormData = z.infer<typeof mudanzaSchema>;
