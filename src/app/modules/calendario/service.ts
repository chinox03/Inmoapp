import { supabase } from '../../../lib/supabase';
import { CalendarEvent } from './types';
import { Profile } from '../../../types/database.types';

export async function getCalendarEvents(user: Profile | null): Promise<CalendarEvent[]> {
  if (!user) return [];

  const events: CalendarEvent[] = [];

  const [reservasResult, mudanzasResult, amonestacionesResult] = await Promise.all([
    supabase
      .from('reservas')
      .select('*, espacio:espacios!reservas_espacio_id_fkey(nombre, residencial_id, residencial:residenciales!espacios_residencial_id_fkey(nombre)), residente:profiles!reservas_residente_id_fkey(nombre, apellido)')
      .order('fecha_reserva', { ascending: false }),
    supabase
      .from('mudanzas')
      .select('*, residencial:residenciales(nombre), residente:profiles!mudanzas_residente_id_fkey(nombre, apellido)')
      .order('fecha', { ascending: false }),
    supabase
      .from('amonestaciones')
      .select('*, residencial:residenciales(nombre), emisor:profiles!amonestaciones_emisor_id_fkey(nombre, apellido), receptor:profiles!amonestaciones_receptor_id_fkey(nombre, apellido)')
      .order('fecha_emision', { ascending: false }),
  ]);

  if (reservasResult.data) {
    for (const r of reservasResult.data) {
      const espacioNombre = r.espacio?.nombre || 'Espacio';
      const residencialNombre = r.espacio?.residencial?.nombre || '';
      const residenteNombre = r.residente
        ? `${r.residente.nombre || ''} ${r.residente.apellido || ''}`.trim()
        : '';

      events.push({
        id: r.id,
        type: 'reserva',
        title: espacioNombre,
        date: r.fecha_reserva,
        startTime: r.hora_inicio || '00:00',
        endTime: r.hora_fin || '23:59',
        details: {
          solicitante: residenteNombre,
          residencial: residencialNombre,
          espacio: espacioNombre,
          observaciones: r.motivo || '',
          estado: r.estado || '',
        },
      });
    }
  }

  if (reservasResult.error) {
    console.error('Error fetching reservas for calendar:', reservasResult.error);
  }

  if (mudanzasResult.data) {
    for (const m of mudanzasResult.data) {
      const residencialNombre = m.residencial?.nombre || '';
      const residenteNombre = m.residente
        ? `${m.residente.nombre || ''} ${m.residente.apellido || ''}`.trim()
        : '';

      events.push({
        id: m.id,
        type: 'mudanza',
        title: `Mudanza - ${residenteNombre || 'Sin asignar'}`,
        date: m.fecha,
        startTime: m.hora || '08:00',
        endTime: addHours(m.hora || '08:00', 4),
        details: {
          solicitante: residenteNombre,
          residencial: residencialNombre,
          tipo: m.tipo || '',
          observaciones: m.observaciones || '',
          estado: m.estado || '',
        },
      });
    }
  }

  if (mudanzasResult.error) {
    console.error('Error fetching mudanzas for calendar:', mudanzasResult.error);
  }

  if (amonestacionesResult.data) {
    for (const a of amonestacionesResult.data) {
      const residencialNombre = a.residencial?.nombre || '';
      const emisorNombre = a.emisor
        ? `${a.emisor.nombre || ''} ${a.emisor.apellido || ''}`.trim()
        : '';
      const fechaEmision = a.fecha_emision ? a.fecha_emision.split('T')[0] : '';
      const horaEmision = a.fecha_emision
        ? a.fecha_emision.split('T')[1]?.substring(0, 5) || '00:00'
        : '00:00';

      if (fechaEmision) {
        events.push({
          id: a.id,
          type: 'amonestacion',
          title: a.tipo || 'Amonestacion',
          date: fechaEmision,
          startTime: horaEmision,
          endTime: addMinutes(horaEmision, 30),
          details: {
            solicitante: emisorNombre,
            residencial: residencialNombre,
            estado: a.estado || '',
            observaciones: a.descripcion || '',
          },
        });
      }
    }
  }

  if (amonestacionesResult.error) {
    console.error('Error fetching amonestaciones for calendar:', amonestacionesResult.error);
  }

  return events;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newH = Math.min(h + hours, 23);
  return `${String(newH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  let totalMinutes = (h || 0) * 60 + (m || 0) + minutes;
  totalMinutes = Math.min(totalMinutes, 23 * 60 + 59);
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
