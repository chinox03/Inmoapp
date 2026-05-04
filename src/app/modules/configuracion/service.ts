import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';

export interface ConfiguracionEntregas {
  id: string;
  equipos: string[];
  sla_por_prioridad: { high: number; medium: number; low: number };
  updated_at: string;
}

const DEFAULT: Omit<ConfiguracionEntregas, 'id' | 'updated_at'> = {
  equipos: ['Mantenimiento', 'Construccion', 'Acabados', 'Electrico', 'Plomeria', 'Jardineria'],
  sla_por_prioridad: { high: 3, medium: 7, low: 14 },
};

export async function getConfiguracionEntregas(): Promise<ConfiguracionEntregas> {
  const { data, error } = await supabase
    .from('configuracion_entregas')
    .select('*')
    .maybeSingle();

  if (error || !data) {
    return { id: '', equipos: DEFAULT.equipos, sla_por_prioridad: DEFAULT.sla_por_prioridad, updated_at: '' };
  }

  return {
    id: data.id,
    equipos: (data.equipos as string[]) || DEFAULT.equipos,
    sla_por_prioridad: (data.sla_por_prioridad as { high: number; medium: number; low: number }) || DEFAULT.sla_por_prioridad,
    updated_at: data.updated_at,
  };
}

export async function updateConfiguracionEntregas(
  updates: { equipos?: string[]; sla_por_prioridad?: { high: number; medium: number; low: number } }
): Promise<{ success: boolean; error?: string }> {
  const current = await getConfiguracionEntregas();

  if (current.id) {
    const { error } = await supabase
      .from('configuracion_entregas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('configuracion_entregas')
      .insert([{ ...DEFAULT, ...updates }]);

    if (error) return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'configuracion_entregas',
    entidadId: current.id || 'new',
    accion: 'UPDATE',
    diff: updates,
  });

  return { success: true };
}
