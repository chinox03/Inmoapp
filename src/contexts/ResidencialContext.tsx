import React, { createContext, useContext, useEffect, useState } from 'react';
import { Residencial } from '../types/database.types';
import { useAuth } from './AuthContext';
import { getResidenciales } from '../lib/database';

interface ResidencialContextType {
  selectedResidencial: Residencial | null;
  residenciales: Residencial[];
  setSelectedResidencial: (residencial: Residencial) => void;
  loading: boolean;
}

const ResidencialContext = createContext<ResidencialContextType | undefined>(undefined);

export function ResidencialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedResidencial, setSelectedResidencial] = useState<Residencial | null>(null);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResidenciales = async () => {
      if (!user) {
        setResidenciales([]);
        setSelectedResidencial(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getResidenciales(user);
        setResidenciales(data);

        if (data.length > 0) {
          if (user.rol === 'SUPERADMIN') {
            setSelectedResidencial(data[0]);
          } else if (user.residencial_id) {
            const userResidencial = data.find((r) => r.id === user.residencial_id);
            setSelectedResidencial(userResidencial || data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading residenciales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResidenciales();
  }, [user]);

  return (
    <ResidencialContext.Provider
      value={{
        selectedResidencial,
        residenciales,
        setSelectedResidencial,
        loading,
      }}
    >
      {children}
    </ResidencialContext.Provider>
  );
}

export function useResidencial() {
  const context = useContext(ResidencialContext);
  if (context === undefined) {
    throw new Error('useResidencial must be used within a ResidencialProvider');
  }
  return context;
}
