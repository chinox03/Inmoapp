import { supabase } from '../../../lib/supabase';
import { shouldBypassFilters } from '../../../config/devMode';
import { Profile } from '../../../types/database.types';

export interface Reserva {
  id: string;
  espacio_id: string;
  residente_id: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo?: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export async function getReservas(
  user: Profile | null,
  residencialId?: string
): Promise<Reserva[]> {
  if (!user) return [];

  let query = supabase
    .from('reservas')
    .select('*, espacio:espacios!reservas_espacio_id_fkey(nombre), residente:profiles!reservas_residente_id_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const devBypass = shouldBypassFilters() || user?.rol === 'SUPERADMIN';

  if (!devBypass) {
    if (user.rol === 'RESIDENTE') {
      query = query.eq('residente_id', user.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reservas:', error);
  }

  return data || [];
}

export async function createReserva(
  reserva: Omit<Reserva, 'id' | 'created_at'>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('reservas')
    .insert([reserva])
    .select()
    .single();

  if (error) {
    console.error('Error creating reserva:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateReserva(
  id: string,
  updates: Partial<Reserva>,
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('reservas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reserva:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteReserva(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase.from('reservas').update({ deleted_at: new Date().toISOString() }).eq('id', id);

  if (error) {
    console.error('Error deleting reserva:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getEspaciosDisponibles(
  residencialId?: string
): Promise<any[]> {
  let query = supabase
    .from('espacios')
    .select('*')
    .eq('estado', 'activo');

  if (!shouldBypassFilters() && residencialId && typeof residencialId === 'string' && residencialId.length > 10) {
    query = query.eq('residencial_id', residencialId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching espacios:', error);
  }

  return data || [];
}
