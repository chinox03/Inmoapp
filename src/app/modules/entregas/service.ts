import { supabase } from '../../../lib/supabase';
import { Profile } from '../../../types/database.types';
import { logAuditEvent } from '../../../lib/audit';

export interface EntregaDB {
  id: string;
  residencial_id: string | null;
  unidad: string;
  residente_id: string | null;
  residente_nombre: string;
  fecha_entrega: string;
  checklist: any[];
  fotos: any[];
  firma: string | null;
  observaciones_generales: string;
  estado: 'draft' | 'completed' | 'with_issues';
  creado_por: string | null;
  created_at: string;
  updated_at: string;
  residencial?: { nombre: string } | null;
  creador?: { nombre: string } | null;
}

export interface EntregaTicketDB {
  id: string;
  entrega_id: string;
  unidad: string;
  residente_nombre: string;
  estado: 'open' | 'in_progress' | 'resolved';
  prioridad: 'low' | 'medium' | 'high';
  items_pendientes: string[];
  resuelto_en: string | null;
  created_at: string;
  updated_at: string;
}

export async function getEntregas(user: Profile | null): Promise<EntregaDB[]> {
  if (!user) return [];

  const { data, error } = await supabase
    .from('entregas')
    .select('*, residencial:residenciales(nombre), creador:profiles!entregas_creado_por_fkey(nombre)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entregas:', error);
  }

  return data || [];
}

export async function getEntregaTickets(): Promise<EntregaTicketDB[]> {
  const { data, error } = await supabase
    .from('entregas_tickets')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entregas_tickets:', error);
  }

  return data || [];
}

export async function createEntrega(
  entrega: {
    residencial_id: string | null;
    unidad: string;
    residente_id: string | null;
    residente_nombre: string;
    fecha_entrega: string;
    checklist: any[];
    fotos: any[];
    firma: string | null;
    observaciones_generales: string;
    estado: string;
    creado_por: string | null;
  },
  user: Profile | null
) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('entregas')
    .insert([entrega])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating entrega:', error);
    return { success: false, error: error.message };
  }

  if (data) {
    await logAuditEvent({
      residencialId: entrega.residencial_id || undefined,
      userId: user.id,
      entidad: 'entregas',
      entidadId: data.id,
      accion: 'CREATE',
    });
  }

  return { success: true, data };
}

export async function createEntregaTicket(
  ticket: {
    entrega_id: string;
    unidad: string;
    residente_nombre: string;
    estado: string;
    prioridad: string;
    items_pendientes: string[];
  },
  user: Profile | null
) {
  const { data, error } = await supabase
    .from('entregas_tickets')
    .insert([ticket])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating entrega ticket:', error);
    return { success: false, error: error.message };
  }

  if (data && user) {
    await logAuditEvent({
      userId: user.id,
      entidad: 'entregas_tickets',
      entidadId: data.id,
      accion: 'CREATE',
    });
  }

  return { success: true, data };
}

export async function deleteEntrega(
  id: string,
  user: Profile | null
): Promise<{ success: boolean; error?: string }> {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from('entregas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting entrega:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'entregas',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}

export async function getResidenciales(): Promise<{ id: string; nombre: string }[]> {
  const { data, error } = await supabase
    .from('residenciales')
    .select('id, nombre')
    .order('nombre');

  if (error) {
    console.error('Error fetching residenciales:', error);
  }

  return data || [];
}

export async function getResidentes(): Promise<{ id: string; nombre: string; apellido: string; telefono: string; unidad: string | null; residencial_id: string | null }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, apellido, telefono, unidad, residencial_id')
    .eq('rol', 'RESIDENTE')
    .eq('estado', 'activo')
    .order('nombre');

  if (error) {
    console.error('Error fetching residentes:', error);
  }

  return data || [];
}
