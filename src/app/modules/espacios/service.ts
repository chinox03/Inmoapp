import { supabase } from '../../../lib/supabase';
import { shouldBypassFilters } from '../../../config/devMode';
import { Profile } from '../../../types/database.types';
import { fetchWithFilter, createRecord, updateRecord } from '../../../lib/dataService';

export interface Espacio {
  id: string;
  residencial_id: string;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  amueblado: boolean;
  electricidad: boolean;
  dias_disponibles: string[];
  horas_disponibles: string[];
  estado: string;
  created_at: string;
  updated_at: string;
}

export async function getEspacios(
  user: Profile | null,
  residencialId?: string
): Promise<Espacio[]> {
  const data = await fetchWithFilter<Espacio>('espacios', user, residencialId);

  if (!data || data.length === 0) {
    return [
      {
        id: 'esp1',
        residencial_id: 'demo-residencial',
        nombre: 'Salon Social',
        descripcion: 'Amplio salon para eventos sociales con capacidad para 50 personas',
        capacidad: 50,
        amueblado: true,
        electricidad: true,
        dias_disponibles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
        horas_disponibles: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'esp2',
        residencial_id: 'demo-residencial',
        nombre: 'Area de BBQ',
        descripcion: 'Area de parrilladas con 3 grills disponibles',
        capacidad: 30,
        amueblado: false,
        electricidad: true,
        dias_disponibles: ['sabado', 'domingo'],
        horas_disponibles: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'esp3',
        residencial_id: 'demo-residencial',
        nombre: 'Piscina',
        descripcion: 'Piscina semi-olimpica con area para ninos',
        capacidad: 40,
        amueblado: false,
        electricidad: false,
        dias_disponibles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
        horas_disponibles: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return data;
}

export async function createEspacio(
  espacio: Omit<Espacio, 'id' | 'created_at' | 'updated_at'>,
  user: Profile | null
) {
  return createRecord<Espacio>('espacios', espacio, user);
}

export async function updateEspacio(
  id: string,
  updates: Partial<Espacio>,
  user: Profile | null
) {
  return updateRecord<Espacio>('espacios', id, updates, user);
}

export async function deleteEspacio(id: string, user: Profile | null) {
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const { error } = await supabase
    .from('espacios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
