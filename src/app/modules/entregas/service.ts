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

export interface TicketItemPendiente {
  id: string;
  titulo: string;
  categoria: string;
  razon: string;
  resuelto: boolean;
}

export interface TicketHistorialEntry {
  id: string;
  tipo: 'estado' | 'asignacion' | 'comentario' | 'creacion' | 'resolucion';
  timestamp: string;
  usuario: string;
  from?: string;
  to?: string;
  notas?: string;
}

export interface EntregaTicketDB {
  id: string;
  entrega_id: string;
  numero_ticket: string | null;
  unidad: string;
  residente_nombre: string;
  estado: 'open' | 'in_progress' | 'resolved' | 'closed' | 'assigned';
  prioridad: 'low' | 'medium' | 'high';
  items_pendientes: (TicketItemPendiente | string)[];
  responsable_id: string | null;
  responsable_nombre: string;
  equipo_asignado: string;
  fecha_compromiso: string | null;
  fecha_resolucion: string | null;
  descripcion: string;
  historial: TicketHistorialEntry[];
  resuelto_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComentario {
  id: string;
  ticket_id: string;
  autor_id: string | null;
  autor_nombre: string;
  contenido: string;
  tipo: string;
  created_at: string;
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

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const rnd = Math.floor(Math.random() * 9000 + 1000);
  return `TKT-${year}-${rnd}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function createEntregaTicket(
  ticket: {
    entrega_id: string;
    unidad: string;
    residente_nombre: string;
    estado: string;
    prioridad: 'low' | 'medium' | 'high';
    items_pendientes: TicketItemPendiente[];
    descripcion?: string;
  },
  user: Profile | null
) {
  // Fetch SLA to auto-suggest compromise date
  const { data: config } = await supabase
    .from('configuracion_entregas')
    .select('sla_por_prioridad')
    .maybeSingle();

  const sla = (config?.sla_por_prioridad as Record<string, number>) || { high: 3, medium: 7, low: 14 };
  const slaDays = sla[ticket.prioridad] ?? 7;
  const fechaCompromiso = addDays(new Date(), slaDays).toISOString().split('T')[0];

  const numeroTicket = generateTicketNumber();

  const historial: TicketHistorialEntry[] = [
    {
      id: crypto.randomUUID(),
      tipo: 'creacion',
      timestamp: new Date().toISOString(),
      usuario: user?.nombre || 'Sistema',
      notas: `Ticket creado automaticamente desde entrega con ${ticket.items_pendientes.length} items pendientes.`,
    },
  ];

  const { data, error } = await supabase
    .from('entregas_tickets')
    .insert([{
      ...ticket,
      numero_ticket: numeroTicket,
      fecha_compromiso: fechaCompromiso,
      descripcion: ticket.descripcion || '',
      historial,
    }])
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

export async function updateEntregaTicket(
  id: string,
  updates: Partial<{
    estado: string;
    prioridad: string;
    responsable_id: string | null;
    responsable_nombre: string;
    equipo_asignado: string;
    fecha_compromiso: string | null;
    fecha_resolucion: string | null;
    descripcion: string;
    items_pendientes: TicketItemPendiente[];
    historial: TicketHistorialEntry[];
    resuelto_en: string | null;
  }>,
  user: Profile | null
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('entregas_tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (user) {
    await logAuditEvent({
      userId: user.id,
      entidad: 'entregas_tickets',
      entidadId: id,
      accion: 'UPDATE',
      diff: updates,
    });
  }

  return { success: true };
}

export async function getTicketComentarios(ticketId: string): Promise<TicketComentario[]> {
  const { data, error } = await supabase
    .from('entregas_ticket_comentarios')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comentarios:', error);
    return [];
  }

  return (data || []) as TicketComentario[];
}

export async function addTicketComentario(
  ticketId: string,
  contenido: string,
  user: Profile | null,
  tipo: string = 'comentario'
): Promise<{ success: boolean; data?: TicketComentario; error?: string }> {
  const { data, error } = await supabase
    .from('entregas_ticket_comentarios')
    .insert([{
      ticket_id: ticketId,
      autor_id: user?.id || null,
      autor_nombre: user?.nombre || 'Sistema',
      contenido,
      tipo,
    }])
    .select()
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as TicketComentario };
}

export async function getUsuariosAsignables(): Promise<{ id: string; nombre: string; rol: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, rol')
    .in('rol', ['SUPERADMIN', 'ADMIN_RESIDENCIAL', 'IT', 'SEGURIDAD'])
    .order('nombre');

  if (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }

  return (data || []) as { id: string; nombre: string; rol: string }[];
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
