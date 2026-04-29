import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';

export interface Residencial {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  pais: string;
  total_unidades: number;
  unidades_ocupadas: number;
  cuota_mantenimiento: number;
  administrador: string;
  telefono: string;
  email: string;
  estado: string;
  amenidades: string[];
  imagen: string;
  fecha_fundacion: string | null;
  tipos_proyecto: string[];
  created_at: string;
  updated_at: string;
}

export interface MontoReserva {
  id: string;
  tipo: 'fijo' | 'porcentaje';
  valor: number;
  etiqueta: string;
}

export interface ProyectoConfigComercial {
  id: string;
  residencial_id: string;
  montos_reserva: MontoReserva[];
  documentos_requeridos: string[];
  created_at: string;
  updated_at: string;
}

export async function getResidenciales(): Promise<Residencial[]> {
  const { data, error } = await supabase
    .from('residenciales')
    .select('*')
    .is('deleted_at', null)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching residenciales:', error.message);
    return [];
  }

  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    amenidades: (d.amenidades as string[]) || [],
    tipos_proyecto: (d.tipos_proyecto as string[]) || [],
  })) as Residencial[];
}

export async function createResidencial(
  input: Omit<Residencial, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Residencial; error?: string }> {
  const codigo = input.nombre
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .slice(0, 20) + '_' + Date.now().toString().slice(-4);

  const { data, error } = await supabase
    .from('residenciales')
    .insert([{ ...input, codigo }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({ entidad: 'residenciales', entidadId: data.id, accion: 'CREATE' });
  return { success: true, data };
}

export async function updateResidencial(
  id: string,
  updates: Partial<Omit<Residencial, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('residenciales')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({ entidad: 'residenciales', entidadId: id, accion: 'UPDATE', diff: updates });
  return { success: true };
}

export async function deleteResidencial(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('residenciales')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({ entidad: 'residenciales', entidadId: id, accion: 'DELETE' });
  return { success: true };
}

export async function getProyectoConfigComercial(
  residencialId: string
): Promise<ProyectoConfigComercial | null> {
  const { data, error } = await supabase
    .from('proyectos_config_comercial')
    .select('*')
    .eq('residencial_id', residencialId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching config comercial:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    montos_reserva: (data.montos_reserva as MontoReserva[]) || [],
    documentos_requeridos: (data.documentos_requeridos as string[]) || [],
  } as ProyectoConfigComercial;
}

export async function upsertProyectoConfigComercial(
  residencialId: string,
  config: { montos_reserva: MontoReserva[]; documentos_requeridos: string[] }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('proyectos_config_comercial')
    .upsert(
      {
        residencial_id: residencialId,
        montos_reserva: config.montos_reserva,
        documentos_requeridos: config.documentos_requeridos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'residencial_id' }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'proyectos_config_comercial',
    entidadId: residencialId,
    accion: 'UPDATE',
    diff: config,
  });

  return { success: true };
}
