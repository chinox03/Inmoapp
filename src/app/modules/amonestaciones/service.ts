import { supabase } from '../../../lib/supabase';
import { shouldBypassFilters } from '../../../config/devMode';
import { Profile } from '../../../types/database.types';

export interface Amonestacion {
  id: string;
  residencial_id: string;
  receptor_id: string;
  emisor_id: string;
  tipo: 'ruido' | 'estacionamiento' | 'mascotas' | 'basura' | 'otro';
  descripcion: string;
  estado: 'emitida' | 'apelada' | 'cerrada';
  respuesta_apelacion?: string;
  fecha_emision: string;
  fecha_resolucion?: string;
  created_at: string;
  updated_at: string;
  receptor?: { nombre: string };
}

export async function getAmonestaciones(
  user: Profile | null,
  residencialId?: string
): Promise<Amonestacion[]> {
  if (!user) return [];

  let query = supabase
    .schema('public')
    .from('amonestaciones')
    .select('*, receptor:profiles!amonestaciones_receptor_id_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const devBypass = shouldBypassFilters() || user?.rol === 'SUPERADMIN';

  if (!devBypass) {
    if (user.rol === 'RESIDENTE') {
      query = query.eq('receptor_id', user.id);
    } else if (residencialId && typeof residencialId === 'string' && residencialId.length > 10) {
      query = query.eq('residencial_id', residencialId);
    }
  } else {
    query = query.not('id', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching amonestaciones:', error);
  }

  return data || [];
}

export async function createAmonestacion(
  amonestacion: Omit<Amonestacion, 'id' | 'created_at' | 'updated_at' | 'receptor'>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .schema('public')
    .from('amonestaciones')
    .insert([amonestacion])
    .select()
    .single();

  if (error) {
    console.error('Error creating amonestacion:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateAmonestacion(
  id: string,
  updates: Partial<Amonestacion>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { receptor, ...cleanUpdates } = updates;

  const { data, error } = await supabase
    .schema('public')
    .from('amonestaciones')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating amonestacion:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteAmonestacion(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase.schema('public').from('amonestaciones').update({ deleted_at: new Date().toISOString() }).eq('id', id);

  if (error) {
    console.error('Error deleting amonestacion:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
