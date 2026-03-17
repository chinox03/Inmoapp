import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, User, Phone } from 'lucide-react';
import { Resident } from './types';
import { supabase } from '../../../lib/supabase';

interface ResidentSearchProps {
  value: string;
  onChange: (resident: Resident | null) => void;
  error?: string;
}

export function ResidentSearch({ value, onChange, error }: ResidentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, unidad, residencial_id, residencial:residenciales(nombre), telefono')
      .eq('rol', 'RESIDENTE')
      .eq('estado', 'activo')
      .order('nombre', { ascending: true })
      .limit(200);

    if (!err && data) {
      setResidents(data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        name: `${r.nombre || ''} ${r.apellido || ''}`.trim(),
        unitNumber: (r.unidad as string) || '',
        residencialId: (r.residencial_id as string) || '',
        residencialName: (r.residencial as Record<string, unknown>)?.nombre as string || '',
        phone: (r.telefono as string) || undefined,
      })));
    }
    setLoading(false);
  };

  const selectedResident = useMemo(() => {
    return residents.find(r => r.id === value);
  }, [value, residents]);

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;

    const term = searchTerm.toLowerCase();
    return residents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(term) ||
        resident.unitNumber.toLowerCase().includes(term) ||
        resident.residencialName.toLowerCase().includes(term)
    );
  }, [searchTerm, residents]);

  const handleSelectResident = (resident: Resident) => {
    onChange(resident);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {!selectedResident ? (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={loading ? 'Cargando residentes...' : 'Buscar por unidad o nombre del residente...'}
              disabled={loading}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                error ? 'border-red-300' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            />
          </div>

          {isOpen && filteredResidents.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredResidents.map((resident) => (
                  <button
                    key={resident.id}
                    type="button"
                    onClick={() => handleSelectResident(resident)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {resident.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {resident.unitNumber} {resident.residencialName ? `- ${resident.residencialName}` : ''}
                          </p>
                        </div>
                        {resident.phone && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{resident.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {isOpen && searchTerm && filteredResidents.length === 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  No se encontraron residentes
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedResident.name}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedResident.unitNumber}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                {selectedResident.residencialName}
              </p>
              {selectedResident.phone && (
                <div className="flex items-center space-x-2 mt-2">
                  <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedResident.phone}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
