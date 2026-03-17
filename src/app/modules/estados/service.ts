import { supabase } from '../../../lib/supabase';
import { EstadoCuenta, User } from '../../../types/database.types';
import { logAuditEvent } from '../../../lib/audit';
import { shouldBypassFilters } from '../../../config/devMode';

export async function getEstadosCuenta(
  user: User | null,
  selectedResidencialId?: string
): Promise<EstadoCuenta[]> {
  if (!user) return [];

  let query = supabase
    .from('estados_cuenta')
    .select('*')
    .order('created_at', { ascending: false });

  const devBypass = shouldBypassFilters() || user?.rol === 'SUPERADMIN';

  if (!devBypass) {
    if (user.rol === 'RESIDENTE') {
      query = query.eq('residente_id', user.id);
    } else if (selectedResidencialId && selectedResidencialId.length > 10) {
      query = query.eq('residencial_id', selectedResidencialId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching estados cuenta:', error.message);
    return [];
  }

  return data || [];
}

export async function createEstadoCuenta(
  estadoData: Partial<EstadoCuenta>,
  user: User
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('estados_cuenta')
    .insert(estadoData)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId: estadoData.residencial_id,
    userId: user.id,
    entidad: 'estados_cuenta',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true };
}

export async function updateEstadoCuenta(
  id: string,
  updates: Partial<EstadoCuenta>,
  user: User
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('estados_cuenta')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId: data.residencial_id,
    userId: user.id,
    entidad: 'estados_cuenta',
    entidadId: id,
    accion: 'UPDATE',
    diff: updates,
  });

  return { success: true };
}

export async function deleteEstadoCuenta(
  id: string,
  residencialId: string,
  user: User
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('estados_cuenta').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId,
    userId: user.id,
    entidad: 'estados_cuenta',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}
