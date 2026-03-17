import { supabase } from './supabase';
import { AuditAction } from '../types/database.types';

interface AuditEventParams {
  residencialId?: string;
  userId?: string;
  entidad: string;
  entidadId: string;
  accion: AuditAction;
  diff?: Record<string, any>;
}

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const { error } = await supabase.from('audit_log').insert({
      residencial_id: params.residencialId || null,
      user_id: params.userId || null,
      entidad: params.entidad,
      entidad_id: params.entidadId,
      accion: params.accion,
      diff: params.diff || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });

    if (error) {
      console.error('Audit log error:', error.message);
    }
  } catch {
    // Audit logging should never break the main flow
  }
}
