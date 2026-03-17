import { supabase } from './supabase';
import { User, UserRole } from '../types/database.types';

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) {
    throw new AuthError(profileError.message, 403);
  }

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    email: authUser.email || '',
  } as User;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError('Authentication required', 401);
  }

  return user;
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireAuth();

  if (!roles.includes(user.rol)) {
    throw new AuthError('Insufficient permissions', 403);
  }

  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError(error.message, 401);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthError(error.message);
  }
}
