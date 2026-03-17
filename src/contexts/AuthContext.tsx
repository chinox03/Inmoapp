import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/database.types';
import { getCurrentUser, signIn as authSignIn, signOut as authSignOut } from '../lib/auth';
import { logAuditEvent } from '../lib/audit';
import { DEV_MODE_ENABLED, DEV_MOCK_USER } from '../config/devMode';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!DEV_MODE_ENABLED);

  const loadUser = async () => {
    if (DEV_MODE_ENABLED) {
      setUser(DEV_MOCK_USER);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DEV_MODE_ENABLED) {
      setUser(DEV_MOCK_USER);
      setLoading(false);
      return;
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        (async () => {
          await loadUser();
          if (session?.user) {
            await logAuditEvent({
              userId: session.user.id,
              entidad: 'auth',
              entidadId: session.user.id,
              accion: 'LOGIN',
            });
          }
        })();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEV_MODE_ENABLED) {
      setUser(DEV_MOCK_USER);
      return;
    }

    await authSignIn(email, password);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      await authSignOut();
      throw new Error('No se encontró el perfil de usuario');
    }
    setUser(currentUser);
  };

  const signOut = async () => {
    if (DEV_MODE_ENABLED) {
      setUser(null);
      return;
    }

    await authSignOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (DEV_MODE_ENABLED) {
      setUser(DEV_MOCK_USER);
      return;
    }

    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
