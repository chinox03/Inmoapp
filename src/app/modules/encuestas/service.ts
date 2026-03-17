import { supabase } from '../../../lib/supabase';
import { Encuesta, RespuestaEncuesta } from './types';

interface DbEncuesta {
  id: string;
  residencial_id: string | null;
  residencial_nombre: string;
  residente_id: string | null;
  residente_nombre: string;
  residente_telefono: string;
  tipo_encuesta: string;
  tipo_encuesta_nombre: string;
  fecha_realizacion: string;
  realizada_por: string;
  duracion_minutos: number;
  respuestas: RespuestaEncuesta[];
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToEncuesta(row: DbEncuesta): Encuesta {
  return {
    id: row.id,
    residencial_id: row.residencial_id || '',
    residencial_nombre: row.residencial_nombre,
    residente_id: row.residente_id || '',
    residente_nombre: row.residente_nombre,
    residente_telefono: row.residente_telefono,
    tipo_encuesta_id: row.tipo_encuesta,
    tipo_encuesta_nombre: row.tipo_encuesta_nombre,
    fecha_realizacion: row.fecha_realizacion,
    realizada_por: row.realizada_por,
    duracion_minutos: row.duracion_minutos,
    respuestas: row.respuestas || [],
    observaciones: row.observaciones || undefined,
  };
}

export async function getEncuestas(): Promise<Encuesta[]> {
  const { data, error } = await supabase
    .from('encuestas')
    .select('*')
    .is('deleted_at', null)
    .order('fecha_realizacion', { ascending: false });

  if (error) {
    console.error('Error fetching encuestas:', error.message);
    return [];
  }

  return (data || []).map(mapDbToEncuesta);
}

export async function addEncuesta(
  encuesta: Omit<Encuesta, 'id'>
): Promise<{ success: boolean; data?: Encuesta; error?: string }> {
  const record: Record<string, unknown> = {
    residencial_nombre: encuesta.residencial_nombre,
    residente_nombre: encuesta.residente_nombre,
    residente_telefono: encuesta.residente_telefono,
    tipo_encuesta: encuesta.tipo_encuesta_id,
    tipo_encuesta_nombre: encuesta.tipo_encuesta_nombre,
    fecha_realizacion: encuesta.fecha_realizacion,
    realizada_por: encuesta.realizada_por,
    duracion_minutos: encuesta.duracion_minutos,
    respuestas: encuesta.respuestas,
    observaciones: encuesta.observaciones || null,
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (encuesta.residencial_id && UUID_REGEX.test(encuesta.residencial_id)) {
    record.residencial_id = encuesta.residencial_id;
  }
  if (encuesta.residente_id && UUID_REGEX.test(encuesta.residente_id)) {
    record.residente_id = encuesta.residente_id;
  }

  const { data, error } = await supabase
    .from('encuestas')
    .insert([record])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapDbToEncuesta(data) };
}

export async function deleteEncuesta(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('encuestas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getEncuestaById(id: string): Promise<Encuesta | null> {
  const { data, error } = await supabase
    .from('encuestas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbToEncuesta(data);
}
