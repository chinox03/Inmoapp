import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';
import { Profile } from '../../../types/database.types';

export interface GarantiaDB {
  id: string;
  numero_reclamo: string;
  residencial_id: string | null;
  unidad: string;
  residente_id: string | null;
  residente_nombre: string;
  residente_telefono: string;
  claims: any[];
  estado: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'resolved';
  prioridad: 'low' | 'medium' | 'high';
  fecha_envio: string;
  fecha_revision: string | null;
  fecha_resolucion: string | null;
  revisado_por: string | null;
  notas_admin: string | null;
  fecha_estimada_completado: string | null;
  equipo_asignado: string | null;
  fecha_visita_programada: string | null;
  razon_rechazo: string | null;
  notas_rechazo: string | null;
  firma: string | null;
  historial: any[];
  created_at: string;
  updated_at: string;
  residencial?: { nombre: string } | null;
  revisor?: { nombre: string } | null;
}

export async function getGarantias(user: Profile | null): Promise<GarantiaDB[]> {
  if (!user) return [];

  const { data, error } = await supabase
    .from('garantias')
    .select('*, residencial:residenciales(nombre), revisor:profiles!garantias_revisado_por_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching garantias:', error);
  }

  return data || [];
}

export async function createGarantia(
  garantia: {
    numero_reclamo: string;
    residencial_id: string | null;
    unidad: string;
    residente_id: string | null;
    residente_nombre: string;
    residente_telefono: string;
    claims: any[];
    estado: string;
    prioridad: string;
    historial: any[];
  },
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('garantias')
    .insert([garantia])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating garantia:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId: garantia.residencial_id ?? undefined,
    userId: user.id,
    entidad: 'garantias',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data };
}

export async function updateGarantia(
  id: string,
  updates: Partial<GarantiaDB>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { residencial, revisor, ...cleanUpdates } = updates as any;

  const { data, error } = await supabase
    .from('garantias')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating garantia:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'garantias',
    entidadId: id,
    accion: 'UPDATE',
    diff: cleanUpdates,
  });

  return { success: true, data };
}

export async function deleteGarantia(
  id: string,
  user: Profile | null
): Promise<{ success: boolean; error?: string }> {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from('garantias')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting garantia:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'garantias',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}

export async function getResidenciales(): Promise<{ id: string; nombre: string }[]> {
  const { data, error } = await supabase
    .from('residenciales')
    .select('id, nombre')
    .order('nombre');

  if (error) {
    console.error('Error fetching residenciales:', error);
  }

  return data || [];
}

export async function getResidentes(): Promise<{ id: string; nombre: string; apellido: string; telefono: string; unidad: string | null; residencial_id: string | null }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, apellido, telefono, unidad, residencial_id')
    .eq('rol', 'RESIDENTE')
    .eq('estado', 'activo')
    .order('nombre');

  if (error) {
    console.error('Error fetching residentes:', error);
  }

  return data || [];
}
