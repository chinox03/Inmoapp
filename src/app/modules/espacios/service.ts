import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';
import { Profile } from '../../../types/database.types';
import { fetchWithFilter, createRecord, updateRecord } from '../../../lib/dataService';

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
  estado: string;
  created_at: string;
  updated_at: string;
}

export async function getEspacios(
  user: Profile | null,
  residencialId?: string
): Promise<Espacio[]> {
  const data = await fetchWithFilter<Espacio>('espacios', user, residencialId);

  return data || [];
}

export async function createEspacio(
  espacio: Omit<Espacio, 'id' | 'created_at' | 'updated_at'>,
  user: Profile | null
) {
  return createRecord<Espacio>('espacios', espacio, user);
}

export async function updateEspacio(
  id: string,
  updates: Partial<Espacio>,
  user: Profile | null
) {
  return updateRecord<Espacio>('espacios', id, updates, user);
}

export async function deleteEspacio(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from('espacios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'espacios',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}
