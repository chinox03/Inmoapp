import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';
import { Profile } from '../../../types/database.types';

export interface Acceso {
  id: string;
  residente_id: string;
  tipo: string;
  codigo_acceso: string;
  fecha_emision: string;
  fecha_expiracion?: string;
  estado: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export async function getAccesos(
  user: Profile | null,
  residencialId?: string
): Promise<Acceso[]> {
  if (!user) return [];

  let query = supabase
    .from('accesos')
    .select('*, residente:profiles!accesos_residente_id_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (user.rol === 'RESIDENTE') {
    query = query.eq('residente_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching accesos:', error);
  }

  return data || [];
}

export async function createAcceso(
  acceso: Omit<Acceso, 'id' | 'created_at'>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('accesos')
    .insert([acceso])
    .select()
    .single();

  if (error) {
    console.error('Error creating acceso:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'accesos',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data };
}

export async function updateAcceso(
  id: string,
  updates: Partial<Acceso>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('accesos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating acceso:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'accesos',
    entidadId: id,
    accion: 'UPDATE',
    diff: updates,
  });

  return { success: true, data };
}

export async function deleteAcceso(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase.from('accesos').update({ deleted_at: new Date().toISOString() }).eq('id', id);

  if (error) {
    console.error('Error deleting acceso:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'accesos',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}
