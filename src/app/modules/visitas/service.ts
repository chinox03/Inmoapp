import { supabase } from '../../../lib/supabase';
import { logAuditEvent } from '../../../lib/audit';
import { Visit, VisitFormData } from './types';

interface DbVisit {
  id: string;
  residencial_id: string | null;
  visitor_first_name: string;
  visitor_last_name: string;
  visitor_document_number: string;
  residente_id: string | null;
  residente_nombre: string;
  unidad: string;
  residencial_nombre: string;
  motivo: string;
  registrado_por: string | null;
  hora_entrada: string;
  hora_salida: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

function mapDbToVisit(row: DbVisit): Visit {
  return {
    id: row.id,
    timestamp: row.hora_entrada,
    visitorFirstName: row.visitor_first_name,
    visitorLastName: row.visitor_last_name,
    visitorDocumentNumber: row.visitor_document_number,
    residentId: row.residente_id || '',
    residentName: row.residente_nombre,
    unitNumber: row.unidad,
    residencialName: row.residencial_nombre,
    visitPurpose: row.motivo,
    registeredBy: row.registrado_por || '',
    exitTime: row.hora_salida || undefined,
    status: row.estado as 'active' | 'completed',
  };
}

export async function getVisits(): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .is('deleted_at', null)
    .order('hora_entrada', { ascending: false });

  if (error) {
    console.error('Error fetching visitas:', error.message);
    return [];
  }

  return (data || []).map(mapDbToVisit);
}

export async function getActiveVisits(): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .is('deleted_at', null)
    .eq('estado', 'active')
    .order('hora_entrada', { ascending: false });

  if (error) {
    console.error('Error fetching active visitas:', error.message);
    return [];
  }

  return (data || []).map(mapDbToVisit);
}

export async function addVisit(
  formData: VisitFormData & {
    residentName: string;
    unitNumber: string;
    residencialName?: string;
  },
  registeredBy: string
): Promise<{ success: boolean; data?: Visit; error?: string }> {
  const record: Record<string, unknown> = {
    visitor_first_name: formData.visitorFirstName,
    visitor_last_name: formData.visitorLastName,
    visitor_document_number: formData.visitorDocumentNumber,
    residente_nombre: formData.residentName,
    unidad: formData.unitNumber,
    residencial_nombre: formData.residencialName || '',
    motivo: formData.visitPurpose,
    registrado_por: registeredBy || null,
    estado: 'active',
    hora_entrada: new Date().toISOString(),
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (formData.residentId && UUID_REGEX.test(formData.residentId)) {
    record.residente_id = formData.residentId;
  }

  const { data, error } = await supabase
    .from('visitas')
    .insert([record])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: registeredBy,
    entidad: 'visitas',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data: mapDbToVisit(data) };
}

export async function markVisitAsCompleted(
  visitId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('visitas')
    .update({
      estado: 'completed',
      hora_salida: new Date().toISOString(),
    })
    .eq('id', visitId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getVisitById(visitId: string): Promise<Visit | null> {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .eq('id', visitId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbToVisit(data);
}

export async function deleteVisit(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('visitas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId,
    entidad: 'visitas',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}

export async function getVisitStats(): Promise<{
  total: number;
  active: number;
  todayTotal: number;
  todayActive: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: total } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: active } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('estado', 'active');

  const { count: todayTotal } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .gte('hora_entrada', today.toISOString());

  const { count: todayActive } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('estado', 'active')
    .gte('hora_entrada', today.toISOString());

  return {
    total: total || 0,
    active: active || 0,
    todayTotal: todayTotal || 0,
    todayActive: todayActive || 0,
  };
}
