import { supabase } from './supabase';
import { User } from '../types/database.types';

export { applyResidencialFilter, applyResidenteFilter, fetchWithFilter, createRecord, updateRecord, deleteRecord } from './dataService';

export async function getResidenciales(user: User | null) {
  if (!user) return [];

  let query = supabase.from('residenciales').select('*').order('nombre');

  if (user.rol !== 'SUPERADMIN' && user.residencial_id) {
    query = query.eq('id', user.residencial_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching residenciales:', error.message);
    return [];
  }

  return data || [];
}
