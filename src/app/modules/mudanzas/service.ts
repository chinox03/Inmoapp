import { supabase } from '../../../lib/supabase';
import { shouldBypassFilters } from '../../../config/devMode';
import { Profile } from '../../../types/database.types';

export interface Mudanza {
  id: string;
  residencial_id: string;
  residente_id: string;
  tipo: 'entrada' | 'salida';
  fecha: string;
  hora: string;
  observaciones?: string;
  estado: 'solicitada' | 'aprobada' | 'en_proceso' | 'completada' | 'cancelada';
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
  residente?: { nombre: string };
}

export async function getMudanzas(
  user: Profile | null,
  residencialId?: string
): Promise<Mudanza[]> {
  if (!user) return [];

  let query = supabase
    .schema('public')
    .from('mudanzas')
    .select('*, residente:profiles!mudanzas_residente_id_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const devBypass = shouldBypassFilters() || user?.rol === 'SUPERADMIN';

  if (!devBypass) {
    if (user.rol === 'RESIDENTE') {
      query = query.eq('residente_id', user.id);
    } else if (residencialId && typeof residencialId === 'string' && residencialId.length > 10) {
      query = query.eq('residencial_id', residencialId);
    }
  } else {
    query = query.not('id', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching mudanzas:', error);
  }

  return data || [];
}

export async function createMudanza(
  mudanza: Omit<Mudanza, 'id' | 'created_at' | 'updated_at' | 'residente'>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .schema('public')
    .from('mudanzas')
    .insert([mudanza])
    .select()
    .single();

  if (error) {
    console.error('Error creating mudanza:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateMudanza(
  id: string,
  updates: Partial<Mudanza>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { residente, ...cleanUpdates } = updates;

  const { data, error } = await supabase
    .schema('public')
    .from('mudanzas')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating mudanza:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteMudanza(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase.schema('public').from('mudanzas').update({ deleted_at: new Date().toISOString() }).eq('id', id);

  if (error) {
    console.error('Error deleting mudanza:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
