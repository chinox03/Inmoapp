import { supabase } from '../../../lib/supabase';
import { z } from 'zod';

export interface NegocioActivity {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  usuario: string;
}

export interface NegocioNote {
  id: string;
  contenido: string;
  fecha: string;
  hora: string;
  usuario: string;
}

export interface Negocio {
  id: string;
  prospecto_id?: string;
  prospecto_nombre: string;
  email: string;
  telefono: string;
  unidad: string;
  proyecto: string;
  tipo_interes: string;
  etapa: string;
  valor: number;
  actividades: NegocioActivity[];
  notas: NegocioNote[];
  created_at: string;
  updated_at: string;
}

const ETAPAS_VALIDAS = [
  'Interesado',
  'Contactado',
  'Visita Agendada',
  'Negociacion',
  'Cierre',
] as const;

export const negocioSchema = z.object({
  prospecto_id: z.string().uuid().optional(),
  prospecto_nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email no valido'),
  telefono: z.string().min(1, 'El telefono es requerido'),
  unidad: z.string().default(''),
  proyecto: z.string().min(1, 'El proyecto es requerido'),
  tipo_interes: z.string().min(1, 'El tipo de interes es requerido'),
  etapa: z.string().default('Interesado'),
  valor: z.number().min(0, 'El valor no puede ser negativo').default(0),
  actividades: z.array(z.any()).default([]),
  notas: z.array(z.any()).default([]),
});

export type NegocioFormData = z.infer<typeof negocioSchema>;

export async function getNegocios(): Promise<Negocio[]> {
  const { data, error } = await supabase
    .from('negocios')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching negocios:', error.message);
    return [];
  }

  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    actividades: (d.actividades as NegocioActivity[]) || [],
    notas: (d.notas as NegocioNote[]) || [],
  })) as Negocio[];
}

export async function createNegocio(
  input: NegocioFormData
): Promise<{ success: boolean; data?: Negocio; error?: string }> {
  const parsed = negocioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const record = { ...parsed.data };
  if (!record.prospecto_id) {
    delete record.prospecto_id;
  }

  const { data, error } = await supabase
    .from('negocios')
    .insert([record])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateNegocio(
  id: string,
  updates: Partial<Negocio>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('negocios')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteNegocio(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('negocios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createNegocioFromProspecto(
  prospectoId: string,
  prospectoNombre: string,
  email: string,
  telefono: string,
  interes: string,
  proyecto: string
): Promise<{ success: boolean; data?: Negocio; error?: string }> {
  const isValidUuid = UUID_REGEX.test(prospectoId);

  return createNegocio({
    prospecto_id: isValidUuid ? prospectoId : undefined,
    prospecto_nombre: prospectoNombre,
    email,
    telefono,
    unidad: '',
    proyecto,
    tipo_interes: interes,
    etapa: 'Interesado',
    valor: 0,
    actividades: [],
    notas: [],
  });
}
