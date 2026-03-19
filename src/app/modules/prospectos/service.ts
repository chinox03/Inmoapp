import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';
import { z } from 'zod';

export interface Prospecto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  origen: string;
  interes: string;
  proyecto: string;
  estado: string;
  ultimo_contacto?: string;
  created_at: string;
  updated_at: string;
}

export const prospectoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email no valido'),
  telefono: z.string().min(1, 'El telefono es requerido'),
  origen: z.string().min(1, 'El origen es requerido'),
  interes: z.string().min(1, 'El tipo de interes es requerido'),
  proyecto: z.string().min(1, 'El proyecto es requerido'),
  estado: z.string().default('Nuevo'),
  ultimo_contacto: z.string().optional(),
});

export type ProspectoFormData = z.infer<typeof prospectoSchema>;

export async function getProspectos(): Promise<Prospecto[]> {
  const { data, error } = await supabase
    .from('prospectos')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prospectos:', error.message);
    return [];
  }

  return data || [];
}

export async function createProspecto(
  input: ProspectoFormData
): Promise<{ success: boolean; data?: Prospecto; error?: string }> {
  const parsed = prospectoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('prospectos')
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'prospectos',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data };
}

export async function updateProspecto(
  id: string,
  updates: Partial<Prospecto>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('prospectos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'prospectos',
    entidadId: id,
    accion: 'UPDATE',
    diff: updates,
  });

  return { success: true };
}

export async function deleteProspecto(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('prospectos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    entidad: 'prospectos',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}
