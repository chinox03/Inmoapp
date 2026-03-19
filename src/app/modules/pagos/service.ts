import { supabase } from '../../../lib/supabase';
import { Pago, User } from '../../../types/database.types';
import { logAuditEvent } from '../../../lib/audit';

export async function getPagos() {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, residente:profiles!pagos_residente_id_fkey(nombre)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando pagos:', error);
    }

    return data || [];
  } catch (err) {
    console.error('Error inesperado:', err);
    return [];
  }
}

export async function createPago(
  pagoData: Partial<Pago>,
  user: User
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { data, error } = await supabase
    .from('pagos')
    .insert(pagoData)
    .select()
    .single();

  if (error) {
    console.error('Error creating pago:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId: pagoData.residencial_id,
    userId: user.id,
    entidad: 'pagos',
    entidadId: data.id,
    accion: 'CREATE',
  });

  return { success: true, data };
}

export async function approvePayment(
  id: string,
  approved: boolean,
  observaciones: string | undefined,
  user: User
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('pagos')
    .update({
      estado: approved ? 'aprobado' : 'rechazado',
      aprobado_por: user.id,
      observaciones,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error approving payment:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    residencialId: data.residencial_id,
    userId: user.id,
    entidad: 'pagos',
    entidadId: id,
    accion: 'STATUS_CHANGE',
    diff: { estado: approved ? 'aprobado' : 'rechazado' },
  });

  return { success: true };
}

export async function deletePago(
  id: string,
  user: User
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pagos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting pago:', error);
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    userId: user.id,
    entidad: 'pagos',
    entidadId: id,
    accion: 'DELETE',
  });

  return { success: true };
}

export async function uploadComprobanteToSupabase(
  file: File,
  pagoId: string
): Promise<{ url: string | null; error?: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pagoId}-${Date.now()}.${fileExt}`;
  const filePath = `comprobantes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment_proofs')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from('payment_proofs').getPublicUrl(filePath);

  return { url: data.publicUrl };
}
