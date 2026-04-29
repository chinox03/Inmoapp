import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';

export interface ReservaComercialDocument {
  id: string;
  tipo: string;
  nombre: string;
  fechaCarga: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export type ReservaComercialEstado =
  | 'Pendiente Documentos'
  | 'En Revisión'
  | 'Aprobada'
  | 'Lista para PCV';

export interface ReservaComercial {
  id: string;
  negocio_id: string | null;
  prospecto: string;
  email: string;
  telefono: string;
  unidad: string;
  proyecto: string;
  tipo_interes: string;
  valor: number;
  monto_reserva: number;
  fecha_reserva: string;
  estado: ReservaComercialEstado;
  documentos: ReservaComercialDocument[];
  documentos_requeridos: string[];
  created_at: string;
  updated_at: string;
}

export async function getReservasComerciales(): Promise<ReservaComercial[]> {
  const { data, error } = await supabase
    .from('reservas_comerciales')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservas_comerciales:', error.message);
    return [];
  }

  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    documentos: (d.documentos as ReservaComercialDocument[]) || [],
    documentos_requeridos: (d.documentos_requeridos as string[]) || [],
  })) as ReservaComercial[];
}

export async function createReservaComercial(input: {
  negocio_id: string;
  prospecto: string;
  email: string;
  telefono: string;
  unidad: string;
  proyecto: string;
  tipo_interes: string;
  valor: number;
  monto_reserva?: number;
  documentos_requeridos?: string[];
}): Promise<{ success: boolean; data?: ReservaComercial; error?: string }> {
  const { documentos_requeridos, ...rest } = input;
  const record = {
    ...rest,
    monto_reserva: input.monto_reserva ?? 0,
    fecha_reserva: new Date().toISOString().split('T')[0],
    estado: 'Pendiente Documentos' as ReservaComercialEstado,
    documentos: [],
    documentos_requeridos: documentos_requeridos || [],
  };

  const { data, error } = await supabase
    .from('reservas_comerciales')
    .insert([record])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'reservas_comerciales',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data };
}

export async function updateReservaComercial(
  id: string,
  updates: Partial<Pick<ReservaComercial, 'estado' | 'documentos' | 'monto_reserva'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('reservas_comerciales')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'reservas_comerciales',
    entidadId: id,
    accion: 'UPDATE',
    diff: updates,
  });

  return { success: true };
}
