import { supabase } from './supabase';
import { Profile } from '../types/database.types';
import { shouldBypassFilters } from '../config/devMode';

export const applyResidencialFilter = (
  query: any,
  user: Profile | null,
  residencialId?: string
) => {
  if (!user) return query;

  if (shouldBypassFilters()) {
    return query;
  }

  if (user.rol === 'SUPERADMIN') {
    if (residencialId) {
      return query.eq('residencial_id', residencialId);
    }
    return query;
  }

  if (user.residencial_id) {
    return query.eq('residencial_id', user.residencial_id);
  }

  return query;
};

export const applyResidenteFilter = (
  query: any,
  user: Profile | null
) => {
  if (!user) return query;

  if (shouldBypassFilters()) {
    return query;
  }

  if (user.rol === 'RESIDENTE') {
    return query.eq('residente_id', user.id);
  }

  return query;
};

export async function fetchWithFilter<T>(
  tableName: string,
  user: Profile | null,
  residencialId?: string,
  additionalFilters?: Record<string, any>
): Promise<T[]> {
  let query = supabase.from(tableName).select('*');

  query = applyResidencialFilter(query, user, residencialId);

  if (additionalFilters) {
    Object.entries(additionalFilters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return [];
  }

  return (data as T[]) || [];
}

export async function createRecord<T>(
  tableName: string,
  record: Partial<T>,
  user: Profile | null
): Promise<{ success: boolean; data?: T; error?: string }> {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from(tableName)
    .insert([record])
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${tableName}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as T };
}

export async function updateRecord<T>(
  tableName: string,
  id: string,
  updates: Partial<T>,
  user: Profile | null
): Promise<{ success: boolean; data?: T; error?: string }> {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${tableName}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as T };
}

export async function deleteRecord(
  tableName: string,
  id: string,
  user: Profile | null
): Promise<{ success: boolean; error?: string }> {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting ${tableName}:`, error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
