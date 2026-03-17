import { supabase } from '../../../lib/supabase';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management`;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
    'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

export interface UsuarioFromDB {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: string;
  residencial_id: string | null;
  unidad: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  residencial?: { nombre: string } | null;
  email?: string;
}

export async function getUsuarios(): Promise<UsuarioFromDB[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(FUNCTION_URL, { headers });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch users');
  }

  const users = await response.json();

  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

  const emailMap = new Map<string, string>();
  if (authUsers) {
    authUsers.forEach((u: { id: string; email?: string }) => {
      if (u.email) emailMap.set(u.id, u.email);
    });
  }

  return users.map((u: UsuarioFromDB) => ({
    ...u,
    email: emailMap.get(u.id) || u.email || '',
  }));
}

export async function getUsuariosFallback(): Promise<UsuarioFromDB[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, residencial:residenciales(nombre)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    apellido: (p.apellido as string) || '',
    estado: (p.estado as string) || 'activo',
    email: '',
  })) as UsuarioFromDB[];
}

export interface CreateUsuarioPayload {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  rol: string;
  residencial_id?: string;
  unidad?: string;
}

export async function createUsuario(payload: CreateUsuarioPayload): Promise<{ success: boolean; data?: UsuarioFromDB; error?: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, error: result.error || 'Failed to create user' };
  }

  return { success: true, data: result };
}

export interface UpdateUsuarioPayload {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol?: string;
  residencial_id?: string;
  unidad?: string;
  estado?: string;
  email?: string;
  password?: string;
}

export async function updateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<{ success: boolean; data?: UsuarioFromDB; error?: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTION_URL}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, error: result.error || 'Failed to update user' };
  }

  return { success: true, data: result };
}

export async function deleteUsuario(id: string): Promise<{ success: boolean; error?: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTION_URL}/${id}`, {
    method: 'DELETE',
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, error: result.error || 'Failed to delete user' };
  }

  return { success: true };
}
